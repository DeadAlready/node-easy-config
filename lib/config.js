// Copyright 2012 Karl Düüna. All rights reserved.

'use strict';

var utils = require('./utils');
var fs = require('fs');
var environment = process.env;
var path = require('path');
var map;
var filePath;
var type;
var buffer = {};
var original = false;
var Options;
var staticEnv;
var cjson = null;

try {
    // See if we have cjson
    cjson = require('cjson');
} catch(e) {
    cjson = null;
}

// Try to load environment settings from file
try {
    var staticEnvPath = path.join(process.cwd(), 'env.json');
	staticEnv = cjson ? cjson.load(staticEnvPath) : require(staticEnvPath);
} catch (e) {
	staticEnv = {};
}

if(staticEnv.setEnv && staticEnv.env) {
    switch(staticEnv.env) {
        case 'pro':
            process.env.NODE_ENV = 'production';
            break;
        case 'dev':
            process.env.NODE_ENV = 'development';
            break;
        default:
            process.env.NODE_ENV = staticEnv.env;
            break;
    }
}

/**
 * Function for getting the local cached config foldermap
 *
 * @param {Object} options - options to load the map with
 */
function _getMap(options, force) {
	options = options || Options;
	if (map && options.folder === filePath && options.type === type && !force) {
		return map;
	}
	type = options.type;
	filePath = options.folder;
	try {
		map = utils.map({path: filePath, type: type});
		return map;
	} catch (e) {
		console.log(e);
		return false;
	}
}
/**
 * Function for loading a config file and extending the configuration with it
 *
 * @params {Object} file foldermap file object
 * @params {Object} object to extend
 * @params {Integer} [ns] whether to load in separate namespace
 * @return {Object}
 */
function _loadConfigFile(file, config, ns) {
  function loadFile(path) {
    return (path.indexOf('.json') !== -1 && cjson) ? cjson.load(path) : require(path);
  }

  if (require.cache[file._path]) {
    delete require.cache[file._path];
  }

	if (file._ns === '' || !ns) {
		return utils.extend(config || {}, loadFile(file._path));
	}

	var obj = {};
	obj[file._ns] = loadFile(file._path);
	if (ns === 2) {
		obj = {ns: obj};
	}
	return utils.extend(config || {}, obj);
}

/**
 * Function for getting the namespace from file._base
 *
 * @param {String} name - base name of file
 * @return {String}
 */
function _getNS(name) {
	return name.replace('config.', '');
}
/**
 * Function for loading command line options
 *
 * @param config {Object} object to extend with results
 * @return {Object}
 */
function _loadCommandLine(config) {

	var cmdLine = process.argv.slice(0).splice(2);

    cmdLine.forEach(function (val) {
        if (val.indexOf('--') !== 0) {
            return;
        }
        var tmp = val.substr(2).split('=');

        var index = tmp.shift();
        var value = tmp.shift();
		if(value === undefined) {
			value = true;
		} else {
			value = utils.typeCast(value);
		}
        utils.setIndex(config, index, value);
    });
	return config;
}

/**
 * Function for loading environment variables
 *
 * @param config {Object} object to extend with results
 * @param options {Object} options used in parsing
 * @return {Object}
 */
function _loadEnvironment(config, options) {

    Object.keys(environment).filter(function (key) {
        return key.indexOf(options.envPrefix) === 0 && key !== 'NODE_ENV';
    }).forEach(function (key) {
        var index = key.replace(options.envPrefix, '').replace(/\_/g, '.');
        var value = utils.typeCast(environment[key]);
        utils.setCaseInsensitiveIndex(config, index, value);
    });

    return config;
}

/**
 * Function for loading configuration based on options
 *
 * @param options {Object}	[options={}] configuration loading options
 * @param force {Boolean}	[force=false] whether to force reload config files
 * @return {Object}
 */
