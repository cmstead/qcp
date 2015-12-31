var mockery = require('mockery'),
	sinon = require('sinon'),
	chai = require('chai'),
	assert = chai.assert;
	
describe('qcp', function () {
	
	var qcp,
		fakeFileList,
		lstatResponse,
		globFake,
		fsFake;
	
	beforeEach(function () {
		fakeFileList = [
			'foo/bar/baz.txt',
			'foo/bar.txt',
			'foo/baz/quux',
			'blar.gl'
		];
		
		lstatResponse = {
			isDirectory: function () {
				return true;
			}
		};
		
		globFake = {
			sync: function () {
				return fakeFileList;
			}
		};
		
		fsFake = {
			lstatSync: function () {
				return lstatResponse;
			}
		};
		
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		
		mockery.registerMock('glob', globFake);
		mockery.registerMock('fs-extra', fsFake);
		
		qcp = require('../index');
	});
	
	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
	});
	
	describe('copy', function () {
		
		it('should throw an error if path is not a directory', function () {
			lstatResponse.isDirectory = function () { return false; }; // fail directory check
			assert.throws(qcp.copy.bind(null, 'bad/path/', '../'));
		});
		
		it('should throw an error if path is not a directory', function () {
			lstatResponse.isDirectory = function () { return true; }; // pass directory check
			assert.doesNotThrow(qcp.copy.bind(null, 'bad/path/', '../'));
		});
		
	});
	
});