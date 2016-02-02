[![Build Status](https://travis-ci.org/mnahkies/persistent-storage.svg)](https://travis-ci.org/mnahkies/persistent-storage)

# persistent-storage # 
Abstracts access to any storage object implementing the webstorage Storage interface, and provides some extra features:

- Seamless Serialisation / Deserialization of objects (functions and prototype etc however will not be maintained)
- Optional seamless compression using lz-string
- Optional seamless encryption using node crypto / browserify-crypto
- Optional key scoping

### Configuration ###
See [interfaces](https://github.com/mnahkies/persistent-storage/blob/master/lib/interfaces.ts) for documentation of configuration object


## Example Usage ##

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
        
See unit tests [here](https://github.com/mnahkies/persistent-storage/blob/master/lib/test/PersistentStorage.test.ts) for further examples
    
## Installation ## 
persistent-storage is available as an npm package. Simply run:
    
    npm install --save persistent-storage
    
A generated typescript definition file is provided with the package and should be referenced like
   
    /// <reference path="node_modules/persistent-storage/persistent-storage.d.ts" />
   
    
Running Unit Tests
------------------
The unit tests use mocha and phantomjs, and are setup to run by the standard npm test command.

    npm install
    npm test
    
You can also run them using the browser of your choice by opening the html file [found here](https://github.com/mnahkies/persistent-storage/blob/master/lib/test/PersistentStorage.test.html)
