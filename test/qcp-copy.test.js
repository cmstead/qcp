var mockery = require('mockery'),
    sinon = require('sinon'),
    chai = require('chai'),
    assert = chai.assert;

describe('qcp', function () {

    var qcp,
        fakeFileList,
        lstatResponse,
        globFake,
        globSpy,
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

        globSpy = sinon.spy();

        globFake = function (pattern, callback) {
            globSpy(pattern, callback);
            callback(null, fakeFileList);
        }

        globFake.sync = function () {
            return fakeFileList;
        }

        fsFake = {
            lstatSync: function () {
                return lstatResponse;
            },
            readFileSync: function () {
                return 'foo';
            },
            writeFileSync: function () { },

            readFile: function (path, callback) {
                callback(null, 'foo');
            },

            writeFile: function (path, data, callback) {
                callback(null, null);
            }
        };

        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        mockery.registerMock('glob', globFake);
        mockery.registerMock('fs', fsFake);

        qcp = require('../index');
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('copy', function () {

        it('should return an error if source path is not a directory', function () {
            var callback = sinon.spy();

            lstatResponse.isDirectory = function () { return false; }; // fail directory check
            qcp.copy('source', 'dest', callback);

            assert.equal(callback.getCall(0).args[0].message, 'Source path must be a directory');
        });

        it('should glob all files from source directory', function () {
            qcp.copy('source/', 'dest/');
            assert.equal(globSpy.getCall(0).args[0], 'source/**/*');
        });

        it('should correctly glob all files from source directory missing a trailing slash', function () {
            qcp.copy('source', 'dest/');
            assert.equal(globSpy.getCall(0).args[0], 'source/**/*');
        });

        it('should read each file returned by glob.sync', function (done) {
            var spy = sinon.spy(),
                readFile = fsFake.readFile;

            fsFake.readFile = function (path, callback) {
                spy(path);
                readFile(path, callback);
            };

            qcp.copy('source/', 'dest/', function () {
                fakeFileList.map(function (value) {
                    return spy.withArgs(value);
                }).forEach(function (spy) {
                    assert.equal(spy.called, true);
                });

                done();
            });

        });

        it('should write each file returned by glob.sync', function (done) {
            var spy = sinon.spy(),
                writeFile = fsFake.writeFile;

            fsFake.writeFile = function (path, data, callback) {
                spy(path, data);
                writeFile(path, data, callback);
            };

            qcp.copy('source/', 'dest/', function () {
                fakeFileList.map(function (value) {
                    return spy.withArgs('dest/' + value, 'foo');
                }).forEach(function (spy) {
                    assert.equal(spy.called, true);
                });
                
                done();
            });
        });

        it('should properly write each file returned by glob.sync when dest is missing a trailing slash', function (done) {
            var spy = sinon.spy(),
                writeFile = fsFake.writeFile;

            fsFake.writeFile = function (path, data, callback) {
                spy(path, data);
                writeFile(path, data, callback);
            };

            qcp.copy('source/', 'dest', function () {
                fakeFileList.map(function (value) {
                    return spy.withArgs('dest/' + value, 'foo');
                }).forEach(function (spy) {
                    assert.equal(spy.called, true);
                });
                
                done();
            });
        });

        it('should call callback with error if file write action fails', function (done) {
            fsFake.writeFile = function (path, data, callback) { callback(new Error()); };

            qcp.copy('souce/', 'dest/', function (error, data) {
                assert.equal(error.message, 'Unable to copy files due to write error');
                done();
            });
        });

    });


    describe('copySync', function () {

        it('should throw error if source path is not a directory', function () {
            lstatResponse.isDirectory = function () { return false; };
            assert.throws(qcp.copySync.bind(null, 'source', 'dest'), 'Source path must be a directory');
        });

        it('should not throw error if source path is a directory', function () {
            lstatResponse.isDirectory = function () { return true; };
            assert.doesNotThrow(qcp.copySync.bind(null, 'source', 'dest'));
        });

        it('should copy files successfully', function () {
            fsFake.readFileSync = sinon.spy();
            fsFake.writeFileSync = sinon.spy();
            qcp.copySync('source', 'dest');

            assert.equal(fsFake.readFileSync.called, true);
            assert.equal(fsFake.writeFileSync.called, true);
        });

        it('should throw an error if write encounters an error', function () {
            fsFake.writeFileSync = function () { throw new Error(); };

            assert.throws(qcp.copySync.bind(null, 'source', 'dest'), 'Unable to copy files due to write error');
        });

    });


});