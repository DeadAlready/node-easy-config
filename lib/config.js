'use strict';

var path = require('path');
var environment = process.argv.slice(0).splice(2);

/**
 * A extends B
 *
 * util.inherits works only with objects derived from Object
 *
 * @returns {Object} Extended object
 */
function extend(a, b) { // A extends B
  if(a === undefined){
    a = {};
  }
  for (var key in b) {
    if ((typeof a[key] === 'number') || (typeof a[key] === 'string') || (typeof a[key] === 'undefined')) { // Simple types
      a[key] = b[key];
    } else { // Complex types
      extend(a[key], b[key]);
    }
  }

  return a;
};

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
 * @params name {String} configuration file path
 * @return {Object}
 */
function _loadConfigFile(options, key, config){
  var name = options.folder + (options[key] ? options[key] : 'config.' + key + '.json');
  try{
    return extend(config, require(name));
  }catch(e){
    return config;
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
    folder: process.cwd(),
    production: 'config.pro.json',
    development: 'config.dev.json',
    main: 'config.json',
    commandLine: true,
    env: 'development'
  }, options);
  
  
  for(var i = 0, c = environment.length; i < c; i++){
    if(environment[i].charAt(0) === '-' && environment[i].charAt(1) !== '-'){
      var tmp = environment[i].substr(1).split('=');
      options[tmp[0]] = (tmp[1] === 'true' ? true : (tmp[1] === 'false' ? false : tmp[1]));
    }
  }
  
  options.folder = _fixPath(options.folder);
  
  var config = {};
  config = _loadConfigFile(options, 'main', config);
  config = _loadConfigFile(options, options.env, config);
  
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
  var config = Config;
  var values = _loadConfig(options);
  for(var i in values){
    config[i] = values[i];
  }
  return config;
}

module.exports = Config();