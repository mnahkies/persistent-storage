var crypto = require('crypto');

export interface Options {
    algorithm: string;
    key: string;
    iv: string;
}

export function generateSalt(lengthBytes: number): string {
    return crypto.randomBytes(lengthBytes).toString('hex')
}

export function generateIV(lengthBytes: number): Buffer {
    return crypto.randomBytes(lengthBytes)
}

export class KeyDerivationOptions {
    password: string;
    salt: string = '';
    iterations: number = 100000;
    derivedKeyLength: number = 16;
    digest: string = 'sha512';

    constructor(opts: {password: string; salt?: string; iterations?: number; derivedKeyLength?: number; digest?: string}) {
        this.password = opts.password

        this.salt = opts.salt || this.salt
        this.iterations = opts.iterations || this.iterations
        this.derivedKeyLength = opts.derivedKeyLength || this.derivedKeyLength
        this.digest = opts.digest || this.digest
    }
}

export function deriveEncryptionKey(options: KeyDerivationOptions): string {
    return crypto.pbkdf2Sync(
        options.password,
        options.salt,
        options.iterations,
        options.derivedKeyLength,
        options.digest
    ).toString('hex')
}


export function encryptUtf8(str, options: Options): string {
    return encrypt(str, 'utf8', options)
}

export function encryptUcs2(str, options: Options): string {
    return encrypt(str, 'ucs2', options)
}

export function decryptUtf8(str, options: Options): string {
    return decrypt(str, 'utf8', options)
}

export function decryptUcs2(str, options: Options): string {
    return decrypt(str, 'ucs2', options)
}

function encrypt(str, srcEncoding, options: Options): string {
    var cipher = crypto.createCipheriv(options.algorithm, options.key, options.iv)
    return cipher.update(str, srcEncoding).toString('ucs2') + cipher.final().toString('ucs2')
}

function decrypt(str: string, destEncoding: string, options: Options): string {
    var decipher = crypto.createDecipheriv(options.algorithm, options.key, options.iv)
    return decipher.update(str, 'ucs2', destEncoding) + decipher.final(destEncoding)
}
