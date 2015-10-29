/*
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

var path = require('path');
var clone = require('clone');

var config = {
  log: {
    name: 'It\'s useful to log',
    level: 'info'
  },
  clientId: 'joonas'
};

module.exports.configDev = {
  log: {
    name: 'It\'s useful to log',
    level: 'debug'
  },
  correct: true,
  clientId: 'joonas'
};

var runner = {
  name: 'Karl'
};

var dev = {
  log: {
    level: 'debug'
  },
  correct: true,
  clientId: 'joonas'
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

module.exports.noNSWEnv = clone(module.exports.configDev);
module.exports.noNSWEnv.runner = clone(runner);
module.exports.noNSWEnv.test = {
    'var': true
};

module.exports.noNSWCIEnv = clone(module.exports.configDev);
module.exports.noNSWCIEnv.runner = clone(runner);
module.exports.noNSWCIEnv.clientId = 'super';

module.exports.noNSWCIEnvJSON = clone(module.exports.configDev);
module.exports.noNSWCIEnvJSON.runner = clone(runner);
module.exports.noNSWCIEnvJSON.lang = ['en', 'es', 'de'];


module.exports.noNSWCIEnvJSONobj = clone(module.exports.configDev);
module.exports.noNSWCIEnvJSONobj.runner = clone(runner);
module.exports.noNSWCIEnvJSONobj.lang = {en: 1, de: 1};

module.exports.simpleCmd = clone(module.exports.simple);
module.exports.simpleCmd.test = 'here';

module.exports.simpleCmdNested = clone(module.exports.simple);
module.exports.simpleCmdNested.test = {
  is: 'here'
};

module.exports.simpleCmdBoolean = clone(module.exports.simple);
module.exports.simpleCmdBoolean.test = true;

module.exports.options = {
  folder: __dirname + path.sep + 'config' + path.sep,
  cmd: true,
  envVars: true,
  envs: ['dev', 'pro'],
  env: 'dev',
  type: 'json',
  ns: true,
  pre: {},
  envPrefix: 'NODE_'
};

module.exports.options2 = {
  folder: __dirname + path.sep + 'config' + path.sep,
  cmd: true,
  envVars: true,
  envs: ['dev', 'pro'],
  env: 'pro',
  type: 'json',
  ns: false,
  pre: {},
  envPrefix: 'NODE_'
};

module.exports.cloneObj = {
  test:true,
  toot: [1, {juhan: 2}, 3]
};

module.exports.cloneObjRef = {
  test:true,
  toot: [1, {juhan: 2}, 3]
};
