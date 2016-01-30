import _ = require('lodash')
import I = require('../interfaces')
import PersistentStorage = require('../PersistentStorage')
import Chance = require('chance')
import assert = require('assert')
import util = require('util')

function runTests(storageBackendFactory: () => Storage) {
    describe('PersistentStorage', function () {
        it('throws an error if no storage backend is provided', function () {
            expectToThrow(() => new PersistentStorage({}))
        })
        describe('standard tests', () => {
            var options: {name: string; values: any[]}[] = [
                {
                    name: 'useCompression',
                    values: [false, true]
                },
                {
                    name: 'useCache',
                    values: [false, true]
                },
                {
                    name: 'encryption',
                    values: [undefined,
                        {
                            password: 'my super secret password!#$',
                            iv: PersistentStorage.generateIV(16)
                        },
                        {
                            password: 'my super secret password',
                            iv: PersistentStorage.generateIV(16),
                            salt: PersistentStorage.generateSalt(64)
                        },
                        {
                            encryptKeys: true,
                            password: 'my super secret password',
                            iv: PersistentStorage.generateIV(16),
                            salt: PersistentStorage.generateSalt(64)
                        }
                    ]
                }
            ]

            runTests('with a single instance', options.concat([{
                name: 'keyPrefix',
                values: [undefined, 'some-key-prefix']
            }]), storageBackendFactory())

            describe('with multiple instances using key prefixes', () => {
                var firstOptions = options.concat([
                        {
                            name: 'keyPrefix',
                            values: ['some-key-prefix']
                        },
                    ]),
                    secondOptions = options.concat([
                        {
                            name: 'keyPrefix',
                            values: ['some-other-key-prefix']
                        },
                    ]),
                    storageBackend = storageBackendFactory()

                runTests('first instance', firstOptions, storageBackend)
                runTests('second instance', secondOptions, storageBackend)
            })

            function runTests(description, options, storageBackend) {
                describe(description, () => {
                    _.map(generateConfigCombinations(options), function (config: I.Config) {
                        describe("with configuration " + configToDescriptiveString(config), function () {
                            config.storageBackend = storageBackend

                            var instance = new PersistentStorage(config)

                            testSaveAndRead(instance)
                            testKeys(instance)
                        })
                    })
                })
            }

            function generateConfigCombinations(options): I.Config[] {

                function generate(path: any[], remaining: any[], results: any[]) {
                    if (remaining.length === 0) {
                        results.push(_.extend.apply(_, [{}].concat(path)))
                        return results;
                    }

                    var first = _.first(remaining)
                    if (first) {
                        _.map(first.values, function (value) {
                            generate(path.concat([{[first.name]: value}]), _.tail(remaining), results)
                        })
                    } else {
                        results.push(path)
                    }
                    return results
                }

                return generate([], options, [])
            }

            function configToDescriptiveString(config: I.Config) {
                return util.format('useCompression=%s useEncryption=%s encryptKeys=%s useCache=%s keyPrefix=%s',
                    config.useCompression, !!config.encryption, config.encryption && config.encryption.encryptKeys, config.useCache, config.keyPrefix);
            }

            function testSaveAndRead(instance: PersistentStorage) {
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
                        assert.deepEqual(instance.getItem(key), value)
                        instance.purgeCache();
                        assert.deepEqual(instance.getItem(key), value)
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
                storageBackend = storageBackendFactory()
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
        describe.skip('with large data using encryption and compression', () => {
            /*
             TODO This doesn't run in phantomjs, uses memory like crazy until it crashes. Runs ok in chrome.
             */

            var instance,
                data,
                clonedData,
                chance

            before(() => {
                chance = new Chance()

                instance = new PersistentStorage({
                    useCompression: true,
                    encryption: {
                        encryptKeys: true,
                        password: 'my super secret password',
                        iv: PersistentStorage.generateIV(16),
                        salt: PersistentStorage.generateSalt(64)
                    },
                    storageBackend: storageBackendFactory()
                })

                data = [];

                _.times(1000, n => {
                    data.push({
                        id: n,
                        first: chance.first(),
                        last: chance.last(),
                        time: (new Date()).toUTCString(),
                        message: chance.paragraph()
                    })
                })

                clonedData = _.cloneDeep(data)
            })

            it('can store large objects', () => {
                console.log('attempting to store a large object')
                instance.setItem('my long key', data)
            })
            it('can retrieve un-cached large objects', () => {
                instance.purgeCache()
                assert.deepEqual(instance.getItem('my long key'), clonedData)
            })
            it('can retrieve cached large objects', () => {
                assert.deepEqual(instance.getItem('my long key'), clonedData)
            })
        })
    })
}

function expectToThrow(fn: Function) {
    var threw

    try {
        fn()
        threw = false
    } catch (err) {
        threw = true
    }

    assert.ok(threw, "didn't throw an exception")
}

export = runTests
