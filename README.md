[![Build Status](https://travis-ci.org/mnahkies/persistent-storage.svg)](https://travis-ci.org/mnahkies/persistent-storage)

persistent-storage
==================
Abstracts access to any storage object implementing the webstorage Storage interface, offering optional compression using lz-string

### Available Options ###

- *useCompression*: boolean - defaults false, sets whether to compress stored values using lz-string
- *keyPrefix*: string - defaults empty, sets whether to scope the storage by transparently prefixing keys
- *storageBackend*: T implements Storage - defaults to localStorage, can be any object providing the interface specified by [w3c Storage Interface](https://w3c.github.io/webstorage/#storage-0)

Example Usage
-----
    //Without Scoping
    var PersistentStore = require('persistent-store')
    
    var store = new PersistentStorage({
            useCompression: false, 
            storageBackend: new StorageShim()
        })

    store.setItem("myObj", {foo: "bar"})
    console.log(store.getItem("myObj")) // Prints {foo: "bar"}
    
    
    //With scoping
        
        var fred = new PersistentStorage({
                useCompression: true, 
                keyPrefix: 'fred'
                storageBackend: new StorageShim()
            })
            
        var bob = new  PersistentStorage({
                useCompression: false, 
                keyPrefix: 'bob'
                storageBackend: new StorageShim()
            })
    
        fred.setItem("name", "Fred")
        bob.setItem("name", "Bob")
        
        console.log(fred.getItem("name")) // prints Fred
        console.log(bob.getItem("name")) // prints  Bob
    
Installation
------------
persistent-storage is available as an npm package. Simply run:
    
    npm install --save persistent-storage
    
    
Running Unit Tests
------------------
The unit tests use mocha, and are setup to run by the standard npm test command.

    npm install
    npm test
    
