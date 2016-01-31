var crypto = require('crypto')

export interface Options {
    algorithm: string;
    key: string;
    iv: Buffer;
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
    iterations: number = 10;
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


export function encryptUtf8(str: string, options: Options): string {
    return encrypt(str, 'utf8', options)
}

export function encryptUcs2(str: string, options: Options): string {
    return encrypt(str, 'ucs2', options)
}

export function decryptUtf8(str: string, options: Options): string {
    return decrypt(str, 'utf8', options)
}

export function decryptUcs2(str: string, options: Options): string {
    return decrypt(str, 'ucs2', options)
}

const MIN_CHUNK_SIZE = 32
var chunkSize: number = 512

function encrypt(str: string, srcEncoding: string, options: Options): string {
    var cipher = crypto.createCipheriv(options.algorithm, options.key, options.iv)

    var result: string = '',
        elapsed: number,
        chunkStart: number,
        chunk: string

    while (str.length > 0) {

        if (chunkStart) {
            //only want to adapt the chunkSize if we are processing something bigger than a single chunk
            if (elapsed > 5 && chunkSize > MIN_CHUNK_SIZE) {
                chunkSize /= 2
            } else if (elapsed === 0) {
                chunkSize *= 2
            }
        }

        chunkStart = Date.now()

        chunk = str.slice(0, chunkSize)
        str = str.slice(chunkSize)

        result += cipher.update(chunk, srcEncoding).toString('ucs2')

        elapsed = Date.now() - chunkStart
    }

    return result + cipher.final().toString('ucs2')
}

function decrypt(str: string, destEncoding: string, options: Options): string {
    var decipher = crypto.createDecipheriv(options.algorithm, options.key, options.iv)

    var result: string = '',
        elapsed: number,
        chunkStart: number,
        chunk: string

    while (str.length > 0) {

        if (chunkStart) {
            //only want to adapt the chunkSize if we are processing something bigger than a single chunk
            if (elapsed > 5 && chunkSize > MIN_CHUNK_SIZE) {
                chunkSize /= 2
            } else if (elapsed === 0) {
                chunkSize *= 2
            }
        }

        chunkStart = Date.now()

        chunk = str.slice(0, chunkSize)
        str = str.slice(chunkSize)

        result += decipher.update(chunk, 'ucs2', destEncoding)

        elapsed = Date.now() - chunkStart
    }

    return result + decipher.final(destEncoding)
}
