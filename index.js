'use strict';

var fs = require('fs-extra'),
    glob = require('glob');

function copy (source, dest) {
	if(!fs.lstatSync(source).isDirectory()){
		throw new Error('Source path must be a directory');
	}

    var fileList = glob.sync(source + "**/*");
}

module.exports = {
	copy: copy
};