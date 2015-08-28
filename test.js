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