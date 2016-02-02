export interface Config {
    /**
     * Enables seamless compression of stored values using lz-string
     * defaults to false
     */
    useCompression?: boolean;
    /**
     * Enables write-through caching of values
     * defaults to true
     */
    useCache?: boolean;
    /**
     * Scopes the instance to prefix keys by given value, the prefix
     * should not be included when performing get or set operations
     * defaults to '' (no scoping)
     */
    keyPrefix?: string;
    /**
     * The storage backend to use. Can be any object that implements the Storage
     * interface specified here https://w3c.github.io/webstorage/#storage-0
     */
    storageBackend?: Storage;
    /**
     * Passing this object enables seamless encryption of values using
     * the node crypto module (or browserify-crypto if used with browserify)
     *
     * See node crypto / openssh documentation for details of alternative
     * algorithms, digest and more detailed information about the values
     * required.
     *
     */
    encryption?: {
        /**
         * specifies the encryption algorithm to use
         * defaults to aes-256-cbc
         */
        algorithm?: string;
        /**
         * enables encryption of the keys as well as values
         * defaults to true
         */
        encryptKeys?: boolean;
        /**
         * specifies the password to use for encryption key derivation
         */
        password: string;
        /**
         * specifies the initialisation vector to use, should be of suitable length
         * for chosen algorithm (aes-256-cbc requires 16 bytes)
         */
        iv: Buffer;
        /**
         * specifies the salt to use
         */
        salt?: string;
        /**
         * specifies the number of iterations to use during key derivation, higher values
         * are more secure but give slower initialisation
         * defaults to 10
         */
        iterations?: number;
        /**
         * specifies the number of bytes for the derived key length, must suit chosen algorithm
         * defaults to 16 (correct length for aes-256-cbc)
         */
        derivedKeyLength?: number;
        /**
         * specifies hash used to derive key
         * defaults to sha512
         */
        digest?: string
    }
}
