export interface Config {
    useCompression?: boolean;
    useEncryption?: boolean;
    useCache?: boolean;
    keyPrefix?: string;
    storageBackend?: Storage;

    encryption?: {
        password: string;
        iv: Buffer;
        salt?: string;
        iterations?: number;
        derivedKeyLength?: number;
        digest?: string
    }
}
