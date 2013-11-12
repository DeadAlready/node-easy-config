/* 
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

var vows = require('vows');
var assert = require('assert');
var spec = require('vows/lib/vows/reporters/spec');
var d = require('./data');
var utils = require('./utils');

try {
    process.chdir(__dirname);
}
catch (err) {
    console.log('Changing directory failed, test must be run with current working directory being ..easy-config/test');
    console.log('exiting');
    process.exit();
}

vows.describe('Easy-config').addBatch({
    'Simple include':{
        topic:function(){
            this.callback(null, require('../lib/config'));
        },
        'is correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simple));
        },
        'Extend':function(config){
            config = config.extend({correct:false});
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
}).addBatch({
    'JS files':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({folder:'other2', type: 'js'}));
        },
        'is correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.other));
        }
    }
}).addBatch({
    'Modifiers':{
        topic:function(){
            this.callback(null, require('../lib/config').modify({'test':true}));
        },
        'is correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.mod));
        },
        'is buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.mod));
        },
        'modifications propagate to loadConfig':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').loadConfig(), d.mod));
        },
        'can undo':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').unmodify(), d.simple));
        }
    }
}).addBatch({
    'writeConfigFile':{
        topic:function(){
            this.callback(null, require('../lib/config').writeConfigFile('config.here.json', {'test':true}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.writeF1));
        },
        'is buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.writeF1));
        },
        'modifications propagate to loadConfig':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').loadConfig(), d.writeF1));
        },
        'overwrite returns correct':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').writeConfigFile('config.here.json', {'test':false}), d.writeF2));
        },
        'is also buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.writeF2));
        }
    }
}).addBatch({
    'changeConfigFile':{
        topic:function(){
            this.callback(null, require('../lib/config').changeConfigFile('config.here.json', {'test2':true}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.writeF3));
        },
        'is buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.writeF3));
        },
        'modifications propagate to loadConfig':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').loadConfig(), d.writeF3));
        }
    }
}).addBatch({
    'deleteConfigFile':{
        topic:function(){
            this.callback(null, require('../lib/config').deleteConfigFile('config.here.json'));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simple));
        },
        'is buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.simple));
        },
        'modifications propagate to loadConfig':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').loadConfig(), d.simple));
        }
    }
}).addBatch({
    'writeConfigFile with just name':{
        topic:function(){
            this.callback(null, require('../lib/config').writeConfigFile('here', {'test':true}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.writeF1));
        }
    }
}).addBatch({
    'changeConfigFile with just name':{
        topic:function(){
            this.callback(null, require('../lib/config').changeConfigFile('here', {'test2':true}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.writeF4));
        }
    }
}).addBatch({
    'deleteConfigFile with just name':{
        topic:function(){
            this.callback(null, require('../lib/config').deleteConfigFile('here'));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simple));
        },
        'is buffered':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config'), d.simple));
        },
        'modifications propagate to loadConfig':function(){
            assert.strictEqual(true, utils.deepDiff(require('../lib/config').loadConfig(), d.simple));
        }
    }
}).addBatch({
    'getDefinedOptions':{
        topic:function(){
            this.callback(null, require('../lib/config').getDefinedOptions());
        },
        'returns correct':function(options){
            assert.strictEqual(true, utils.deepDiff(options, d.options));
        }
    }
}).addBatch({
    'getDefinedOptions custom':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false,env:'pro'}).getDefinedOptions());
        },
        'returns correct':function(options){
            assert.strictEqual(true, utils.deepDiff(options, d.options2));
        }
    }
}).addBatch({
    'isProduction true':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'pro'}).isProduction());
        },
        'returns correct':function(production){
            assert.strictEqual(true, production);
        }
    }
}).addBatch({
    'isProduction false':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}).isProduction());
        },
        'returns correct':function(production){
            assert.strictEqual(false, production);
        }
    }
}).run({reporter:spec});