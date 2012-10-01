'use strict';

var path = require('path');

/**
 * A extends B
 *
 * util.inherits works only with objects derived from Object
 *
 * @return {Object} Extended object
 */
function extend(a, b, noClone) { // A extends B
  a = a || {};
  
  if(typeof a !== 'object' || typeof a.length !== 'undefined'){
    return b;
  }
  
  if(typeof b !== 'object'){
    return b;
  }
  
  if(!noClone){
    a = clone(a);
  }
  
  var bk = Object.keys(b);
  for(var i = 0, c = bk.length; i < c; i++){
    var key = bk[i];
    if (!a.hasOwnProperty(key) || !(typeof b[key] === 'object' && typeof b[key].length === 'undefined') && typeof b[key] !== 'function') { // Simple types
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
  var h = Object.keys(o);
  for(var i = 0, co = h.length; i < co; i++){
    c[h[i]] = o[h[i]];
  }
  return c;
}

/**
 * Function for appending path.sep to the end of string if necessary
 * 
 * @param string {String}
 * @return {String}
 */
function fixPath(string){
  if(string.charAt(string.length-1) !== path.sep){
    string += path.sep;
  }
  return string;
}

module.exports = {
  extend: extend,
  clone: clone,
  fixPath: fixPath
}