'use strict';

var fs = require('fs'),
    glob = require('glob'),
    
    errorFactory = require('./errorFactory'),
    shared = require('./shared');

function copyFile (dest, path) {
	fs.writeFileSync(dest + path, fs.readFileSync(path));
}

function copyAction (source, dest) {
	try {
		glob.sync(source + "**/*")
            .forEach(copyFile.bind(null, dest));
	} catch (err) {
		throw errorFactory('writeError');
	}
}

function copySync (source, dest){
    var validationResult = shared.validateDirectory(source);
    
    if (validationResult !== null) {
        throw validationResult;
    } else {
        copyAction(shared.cleanPath(source), shared.cleanPath(dest))
    }
}

module.exports = copySync;