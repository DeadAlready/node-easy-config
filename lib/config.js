// Copyright 2012 Karl Düüna. All rights reserved.

'use strict';

var path = require('path');
var environment = process.argv.slice(0).splice(2);

/**
 * A extends B
 *
 * util.inherits works only with objects derived from Object
 *
 * @return {Object} Extended object
 */
function extend(a, b, noClone) { // A extends B
  if(a === undefined || !noClone){
    a = clone(a);
  }
  for (var key in b) {
    if (typeof a[key] === 'undefined' || !(typeof a[key] === 'object' && typeof a[key].length === 'undefined') && typeof a[key] !== 'function') { // Simple types
      a[key] = b[key];
    } else { // Complex types
      a[key] = extend(a[key], b[key]);
    }
  }

  return a;
};

/**
 * Function for creating a clone of an object
 * 
 * @param o {Object}  object to clone
 * @return {Object}
 */
function clone(o){
  var c = {};
  for(var i in o){
    c[i] = o[i];
  }
  return c;
}

/**
 * Function for appending path.sep to the end of string if necessary
 * 
 * @param string {String}
 * @return {String}
 */
function _fixPath(string){
  if(string.charAt(string.length-1) !== path.sep){
    string += path.sep;
  }
  return string;
}

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
    return extend(config, newConf);
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
      i++;
      continue;
    }
  }
  return extend(config, env);
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
  options = extend({
    root: process.cwd(),
    folder: 'config',
    production: 'config.pro.json',
    development: 'config.dev.json',
    main: 'config.json',
    commandLine: true,
    env: 'development',
    breakOnMain:true,
    preConfig: {},
    namespaces: []
  }, options);
  
  for(var i = 0, c = environment.length; i < c; i++){
    if(environment[i].charAt(0) === '-' && environment[i].charAt(1) !== '-'){
      var tmp = environment[i].substr(1).split('=');
      options[tmp[0]] = (tmp[1] === 'true' ? true : (tmp[1] === 'false' ? false : tmp[1]));
    }
  }
  
  options.root = _fixPath(options.root);
  options.folder = _fixPath(options.folder);
  
  var config = clone(options.preConfig);
  config = _loadConfigFile(options, 'main', config);
  
  if(typeof options.namespaces.length === 'undefined'){
    for(var i in options.namespaces){
      config[i] = extend(config[i], _loadFile(options, options.namespaces[i]));
    }
  } else if(options.namespaces.length > 0){
    for(var i in options.namespaces){
      config[options.namespaces[i]] = _loadConfigFile(options, options.namespaces[i], config[options.namespaces[i]]);
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
    value: function(o){
      extend(this, o, true);
    },
    enumerable: false,
    writable: false
  });
  
  return config;
}

module.exports = Config();