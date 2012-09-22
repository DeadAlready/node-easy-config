[easy-config](https://github.com/DeadAlready/node-easy-config) is a simple configuration loader for node projects.

# Installation

    $ npm install easy-config

# Usage

easy-config loads configuration from JSON files and the command line returning an object containing the sum of configurations.

## Default usage

Simply require the module and thats it

    var config = require('easy-config');

It will try to read files from config subfolder and failing that the root folder.
Starting with an empty object extend the configuration object by adding or overwriting the values obtained in the following order

1. config.json
2. config.dev.json (this is because default environment is development)
3. command line input

### Command line

Input is expected in the --{name}={value} format.

You can also set nested properties by using dots to specify the nesting like so:

    $ node test.js --log.level.is==true  

## Options

The following options are available:

+ root: *The root directory will default to process.cwd()
+ folder: *The configuration folder will default to 'config'
+ production: *The production configuration file name will default to 'config.pro.json'
+ development: *The development configuration file name will default to 'config.dev.json'
+ main: *The main configuration file name - this will always be loaded will default to 'config.json'
+ commandLine: *Whether to load configurations from the command line will default to true
+ env: *Environment for which to load configuration will default to 'development'

There are two ways of specifying the options:

### loadConfig

You can modify the loading options by using the method loadConfig(options) that is on the configuration object.

    var config = require('easy-config').loadConfig(options);

### Command line

You can also specify the loading options from the command line in the following format -{name}={value}.

Take note that the format differs between loading configuration options and configuration extending by one '-' sign.

Options specified on command line will take precedent over options specified in code.

    $ node test.js -env=production

## Examples

config.json:

    {
      "log":{
        "name":"It's useful to log",
        "level":"info"
      }
    }
config.dev.json:

    {
      "log":{
        "level":"debug"
      },
      "correct":true
    }

index.js

    var config = require('easy-config');
    console.log(config);

Will create the following output:

    {
      "log":{
        "name":"It's useful to log",
        "level":"debug"
      },
      "correct":true
    }

### Extend

The config object also comes with the convenience method of extend to allow overwriting 
or extending the configuration object.

Usage:

    var config = require('easy-config');
    config.extend({newProp:true});

Will result in:

    {
      ...
      newProp:true
    }

## License

The MIT License (MIT)
Copyright (c) 2012 Karl Düüna

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.