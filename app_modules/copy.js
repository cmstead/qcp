'use strict';

var async = require("async"),
    fs = require('fs'),
    glob = require('glob'),

    errorFactory = require('./errorFactory'),
    shared = require('./shared');

function copyFile (dest, path, callback){
    async.waterfall([
        fs.readFile.bind(fs, path),
        fs.writeFile.bind(fs, dest + path)
    ], function (err) {
        var error = err !== null ? errorFactory('writeError') : null;
        callback(error);
    });
}

function copyFiles (dest, files, callback) {
    var copyActions = files.map(function (path) {	
        return copyFile.bind(null, dest, path);
    });
    
    async.parallel(copyActions, callback);
}

function copyAction (source, dest, callback){
    async.waterfall([
        glob.bind(null, source + '**/*'),
        copyFiles.bind(null, dest)
    ], callback);
}

function copy (source, dest, callback){
    var validationResult = shared.validateDirectory(source),
        sanitizedCallback = shared.sanitizeCallback(callback);
    
    if(validationResult === null) {
        copyAction(shared.cleanPath(source), shared.cleanPath(dest), sanitizedCallback);
    } else {
        sanitizedCallback(validationResult, null);
    }
}

module.exports = copy;