// Copyright 2012 Karl Düüna. All rights reserved.

'use strict';

var utils = require('./utils');
var environment = process.argv.slice(0).splice(2);

/**
 * Function for loading a config file and extending the configuration with it
 * 
 * @params options  {Object} options object
 * @params key      {String} environment key
 * @params config   {Object} object to extend
 * @return {Object}
 */
function _loadConfigFile(options, key, config){
  var config = config || {};
  var name = (options[key] ? options[key] : 'config.' + key + '.json');
  var newConf = _loadFile(options, name);
  
  if(newConf){ // Configuration loading successful
    return utils.extend(config, newConf);
  } else {
    if(options.breakOnMain && key === 'main'){
      throw new Error('Failed to load main configuration file "' + name +
        '" from ' + options.root + ' and ' + options.root + options.folder);
    }
    console.log('Failed to load ' + name);
    return config;
  }
}

/**
 * Function for loading a file
 * 
 * @params options  {Object} options object
 * @params name     {String} file name
 * @return {Object}
 */
function _loadFile(options, name){
  // Try to load from defined folder
  var filePath = options.root + options.folder + name;
  try {
    return require(filePath);
  } catch(e) {
    // Try to load from root folder
    var filePath = options.root + name;
    try{
      return require(filePath);
    } catch(e) {
      // Failed to load return false
      return false;
    }
  }
}

/**
 * Function for loading command line options
 * 
 * @param config {Object} object to extend with results
 * @return {Object}
 */
function _loadCommandLine(config){
  var env = {};

  for(var i = 0, c = environment.length; i < c; i++){
    
    if(environment[i].indexOf('--') === 0){
      var tmp = environment[i].substr(2).split('=');
      
      var arr = tmp.shift().split('.');
      if(arr.length > 1){
        var temp = {};
        var temp2 = {};
        temp[arr[arr.length-1]] = tmp.join('=');
        for(var l = arr.length -2 , m = 0; l > m; l--){
            temp2[arr[l]] = temp;
            temp = temp2;
            temp2 = {};
        }
      } else {
        temp = tmp.join('=');
      }
      env[arr[0]] = temp;
      continue;
    }
  }
  return utils.extend(config, env);
}

/**
 * Function for loading configuration based on options
 * 
 * @param options {Object}  configuration loading options
 * @return {Object}
 */
function _loadConfig(options){
  if(!options){
    options = {};
  }
  options = utils.extend({
    root: process.cwd(),
    folder: 'config',
    production: 'config.pro.json',
    development: 'config.dev.json',
    main: 'config.json',
    commandLine: true,
    env: 'development',
    breakOnMain:true,
    preConfig: {},
    ns: false
  }, options);
  
  for(var i = 0, c = environment.length; i < c; i++){
    if(environment[i].charAt(0) === '-' && environment[i].charAt(1) !== '-'){
      var tmp = environment[i].substr(1).split('=');
      options[tmp[0]] = (tmp[1] === 'true' ? true : (tmp[1] === 'false' ? false : tmp[1]));
    }
  }
  
  options.root = utils.fixPath(options.root);
  options.folder = utils.fixPath(options.folder);
  
  var config = utils.clone(options.preConfig);
  config = _loadConfigFile(options, 'main', config);
  
  if(options.ns){
    config['ns'] = {};
    
    if(typeof options.ns.length === 'undefined'){
      for(var i in options.ns){
        config['ns'][i] = _loadFile(options, options.ns[i]);
      }
    } else if(options.ns.length > 0){
      for(var i in options.ns){
        config['ns'][options.ns[i]] = _loadConfigFile(options, options.ns[i], false);
      }
    }
  }
  
  if(options.env){
    config = _loadConfigFile(options, options.env, config);
  }
  
  if(options.commandLine){
    config = _loadCommandLine(config);
  }
  
  return config;
}

/**
 * Function for reloading config with options, 
 * will return reference to itself with configuration properties
 * 
 * @param options {Object}  configuration loading options
 * @return {Object}
 */
function Config(options){
  var config = _loadConfig(options);
  
  Object.defineProperty(config, 'loadConfig', {
    value: Config,
    enumerable: false,
    writable: false
  });
  
  Object.defineProperty(config, 'extend', {
    value: function(o, e){
      if(typeof e !== 'undefined'){
        return utils.extend(o, e);
      } else {
        utils.extend(this, o, true);
      }
    },
    enumerable: false,
    writable: false
  });
  
  return config;
}

module.exports = Config();