### 2.0.0 (2016-02-02)

#### Breaking Changes
    
    - Must provide a storageBackend when constructing (no longer defaults to localStorage if available)

#### Other changes

    - Support for encryption of stored values, and optionally keys
    - Rewritten in typescript, and generated definition file provided
    - In memory cache made optional
    - Bug fixes, improved test coverage

### 1.2.0 (2015-08-29)
  
  - Added support for scoped stores
    
### 1.1.0 (2015-08-01)

  - Add missing methods from storage interface. 
  - Fix exception thrown when getting an item that does not exist.
  