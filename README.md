[![Build Status](https://travis-ci.org/mnahkies/persistent-storage.svg)](https://travis-ci.org/mnahkies/persistent-storage)

persistent-storage
==================
Abstracts access to any storage object implementing the webstorage Storage interface, offering optional compression using lz-string

### Available Options ###

*useCompression*: boolean - defaults false, sets whether to compress stored values using lz-string
*storageBackend*: T implements Storage - defaults to localStorage, can be any object providing the interface specified by [w3c Storage Interface](https://w3c.github.io/webstorage/#storage-0)

Example Usage
-----

    var PersistentStore = require('persistent-store')
    
    var store = new PersistentStorage({
            useCompression: false, 
            storageBackend: new StorageShim()
        })

    store.setItem("myObj", {foo: "bar"})
    console.log(store.getItem("myObj"))
    
Running Unit Tests
------------------
The unit tests use mocha, and are setup to run by the standard npm test command.

    npm install
    npm test
    
