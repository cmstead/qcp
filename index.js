'use strict';

var fs = require('fs-extra');

function copy (source) {
	if(!fs.lstatSync(source).isDirectory()){
		throw new Error('Source path must be a directory');
	}
}

module.exports = {
	copy: copy
};