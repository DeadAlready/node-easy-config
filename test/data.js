/* 
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

function clone(o){
  var c = {};
  var h = Object.keys(o);
  for(var i = 0, co = h.length; i < co; i++){
    c[h[i]] = o[h[i]];
  }
  return c;
}

var config = {
  log:{
    name:'It\'s useful to log',
    level:'info'
  }
}

module.exports.configDev = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true
};

var runner = {
  name: 'Karl'
};

var dev = {
  log: {
    level:'debug'
  },
  correct:true
}

var devO = {
  log: {
    level:'debug'
  },
  correct:'usually'
}

module.exports.other = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:'usually'
};

module.exports.simple = clone(module.exports.configDev);
module.exports.simple.ns = {
  runner:clone(runner)
}

module.exports.mod = clone(module.exports.simple);
module.exports.mod.test = true;

module.exports.simpleE = clone(module.exports.simple);
module.exports.simpleE.correct = false;

module.exports.noEnv = clone(config);
module.exports.noEnv.ns = {
  runner:clone(runner)
}

module.exports.noNS = clone(module.exports.configDev);
module.exports.noNS.runner = clone(runner);