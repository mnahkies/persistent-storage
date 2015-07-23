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
    this.config = new Config(opts);
    this.store = opts.storageBackend || localStorage
    this.cache = {};

    if (!this.store) {
        throw new Error("No storageBackend was given and localStorage does not exist")
    }
}

/**
 * Sets a value in the persistent storage
 * @param {string} key - Key to associate this value with
 * @param {*} value - Value to store, if undefined will delete the given key
 */
PersistentStorage.prototype.setItem = function (key, value) {
    if (value === undefined) {
        delete this.cache[key]
        this.store.removeItem(key)
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

    return this.cache[key] = inflateValueFromStorage(this.storageBackend.getItem(key), this.config)
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
