// Copyright 2012 Karl Düüna. All rights reserved.

'use strict';

var foldermap = require('foldermap');
var utils = require('./utils');
var environment = process.argv.slice(0).splice(2);
var path = require('path');
var map;
var filePath;
var type;
var buffer = {};
var original = false;
var Options;

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
		map = foldermap.map({path: filePath, type: type});
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
	if (file._ns === '' || !ns) {
		return utils.extend(config || {}, JSON.parse(file._content));
	}

	var obj = {};
	obj[file._ns] = JSON.parse(file._content);
	if (ns === 2) {
		obj = {'ns': obj};
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
	var env = {};

	function typeCheck(item) {
		if (item === 'false') {
			return false;
		}
		if (item === 'true') {
			return true;
		}
		return item;
	}
	var i, c;
	for (i = 0, c = environment.length; i < c; i++) {

		if (environment[i].indexOf('--') === 0) {
			var tmp = environment[i].substr(2).split('=');

			var arr = tmp.shift().split('.');
			var temp;
			if (arr.length > 1) {
				var temp2 = {};
				temp = {};
				temp[arr[arr.length - 1]] = tmp.join('=');
				var l, m;
				for (l = arr.length - 2, m = 0; l > m; l--) {
					temp2[arr[l]] = typeCheck(temp);
					temp = temp2;
					temp2 = {};
				}
			} else {
				temp = tmp.join('=');
			}
			env[arr[0]] = typeCheck(temp);
			continue;
		}
	}
	return utils.extend(config, env);
}

/**
 * Function for loading configuration based on options
 *
 * @param options {Object}	[options={}] configuration loading options
 * @param force {Boolean}	[force=false] wheter to force reload config files
 * @return {Object}
 */
function _loadConfig(options, force) {
	if (!options) {
		options = {};
	}
	if (options.folder) {
		options.folder = path.resolve(options.folder);
	}

	options = utils.extend({
		folder: process.cwd() + path.sep + 'config',
		cmd: true,
		envs: ['dev', 'pro'],
		env: 'dev',
		type: 'json',
		ns: true,
		pre: {}
	}, options);

	// Overwrite settings from command line
	var i, c;
	for (i = 0, c = environment.length; i < c; i++) {
		if (environment[i].charAt(0) === '-' && environment[i].charAt(1) !== '-') {
			var tmp = environment[i].substr(1).split('=');
			options[tmp[0]] = (tmp[1] === 'true' ? true : (tmp[1] === 'false' ? false : tmp[1]));
		}
	}
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

	// Load command line variables
	if (options.cmd) {
		config = _loadCommandLine(config);
	}

	options.ns = options.ns === 2 ? true : false;

	return utils.extend(config, buffer);
}

function _loadOriginal() {
	var self = this;
	var i;
	var keys = Object.keys(self);
	keys.forEach(function (key) {
		delete self[key];
	});

	keys = Object.keys(module.exports);
	keys.forEach(function (key) {
		delete module.exports[key];
	});

	keys = Object.keys(original);
	keys.forEach(function (key) {
		self[key] = module.exports[key] = original[key];
	});

	return self;
}

function _addFunctions(config) {

	Object.defineProperty(config, 'loadConfig', {
		value: Config,
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
			name = name.indexOf('.json') === -1 ? 'config.' + name + '.json' : name;
			m._add(name, JSON.stringify(object, null, '	'));
			original = Config(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'changeConfigFile', {
		value: function (name, object) {
			var m = _getMap();
			if (!m) {
				return false;
			}
			name = m[name] ? name : 'config.' + name + '.json';
			if (!m[name]) {
				return false;
			}
			var o = JSON.parse(m[name]._content);
			object = utils.extend(o, object);
			m[name]._content = JSON.stringify(object, null, '	');

			original = Config(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'deleteConfigFile', {
		value: function (name) {
			var m = _getMap();
			if (!m) {
				return false;
			}
			name = m[name] ? name : 'config.' + name + '.json';
			if (!m[name]) {
				return false;
			}
			m[name]._delete();

			original = Config(Options, true);
			return _loadOriginal.call(this);
		}
	});

	Object.defineProperty(config, 'extend', {
		value: function (o, e) {
			if (e !== undefined) {
				return utils.extend(o, e);
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
function Config(options, force) {
	var config = _loadConfig(options, force);
	if (!config) {
		return false;
	}

	return _addFunctions(config);
}

module.exports = Config();