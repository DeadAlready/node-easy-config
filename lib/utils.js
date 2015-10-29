'use strict';

var path = require('path');
var fs = require('fs');
var clone = require('clone');

/**
 * A extends B
 *
 * util.inherits works only with objects derived from Object
 *
 * @return {Object} Extended object
 */
function extend(a, b, noClone) { // A extends B
    a = a || {};

    if (typeof a !== 'object') {
        return noClone ? b : clone(b);
    }

    if (typeof b !== 'object') {
        return b;
    }

    if (!noClone) {
        a = clone(a);
    }

    if (Array.isArray(b)) {
        if (Array.isArray(a)) {
            return a.concat(noClone ? b : b.map(clone));
        }
        return noClone ? b : clone(b);
    }

    var bk = Object.keys(b);
    var i, c, key;
    for (i = 0, c = bk.length; i < c; i++) {
        key = bk[i];
        if (!a.hasOwnProperty(key) ||
            (!(typeof b[key] === 'object' && b[key] !== null) &&
                (typeof b[key] !== 'function'))) { // Simple types

            a[key] = b[key];
        } else { // Complex types
            a[key] = extend(a[key], b[key], noClone);
        }
    }
    return a;
}

/**
 * Function for mapping a folder and subfolders for certain file types
 * @param opts {Object} - path: folder to map, type: file extension to look for
 * @returns Object
 */
function mapFolder(opts) {
    var folders = [''];
    var map = {};
    Object.defineProperty(map, '_root', {value: opts.path});
    opts.sType = '.' + opts.type;
    var rel = '';
    function examine(file) {
        var stats = fs.statSync(path.join(map._root, rel, file));
        if(stats.isDirectory()) {
            folders.push(path.join(rel, file));
            return;
        }
        var ext = path.extname(file);
        if(ext === opts.sType || ext === opts.type) {
            map[path.join(rel, file)] = {
                _path: path.join(map._root, rel, file),
                _base: path.basename(file, path.extname(file))
            };
        }
    }
    folders.forEach(function (k) {
        rel = k !== '' ? k + path.sep : rel;
        var subfiles = fs.readdirSync(map._root + rel);
        subfiles.forEach(examine);
    });
    return map;
}


/**
 * Function for appending path.sep to the end of string if necessary
 * 
 * @param string {String}
 * @return {String}
 */
function fixPath(string) {
    if (string.charAt(string.length - 1) !== path.sep) {
        string += path.sep;
    }
    return string;
}

/**
 * Function for getting a value from object at index
 * @param obj
 * @param index - string for index, can be in format "a.b.c"
 * @returns {*}
 */
function getIndex(obj, index) {
    return index.split('.').reduce(function (thisOne, i) {
        return thisOne && thisOne[i] || undefined;
    }, obj);
}

/**
 * Function for seting a value in object at index
 * @param obj
 * @param index - string for index, can be in format "a.b.c"
 * @param value - value to set
 * @returns {*}
 */
function setIndex(obj, index, value) {
    if(typeof index === 'string') {
        index = index.split('.');
    }
    var current = index.shift();
    if(!index.length) {
        obj[current] = value;
    } else if(!obj[current]) {
        obj[current] = setIndex({}, index, value);
    } else {
        setIndex(obj[current], index, value);
    }
    return obj;
}

/**
 * Function for seting a value in object at index while igoring case
 * @param obj
 * @param index - string for index, can be in format "a.b.c"
 * @param value - value to set
 * @returns {*}
 */
function setCaseInsensitiveIndex(obj, index, value) {
    if(typeof index === 'string') {
        index = index.split('.');
    }
    var current = index.shift();
    var currentKey = current.toLowerCase();
    Object.keys(obj).some(function (key) {
        if(key.toLowerCase() === currentKey) {
            currentKey = key;
            return true;
        }
    });

    if(!index.length) {
        obj[currentKey] = extend(obj[currentKey], value);
    } else if(!obj[currentKey]) {
        obj[currentKey] = setCaseInsensitiveIndex({}, index, value);
    } else {
        setCaseInsensitiveIndex(obj[currentKey], index, value);
    }
    return obj;
}

/**
 * Function for determining if value is a string representation
 * of boolean or number
 * @param value
 * @returns {*}
 */
function typeCast(value) {
    if(value === 'true') {
        return true;
    }
    if(value === 'false') {
        return false;
    }
    // Check integer values
    if(+value == value) {
        return +value;
    }
    // Check float values
    if(parseFloat(value) == value) {
        return parseFloat(value);
    }

    if(value.indexOf('[') === 0 || value.indexOf('{') === 0) {
        var oldVal = value;
        try {
            value = JSON.parse(value);
        } catch(e) {
            // Some environments remove double quotes,
            // so single quotes are needed instead
            // Try to replace and parse
            try {
                value = JSON.parse(value.replace(/'/g,'"'));
            } catch(e2) {
                value = oldVal;
            }
        }
    }
    return value;
}

module.exports = {
    extend: extend,
    clone: clone,
    fixPath: fixPath,
    map: mapFolder,
    getIndex: getIndex,
    setIndex: setIndex,
    setCaseInsensitiveIndex: setCaseInsensitiveIndex,
    typeCast: typeCast
};