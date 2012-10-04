/* 
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

// Will test own properties only
module.exports.deepDiff = function deepEqualWithDiff(a, e, names){
  var dif = {};
  var aKeys = Object.keys(a);
  var eKeys = Object.keys(e);

  var cKeys = aKeys;
  var dKeys = eKeys;
  var c = a;
  var d = e;
  var names = {
    c: names ? names['a'] : 'Actual',
    d: names ? names['e'] : 'Expected'
  }

  if(eKeys.length > aKeys.length){
    cKeys = eKeys;
    dKeys = aKeys;
    c = e;
    d = a;
    names = {
      d: names && names['a'] ? names['a'] : 'Actual',
      c: names && names['e'] ? names['e'] : 'Expected'
    }
  }


  for(var i = 0, co = cKeys.length; i < co; i++){
    var key = cKeys[i];
    if(typeof c[key] !== typeof d[key]){
      dif[key] = 'Type mismatch ' + names['c'] + ':' + typeof c[key] + '!==' + names['d'] + typeof d[key];
      continue;
    }
    if(typeof c[key] === 'function'){
      if(c[key].toString() !== d[key].toString()){
        dif[key] = 'Differing functions';
      }
      continue;
    }
    if(typeof c[key] === 'object'){
      if(c[key].length !== undefined){ // array
        var temp = c[key].slice(0);
        temp = temp.filter(function(el){
          return (d[key].indexOf(el) === -1);
        });
        var message = '';
        if(temp.length > 0){
          message += names['c'] + ' excess ' + JSON.stringify(temp);
        }

        temp = d[key].slice(0);
        temp = temp.filter(function(el){
          return (c[key].indexOf(el) === -1);
        });
        if(temp.length > 0){
          message += ' and ' + names['d'] + ' excess ' + JSON.stringify(temp);
        }
        if(message !== ''){
          dif[key] = message;
        }
        continue;
      }
      var diff = deepEqualWithDiff(c[key], d[key], {a:names['c'],e:names['d']});
      if(diff !== true && Object.keys(diff).length > 0){
        dif[key] = diff;
      }
      continue;
    }
    // Simple types left so
    if(c[key] !== d[key]){
      dif[key] = names['c'] + ':' + c[key] + ' !== ' + names['d'] + ':' + d[key]; 
    }
  }
  return Object.keys(dif).length > 0 ? dif : true;
}

module.exports.eClone = function enumerableClone(o){
  var keys = Object.getOwnPropertyNames(o);
  var t = {};
  for(var i in keys){
    if(typeof o[keys[i]] === 'object' && o[keys[i]].length === undefined ){
      t[keys[i]] = enumerableClone(o[keys[i]]);
      continue;
    }
    t[keys[i]] = o[keys[i]];
  }
  return t;
}