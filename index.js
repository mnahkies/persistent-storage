var lzString = require('lz-string')

function Config(opts) {
    this.useCompression = opts.useCompression || false
}

/**
 * Constructs a new PersistentStorage instead
 * @param opts
 * @param {boolean=false} opts.useCompression
 * @param opts.storageBackend
 * @constructor
 */
function PersistentStorage(opts) {
    this.config = new Config(opts)
    this.store = opts.storageBackend || localStorage
    this.cache = {}

    if (!this.store) {
        throw new Error("No storageBackend was given and localStorage does not exist")
    }

    Object.defineProperty(this, 'length', {
        get: function () {
            return this.keys().length
        }
    })
}

/**
 * Sets a value in the persistent storage
 * @param {string} key - Key to associate this value with
 * @param {*} value - Value to store, if undefined will delete the given key
 */
PersistentStorage.prototype.setItem = function (key, value) {
    if (value === undefined) {
        this.removeItem(key)
    }

    this.cache[key] = value
    this.store.setItem(key, convertValueForStorage(value, this.config))
}

/**
 * Gets a value from the persistant storage, uses in memory cache if possible
 * @param {string} key - Key to retrieve
 * @returns {*}
 */
PersistentStorage.prototype.getItem = function (key) {
    if (this.cache.hasOwnProperty(key)) {
        return this.cache[key]
    }

    var value = this.store.getItem(key)

    if (value) {
        return this.cache[key] = inflateValueFromStorage(value, this.config)
    }
}

/**
 * Gets the nth key in the store, note that the order of keys is not guaranteed but
 * will be consistent so long as the key set stays the same.
 * @param {number} n
 * @returns {string}
 */
PersistentStorage.prototype.key = function (n) {
    return this.store.key(n)
}

/**
 * Gets an array of the keys in the store
 * @returns {string[]}
 */
PersistentStorage.prototype.keys = function () {
    return Object.keys(this.store)
}

/**
 * Removes an item from the store
 * @param {string} key
 */
PersistentStorage.prototype.removeItem = function (key) {
    delete this.cache[key]
    this.store.removeItem(key)
}

/**
 * Clears all items from the store
 */
PersistentStorage.prototype.clear = function () {
    this.cache = {}
    this.store.clear()
}

function convertValueForStorage(value, config) {
    var str = JSON.stringify(value)

    if (config.useCompression) {
        str = lzString.compressToUTF16(str);
    }

    return str;
}

function inflateValueFromStorage(value, config) {

    if (config.useCompression) {
        value = lzString.decompressFromUTF16(value)
    }

    return JSON.parse(value)
}

module.exports = PersistentStorage
