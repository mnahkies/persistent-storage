var assert = require('assert')

var PersistentStorage = require('./index.js'),
    StorageShim = require('node-storage-shim')


describe('PersistentStorage', function () {
    it('throws an error if no storage backend is provided and localStorage does not exist', function () {
        try {
            var instance = new PersistentStorage({})
        } catch (e) {
            assert.ok(true, 'Threw an error')
        }
    })

    describe('without key prefixing', function () {

        describe('without compression', function () {
            var instance = new PersistentStorage({useCompression: false, storageBackend: new StorageShim()})
            testSaveAndRead(instance)
            testKeys(instance)
        })

        describe('with compression', function () {
            var instance = new PersistentStorage({useCompression: true, storageBackend: new StorageShim()})
            testSaveAndRead(instance)
            testKeys(instance)
        })

        function testSaveAndRead(instance) {
            runTest('string', 'My Test String')
            runTest('string', '')
            runTest('boolean', true)
            runTest('boolean', false)
            runTest('object', {})
            runTest('object', {foo: 'bar'})
            runTest('array', [1, 2, 3])
            runTest('null', null)
            runTest('undefined', undefined)

            function runTest(type, value) {
                it('can save and read back a ' + type, function () {
                    var key = type + Math.random()

                    instance.setItem(key, value)
                    assert.strictEqual(instance.getItem(key), value)
                    instance.removeItem(key)
                    assert.strictEqual(instance.getItem(key), undefined)
                })
            }
        }

        function testKeys(instance) {
            it("clear will result in no keys", function () {
                instance.clear()
                assert.strictEqual(instance.keys().length, 0)
                assert.strictEqual(instance.length, 0)
            })
            it("adding an items will result in keys being in the array", function () {
                instance.setItem('foo', 'bar')
                assert.strictEqual(instance.key(0), 'foo')
                assert.strictEqual(instance.keys()[0], 'foo')
                assert.strictEqual(instance.keys().length, 1)
                assert.strictEqual(instance.length, 1)
            })
        }
    })

    describe('with a key prefix', function () {
        var storageBackend,
            fredsInstance,
            bobsInstance

        beforeEach(function () {
            storageBackend = new StorageShim()
            fredsInstance = new PersistentStorage({
                storageBackend: storageBackend,
                keyPrefix: 'fred'
            })
            bobsInstance = new PersistentStorage({
                storageBackend: storageBackend,
                keyPrefix: 'bob',
                useCompression: true
            })
        })

        it('does not allow access to items stored in Fred\'s instance from Bob\'s instance', function () {
            fredsInstance.setItem('lastName', 'Smith')
            assert.strictEqual(bobsInstance.getItem('lastName'), undefined)
        })
        it('does not overwrite items stored in other prefixed instances', function () {
            fredsInstance.setItem('lastName', 'Smith')
            bobsInstance.setItem('lastName', 'Jones')
            assert.strictEqual(bobsInstance.getItem('lastName'), 'Jones')
        })
        it('does not allow deletion of items stored in Fred\'s instance from Bob\'s instance', function () {
            fredsInstance.setItem('lastName', 'Smith')
            bobsInstance.removeItem('lastName')

            assert.strictEqual(fredsInstance.getItem('lastName'), 'Smith')
            assert.strictEqual(bobsInstance.getItem('lastName'), undefined);
        })
        it('scopes keys to the prefixed instance', function () {
            fredsInstance.setItem('lastName', 'Smith')
            bobsInstance.setItem('phoneNumber', '32-4234-123')

            assert.deepEqual(fredsInstance.keys(), ['lastName'])
            assert.deepEqual(bobsInstance.keys(), ['phoneNumber'])
        })
        it('scopes key to the prefixed instance', function () {
            fredsInstance.setItem('lastName', 'Smith')
            bobsInstance.setItem('phoneNumber', '32-4234-123')

            assert.strictEqual(fredsInstance.key(0), 'lastName')
            assert.strictEqual(bobsInstance.key(0), 'phoneNumber')
        })
        it('scopes clear to the prefixed instance', function () {
            fredsInstance.setItem('lastName', 'Smith')
            bobsInstance.setItem('phoneNumber', '32-4234-123')
            fredsInstance.clear();

            assert.strictEqual(fredsInstance.length, 0)
            assert.strictEqual(bobsInstance.length, 1)
        })
    });

})
