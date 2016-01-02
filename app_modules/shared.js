'use strict';

var fs = require('fs'),
    errorFactory = require('./errorFactory');

function validateDirectory (path) {
	return fs.lstatSync(path).isDirectory() ? null : errorFactory('sourceError');
}

function cleanPath (path) {
	return path.replace(/\/$/, '') + '/';
}

function sanitizeCallback (callback) {
	return typeof callback === 'function' ? callback : function () {};
}

module.exports = {
    cleanPath: cleanPath,
    sanitizeCallback: sanitizeCallback,
    validateDirectory: validateDirectory
};