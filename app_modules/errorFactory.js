'use strict';

var messages = {
		sourceError: 'Source path must be a directory',
		writeError: 'Unable to copy files due to write error'
	};

function errorFactory (key) {
	return new Error(messages[key]);
}

module.exports = errorFactory;