var assert = require('assert');

// Simple loading
var config = require('../lib/config');
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true
};
assert.deepEqual(config, expected, 'Simple loading failed');

// Extending
config.extend({correct:false});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:false
};
assert.deepEqual(config, expected, 'Extending failed');

// Options env
var config = require('../lib/config').loadConfig({env:false});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'info'
  }
};
assert.deepEqual(config, expected, 'Options failed');

// Options folder
var config = require('../lib/config').loadConfig({folder:'other'});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:'usually'
};
assert.deepEqual(config, expected, 'Options failed');

// Options namespaces
var config = require('../lib/config').loadConfig({ns:['runner']});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true,
  ns:{
    runner:{
      name:'Karl'
    }
  }
};
assert.deepEqual(config, expected, 'Namespaces failed');

// Options namespaces 2
var config = require('../lib/config').loadConfig({ns:{'hello':'config.runner.json'}});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true,
  ns:{
    hello:{
      name:'Karl'
    }
  }
};
assert.deepEqual(config, expected, 'Namespaces 2 failed');