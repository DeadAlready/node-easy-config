/*
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

var path = require('path');

function clone(o) {
  if (typeof o === 'object' && o.length === undefined) {
    var c = {};
    var h = Object.keys(o);
    for (var i = 0, co = h.length; i < co; i++) {
      c[h[i]] = clone(o[h[i]]);
    }
    return c;
  } else {
    return o;
  }
}

var config = {
  log: {
    name: 'It\'s useful to log',
    level: 'info'
  }
};

module.exports.configDev = {
  log: {
    name: 'It\'s useful to log',
    level: 'debug'
  },
  correct: true
};

var runner = {
  name: 'Karl'
};

var dev = {
  log: {
    level: 'debug'
  },
  correct: true
};

var devO = {
  log: {
    level: 'debug'
  },
  correct: 'usually'
};

module.exports.other = {
  log: {
    name: 'It\'s useful to log',
    level: 'debug'
  },
  correct: 'usually'
};

module.exports.simple = clone(module.exports.configDev);
module.exports.simple.ns = {
  runner: clone(runner)
};

module.exports.mod = clone(module.exports.simple);
module.exports.mod.test = true;

module.exports.writeF1 = clone(module.exports.simple);
module.exports.writeF1.ns.here = {
  test: true
};

module.exports.writeF2 = clone(module.exports.simple);
module.exports.writeF2.ns.here = {
  test: false
};

module.exports.writeF3 = clone(module.exports.writeF2);
module.exports.writeF3.ns.here.test2 = true;

module.exports.writeF4 = clone(module.exports.writeF1);
module.exports.writeF4.ns.here.test2 = true;

module.exports.simpleE = clone(module.exports.simple);
module.exports.simpleE.correct = false;

module.exports.noEnv = clone(config);
module.exports.noEnv.ns = {
  runner: clone(runner)
};

module.exports.noNS = clone(module.exports.configDev);
module.exports.noNS.runner = clone(runner);

module.exports.options = {
  folder: __dirname + path.sep + 'config' + path.sep,
  cmd: true,
  envs: ['dev', 'pro'],
  env: 'dev',
  type: 'json',
  ns: true,
  pre: {}
};

module.exports.options2 = {
  folder: __dirname + path.sep + 'config' + path.sep,
  cmd: true,
  envs: ['dev', 'pro'],
  env: 'pro',
  type: 'json',
  ns: false,
  pre: {}
};
