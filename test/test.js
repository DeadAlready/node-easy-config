var assert = require('assert');

// Simple loading
var config = require('../lib/config');
console.log(config);
process.exit();
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true,
  ns:{
    runner:{
      name: 'Karl'
    }
  }
};
assert.deepEqual(config, expected, 'Simple loading failed');

// Extending
config.extend({correct:false});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:false,
  ns:{
    runner:{
      name: 'Karl'
    }
  }
};
assert.deepEqual(config, expected, 'Extending failed');

// Options env
var config = require('../lib/config').loadConfig({env:false});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'info'
  },
  ns:{
    runner:{
      name: 'Karl'
    }
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

// Options namespaces 2
var config = require('../lib/config').loadConfig({ns:false});
var expected = {
  log:{
    name:'It\'s useful to log',
    level: 'debug'
  },
  correct:true,
  runner:{
    name:'Karl'
  }
};
assert.deepEqual(config, expected, 'Namespaces 2 failed');