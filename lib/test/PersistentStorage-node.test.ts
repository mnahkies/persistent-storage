import PersistentStorageTest = require('./PersistentStorage.test')
var StorageShim = require('node-storage-shim')

PersistentStorageTest(() => new StorageShim())
