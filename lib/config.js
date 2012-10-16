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

/**
 * Function for getting the local cached config foldermap
 * 
 * @param {Object} options - options to load the map with
 */
function _getMap(options){
  if(map && options.folder === filePath && options.type === type){
    return map;
  }
  type = options.type;
  filePath = options.folder;
  try{
    map = foldermap.mapSync({path:filePath, type:type, recursive:false});
    return map;
  } catch(e){
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
function _loadConfigFile(file, config, ns){
  if(file._ns === '' || !ns){
    return utils.extend(config || {}, require(file._path));
  } else {
    var obj = {};
    obj[file._ns] = require(file._path);
    if(ns === 2){
      obj = {'ns':obj};
    }
    return utils.extend(config || {}, obj);
  }
}

/**
 * Function for getting the namespace from file._base
 * 
 * @param {String} name - base name of file
 * @return {String} 
 */
function _getNS(name){
  return name.replace('config.','');
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
  if(options.folder){
    options.folder = path.resolve(options.folder);
  }
  
  options = utils.extend({
    folder: process.cwd() + path.sep + 'config',
    cmd: true,
    envs:['dev','pro'],
    env: 'dev',
    type: 'json',
    ns: true,
    pre: {}
  }, options);
  
  // Overwrite settings from command line
  for(var i = 0, c = environment.length; i < c; i++){
    if(environment[i].charAt(0) === '-' && environment[i].charAt(1) !== '-'){
      var tmp = environment[i].substr(1).split('=');
      options[tmp[0]] = (tmp[1] === 'true' ? true : (tmp[1] === 'false' ? false : tmp[1]));
    }
  }
  // Fix variables
  options.folder = utils.fixPath(options.folder) + '*';
  options.envs.push(options.env);
  options.ns = options.ns ? 2 : 1;
  options.type = options.type.toLowerCase();
  
  // Get map
  var map = _getMap(options);
  if(!map){
    return false;
  }
  
  // Add namespaces
  for(var i in map){
    Object.defineProperty(map[i],'_ns',{value:_getNS(map[i]._base)});
  }
  // Get files array
  var files = Object.keys(map);
  var config = utils.clone(options.pre);
  
  // Load main config first
  var main = files.indexOf('config.' + options.type);
  if(~main){
    config = _loadConfigFile(map['config.' + options.type], config);
    delete files[main];
  }
  
  // Load all config files except environment config
  files.forEach(function(f){
    if(!~options.envs.indexOf(map[f]._ns)){
      config = _loadConfigFile(map[f], config, options.ns);
    }
  });
  
  // Load environment config last
  var env = files.indexOf('config.' + options.env + '.' + options.type);
  if(~env){
    config = _loadConfigFile(map['config.' + options.env + '.' + options.type], config);
    delete files[env];
  }
  
  // Load command line variables
  if(options.cmd){
    config = _loadCommandLine(config);
  }
  
  return utils.extend(config, buffer);
}

function _addFunctions(config){
  
  Object.defineProperty(config, 'loadConfig', {
    value: Config,
    enumerable: false,
    writable: false
  });
  
  Object.defineProperty(config, 'modify', {
    value: function(o){
      if(!original){
        original = utils.clone(this);
      }
      buffer = utils.extend(buffer, o);
      return utils.extend(this, o, true);
    },
    enumerable: false,
    writable: false
  });
  
  Object.defineProperty(config, 'unmodify', {
    value: function(){
      buffer = {};
      for(var i in this){
        delete this[i];
      }
      for(var i in original){
        this[i] = original[i];
      }
      return this;
    },
    enumerable: false,
    writable: false
  });
  
  Object.defineProperty(config, 'extend', {
    value: function(o, e){
      if(typeof e !== 'undefined'){
        return utils.extend(o, e);
      } else {
        return _addFunctions(utils.extend(this, o));
      }
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
 * @param options {Object}  configuration loading options
 * @return {Object}
 */
function Config(options){
  var config = _loadConfig(options);
  if(!config){
    return false;
  }
  
  return _addFunctions(config);
}

module.exports = Config();