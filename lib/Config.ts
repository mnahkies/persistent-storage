import crypto = require('./crypto')
import I = require('./interfaces')
import _ = require('lodash')

class Config {
    useCompression: boolean;
    useEncryption: boolean;
    encryptKeys: boolean;
    useCache: boolean;
    keyPrefix: string;
    encryption: crypto.Options;

    constructor(opts: I.Config) {
        this.useCompression = _.isBoolean(opts.useCompression) ? opts.useCompression : false
        this.useCache = _.isBoolean(opts.useCache) ? opts.useCache : true
        this.keyPrefix = opts.keyPrefix || ''

        if (opts.encryption) {
            this.useEncryption = true
            this.encryptKeys = _.isBoolean(opts.encryption.encryptKeys) ? opts.encryption.encryptKeys : true
            this.encryption = {
                algorithm: opts.encryption.algorithm || 'aes-256-cbc',
                key: crypto.deriveEncryptionKey(new crypto.KeyDerivationOptions(opts.encryption)),
                iv: opts.encryption.iv
            }
        }
    }
}

export = Config
