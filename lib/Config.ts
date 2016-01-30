import crypto = require('./crypto')
import _ = require('lodash')

class Config {
    useCompression: boolean;
    useEncryption: boolean;
    useCache: boolean;
    keyPrefix: string;
    encryption: crypto.Options;

    constructor(opts) {
        this.useCompression = _.isBoolean(opts.useCompression) ? opts.useCompression : false
        this.useCache = _.isBoolean(opts.useCache) ? opts.useCache : true
        this.keyPrefix = opts.keyPrefix || ''

        if (opts.encryption) {
            this.useEncryption = true;
            this.encryption = {
                algorithm: opts.encryption.method || 'aes-256-cbc',
                key: crypto.deriveEncryptionKey(new crypto.KeyDerivationOptions(opts.encryption)),
                iv: opts.encryption.iv
            }
        }
    }
}

export = Config;
