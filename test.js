var assert = require('assert')

var Storage = require('./index.js'),
    StorageShim = require('node-storage-shim')


describe('PersistentStorage', function () {

    it('throws an error if no storage backend is provided and localStorage does not exist', function () {
        try {
            var instance = new Storage({})
        } catch (e) {
            assert.ok(true, 'Threw an error')
        }
    })

    describe('without compression', function () {
        var instance = new Storage({useCompression: false, storageBackend: new StorageShim()})
        testSaveAndRead(instance)
    })

    describe('with compression', function () {
        var instance = new Storage({useCompression: true, storageBackend: new StorageShim()})
        testSaveAndRead(instance)
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
        })
    }
}