function _loadConfig(options, force) {
	if (!options) {
		options = utils.clone(staticEnv);
	} else {
		options = utils.extend(staticEnv, options);
	}

	if (options.folder) {
		options.folder = path.resolve(options.folder);
	}

	options = utils.extend({
		folder: path.join(process.cwd(), 'config'),
		cmd: true,
        envVars: true,
		envs: ['dev', 'pro'],
		env: 'dev',
		type: 'json',
		ns: true,
		pre: {},
        envPrefix: 'NODE_'
	}, options);

    //See if env is set in NODE_ENV
    if(process.env.NODE_ENV) {
        if(process.env.NODE_ENV === 'production') {
            options.env = 'pro';
        } else if (process.env.NODE_ENV === 'debug') {
            options.env = 'dev';
        } else {
            options.env = process.env.NODE_ENV;
        }
    }

	var cmdLine = process.argv.slice(0).splice(2);
	// Overwrite settings from command line
    cmdLine.forEach(function (val) {
        if (val.charAt(0) === '-' && val.charAt(1) !== '-') {
            var tmp = val.substr(1).split('=');
            options[tmp[0]] = (tmp[1] === undefined ? true : utils.typeCast(tmp[1]));
        }
    });

	// Fix variables
	options.folder = utils.fixPath(options.folder);
	options.envs.push(options.env);
	options.ns = options.ns ? 2 : 1;
	options.type = options.type.toLowerCase();

	Options = options;
	// Get map
	var map = _getMap(options, force);
	if (!map) {
		map = {};
	}

	// Add namespaces
	var keys = Object.keys(map);
	keys.forEach(function (key) {
		Object.defineProperty(map[key], '_ns', {value: _getNS(map[key]._base)});
	});
	// Get files array
	var files = Object.keys(map);
	var config = utils.clone(options.pre);

	// Load main config first
	var main = files.indexOf('config.' + options.type);
	if (main >= 0) {
		config = _loadConfigFile(map['config.' + options.type], config);
		delete files[main];
	}

	// Load all config files except environment config
	files.forEach(function (f) {
		if (options.envs.indexOf(map[f]._ns) < 0) {
			config = _loadConfigFile(map[f], config, options.ns);
		}
	});

	// Load environment config last
	var env = files.indexOf('config.' + options.env + '.' + options.type);
	if (env >= 0) {
		config = _loadConfigFile(map['config.' + options.env + '.' + options.type], config);
		delete files[env];
	}

	// Load environment variables
	if (options.envVars) {
		config = _loadEnvironment(config, options);
	}

	// Load command line variables
	if (options.cmd) {
		config = _loadCommandLine(config);
	}

	options.ns = (options.ns === 2);

	return utils.extend(config, buffer);
}

function _loadOriginal() {
	var self = this;
    Object.keys(self).forEach(function (key) {
		delete self[key];
	});

    Object.keys(module.exports).forEach(function (key) {
		delete module.exports[key];
	});

    Object.keys(original).forEach(function (key) {
		self[key] = module.exports[key] = original[key];
	});

	return self;
}

function isEnvironment(env) {
	if(Array.isArray(env)) {
		return env.indexOf(Options.env) !== -1;
	}
	return Options.env === env;
}

function _addFunctions(config) {

	Object.defineProperty(config, 'loadConfig', {
		value: configuration,
		enumerable: false,
		writable: false
	});

	Object.defineProperty(config, 'modify', {
		value: function (o) {
			if (!original) {
				original = utils.clone(this);
			}
			buffer = utils.extend(buffer, o);
			utils.extend(module.exports, o, true);
			return utils.extend(this, o, true);
		},
		enumerable: false,
		writable: false
	});

	Object.defineProperty(config, 'unmodify', {
		value: function () {
			buffer = {};
			return _loadOriginal.call(this);
		},
		enumerable: false,
		writable: false
	});

	Object.defineProperty(config, 'writeConfigFile', {
		value: function (name, object) {
			var m = _getMap();
			if (!m) {
				return false;
			}
			name = name.indexOf('.' + Options.type) === -1 ? 'config.' + name + '.' + Options.type : name;

            var data = JSON.stringify(object, null, '	');
            if(Options.type === 'js') {
                data = 'module.exports = ' + data;
            }

            fs.writeFileSync(path.join(m._root, name), data);
			original = configuration(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'changeConfigFile', {
		value: function (name, object) {
			var m = _getMap();
			if (!m) {
				return false;
			}
			name = m[name] ? name : 'config.' + name + '.' + Options.type;
			if (!m[name]) {
				return false;
			}

			var o = _loadConfigFile(m[name]);
			object = utils.extend(o, object);
            var data = JSON.stringify(object, null, '	');
            if (Options.type === 'js') {
                data = 'module.exports = ' + data;
            }
			fs.writeFileSync(m[name]._path, data);

			original = configuration(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'deleteConfigFile', {
		value: function (name) {
			var m = _getMap();
			if (!m) {
				return false;
			}
			name = m[name] ? name : 'config.' + name + '.' + Options.type;
			if (!m[name]) {
				return false;
			}
            fs.unlinkSync(m[name]._path);

			original = configuration(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'extend', {
		value: function (o, e, noClone) {
			if (e !== undefined) {
				return utils.extend(o, e, noClone);
			}
			return _addFunctions(utils.extend(this, o));
		},
		enumerable: false,
		writable: false
	});

	Object.defineProperty(config, 'getDefinedOptions', {
		value: function () {
			return utils.clone(Options);
		},
		enumerable: false,
		writable: false
	});

	Object.defineProperty(config, 'isEnvironment', {
		value: isEnvironment,
		enumerable: false,
		writable: false
	});

    Object.defineProperty(config, 'isProduction', {
        value: function () {
            return isEnvironment(['pro','production']);
        },
        enumerable: false,
        writable: false
    });

	return config;
}

/**
 * Function for reloading config with options,
 * will return reference to itself with configuration properties
 *
 * @param options {Object}	[options={}] configuration loading options
 * @param force {Boolean}	[force=false] wheter to force reload config files
 * @return {Object}
 */
function configuration(options, force) {
	var config = _loadConfig(options, force);
	if (!config) {
		return false;
	}

	return _addFunctions(config);
}

module.exports = configuration();