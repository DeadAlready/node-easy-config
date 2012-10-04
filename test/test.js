/* 
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

var vows = require('vows');
var assert = require('assert');
var spec = require('vows/lib/vows/reporters/spec');
var d = require('./data');
var utils = require('./utils');


vows.describe('Easy-config').addBatch({
  'Simple include':{
    topic:function(){
      this.callback(null, require('../lib/config'));
    },
    'is correct':function(config){
      assert.strictEqual(true, utils.deepDiff(config, d.simple));
    },
    'Extend':function(config){
      config.extend({correct:false});
      assert.strictEqual(true, utils.deepDiff(config, d.simpleE));
    }
  }
}).addBatch({
  'With env false':{
    topic:function(){
      this.callback(null, require('../lib/config').loadConfig({env:false}));
    },
    'is correct':function(config){
      assert.strictEqual(true, utils.deepDiff(config, d.noEnv));
    }
  }
}).addBatch({
  'With other folder':{
    topic:function(){
      this.callback(null, require('../lib/config').loadConfig({folder:'other'}));
    },
    'is correct':function(config){
      assert.strictEqual(true, utils.deepDiff(config, d.other));
    }
  }
}).addBatch({
  'With no NS':{
    topic:function(){
      this.callback(null, require('../lib/config').loadConfig({ns:false}));
    },
    'is correct':function(config){
      assert.strictEqual(true, utils.deepDiff(config, d.noNS));
    }
  }
}).run({reporter:spec});