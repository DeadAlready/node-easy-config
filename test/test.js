/* 
 * Copyright 2012 Karl Düüna <karl.dyyna@gmail.com> All rights reserved.
 */
'use strict';

var vows = require('vows');
var assert = require('assert');
var spec = require('vows/lib/vows/reporters/spec');
var d = require('./data');
var utils = require('./utils');

var cjson = null;
try {
    // See if we have cjson
    cjson = require('cjson');
} catch(e) {
    cjson = null;
}

try {
    process.chdir(__dirname);
}
catch (err) {
    console.log('Changing directory failed, test must be run with current working directory being ..easy-config/test');
    console.log('exiting');
    process.exit();
}

var tmpArgs = [];
var globalObj;

// Clear variables for tests
function clearEnv() {
    Object.keys(process.env).forEach(function (key) {
        if(key.indexOf('NODE_') === 0) {
            delete process.env[key];
        }
    });
}
clearEnv();

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
    'With comments folder':{
        topic: function(){
            if(cjson) {
                this.callback(null, require('../lib/config').loadConfig({folder:'comment'}));
            } else {
                // No cjson so skip
                this.callback(null, null);
            }
        },
        'is correct':function(config){
            if(cjson) {
                assert.strictEqual(true, utils.deepDiff(config, d.other));
            }
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
    'extend.clone':{
        topic:function(){
            this.callback(null, require('../lib/config').extend({}, d.cloneObj));
        },
        'returns correct':function(obj){
            globalObj = obj;
            assert.strictEqual(true, utils.deepDiff(obj, d.cloneObj));
        },
        'is actually clone':function(){
            globalObj.toot[1].juhan = 3;
            assert.notStrictEqual(globalObj.toot[1].juhan, d.cloneObjRef.toot[1].juhan);
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
}).addBatch({
    'load environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_TEST_VAR = 'true';
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWEnv));
            clearEnv();
        }
    }
}).addBatch({
    'load case insensitive environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_CLIENTID = 'super';
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnv));
            clearEnv();
        }
    }
}).addBatch({
    'load JSON array environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_LANG = JSON.stringify(['en', 'es', 'de']);
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnvJSON));
            clearEnv();
        }
    }
}).addBatch({
    'load single quote JSON array environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_LANG = JSON.stringify(['en', 'es', 'de']).replace(/"/g, "'");
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnvJSON));
            clearEnv();
        }
    }
}).addBatch({
    'load JSON object environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_LANG = JSON.stringify({en: 1, de: 1});
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnvJSONobj));
            clearEnv();
        }
    }
}).addBatch({
    'load single quote JSON object environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_LANG = JSON.stringify({en: 1, de: 1}).replace(/"/g, "'");
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnvJSONobj));
            clearEnv();
        }
    }
}).addBatch({
    'ignore environment variables':{
        topic:function(){
            clearEnv();
            process.env.NODE_CLIENTID = 'super';
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev', envVars: false}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNS));
            clearEnv();
        }
    }
}).addBatch({
    'load environment variables with different prefix':{
        topic:function(){
            clearEnv();
            process.env.PREFIX_CLIENTID = 'super';
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'dev', envPrefix: 'PREFIX_'}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.noNSWCIEnv));
            clearEnv();
        }
    }
}).addBatch({
    'load simple cmdline variable':{
        topic:function(){
            tmpArgs = process.argv.slice(0);
            process.argv = process.argv.slice(0);
            process.argv.push('--test=here');
            this.callback(null, require('../lib/config').loadConfig({}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simpleCmd));
            process.argv = tmpArgs.slice(0);
        }
    }
}).addBatch({
    'load simple nested cmdline variable':{
        topic:function(){
            tmpArgs = process.argv.slice(0);
            process.argv = process.argv.slice(0);
            process.argv.push('--test.is=here');
            this.callback(null, require('../lib/config').loadConfig({}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simpleCmdNested));
            process.argv = tmpArgs.slice(0);
        }
    }
}).addBatch({
    'load simple cmdline value ommited (boolean) variable':{
        topic:function(){
            tmpArgs = process.argv.slice(0);
            process.argv = process.argv.slice(0);
            process.argv.push('--test');
            this.callback(null, require('../lib/config').loadConfig({}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simpleCmdBoolean));
            process.argv = tmpArgs.slice(0);
        }
    }
}).addBatch({
    'favor cmdline to environment variables':{
        topic:function(){
            tmpArgs = process.argv.slice(0);
            process.argv = process.argv.slice(0);
            process.argv.push('--test.is=here');
            clearEnv();
            process.env.NODE_TEST_IS = 'super';
            this.callback(null, require('../lib/config').loadConfig({}));
        },
        'returns correct':function(config){
            assert.strictEqual(true, utils.deepDiff(config, d.simpleCmdNested));
            process.argv = tmpArgs.slice(0);
        }
    }
}).addBatch({
    'isEnvironment to return true on correct':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'pro'}).isEnvironment('pro'));
        },
        'returns correct':function(isEnv){
            assert.strictEqual(true, isEnv);
        }
    }
}).addBatch({
    'isEnvironment to return false on wrong':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'pro'}).isEnvironment('dev'));
        },
        'returns correct':function(isEnv){
            assert.strictEqual(false, isEnv);
        }
    }
}).addBatch({
    'isEnvironment to return true on array input with right element':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'pro'}).isEnvironment(['pro', 'production']));
        },
        'returns correct':function(isEnv){
            assert.strictEqual(true, isEnv);
        }
    }
}).addBatch({
    'isEnvironment to return false on array input with no right element':{
        topic:function(){
            this.callback(null, require('../lib/config').loadConfig({ns:false, env:'pro'}).isEnvironment(['dev', 'development']));
        },
        'returns correct':function(isEnv){
            assert.strictEqual(false, isEnv);
        }
    }
}).run({reporter:spec});