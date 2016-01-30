import I = require('./interfaces')
import crypto = require('./crypto')
import Config = require("./Config")
import lzString = require('lz-string')
import _ = require('lodash')

/**
 * Constructs a new PersistentStorage instead
 * @param opts
 * @param {boolean=false} opts.useCompression
 * @param {string=} opts.keyPrefix
 * @param opts.storageBackend
 * @constructor
 */
class PersistentStorage {
    private config: Config;
    private store: Storage;
    private cache: {[key: string]: any};

    constructor(opts: I.Config) {
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

    static generateSalt(lengthBytes: number): string {
        return crypto.generateSalt(lengthBytes)
    }

    static generateIV(lengthBytes: number): Buffer {
        return crypto.generateIV(lengthBytes)
    }

    /**
     * Sets a value in the persistent storage
     * @param {string} key - Key to associate this value with
     * @param {*} value - Value to store, if undefined will delete the given key
     */
    setItem(key: string, value: any): void {
        key = this.config.keyPrefix + key

        if (_.isUndefined(value)) {
            return this.removeItem(key)
        }

        if (this.config.useCache) {
            this.cache[key] = value
        }

        if (this.config.encryptKeys) {
            key = crypto.encryptUtf8(key, this.config.encryption)
        }

        this.store.setItem(key, convertValueForStorage(value, this.config))
    }

    /**
     * Gets a value from the persistant storage, uses in memory cache if possible
     * @param {string} key - Key to retrieve
     * @returns {*}
     */
    getItem(key: string): any {
        key = this.config.keyPrefix + key

        if (this.config.useCache && this.cache.hasOwnProperty(key)) {
            return this.cache[key]
        }

        if (this.config.encryptKeys) {
            key = crypto.encryptUtf8(key, this.config.encryption)
        }

        var value = this.store.getItem(key)

        if (value) {
            value = inflateValueFromStorage(value, this.config)

            if (this.config.useCache) {
                this.cache[key] = value
            }

            return value
        }
    }

    /**
     * Gets the nth key in the store, note that the order of keys is not guaranteed but
     * will be consistent so long as the key set stays the same.
     * @param {number} n
     * @returns {string}
     */
    key(n: number): string {
        return this.keys()[n]
    }

    /**
     * Gets an array of the keys in the store
     * @returns {string[]}
     */
    keys(): string[] {
        var prefix = this.config.keyPrefix,
            keys = _.chain(_.keys(this.store))

        if (this.config.encryptKeys) {
            keys = keys.map(key => {
                try {
                    return crypto.decryptUtf8(key, this.config.encryption)
                } catch (err) {
                    return '';
                }
            })
            keys = keys.compact()
        }

        if (prefix) {
            keys = keys.filter(function (key) {
                    return _.startsWith(key, prefix)
                })
                .map(function (key) {
                    return key.substr(prefix.length)
                })
        }

        return keys.value()
    }

    /**
     * Removes an item from the store
     * @param {string} key
     */
    removeItem(key: string): void {
        key = this.config.keyPrefix + key

        delete this.cache[key]

        if (this.config.encryptKeys) {
            key = crypto.encryptUtf8(key, this.config.encryption)
        }

        this.store.removeItem(key)
    }

    /**
     * Clears all items from the store
     */
    clear(): void {
        this.purgeCache()

        if (this.config.keyPrefix) {
            _.forEach(this.keys(), key => this.removeItem(key))
        } else {
            this.store.clear()
        }
    }

    purgeCache(): void {
        this.cache = {}
    }

}

function convertValueForStorage(value: any, config: Config): string {
    var str = JSON.stringify(value)

    if (config.useCompression) {
        str = lzString.compressToUTF16(str)
    }

    if (config.useEncryption) {
        str = crypto.encryptUcs2(str, config.encryption)
    }

    return str
}

function inflateValueFromStorage(str: string, config: Config): any {

    if (config.useEncryption) {
        str = crypto.decryptUcs2(str, config.encryption)
    }

    if (config.useCompression) {
        str = lzString.decompressFromUTF16(str)
    }

    return JSON.parse(str)
}

export = PersistentStorage;
