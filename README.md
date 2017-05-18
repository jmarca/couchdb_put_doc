# couchdb_put_doc

[![Greenkeeper badge](https://badges.greenkeeper.io/jmarca/couchdb_put_doc.svg)](https://greenkeeper.io/)

This is a utility to put a new doc into couchdb

It uses superagent.

it is really simple.  just avoids some repeated code.

The program is a function generator.  You call it with the name of the
options object, including (required) the name of the db

The program expects that the url, port, username, password are in
environment variables.  If not, put them in the initializatin object


The code says it all:


```javascript
function  put_doc(opts){

    if(opts.cdb === undefined)
        throw new Error('must define the {"cdb":"dbname"} option')
    var cuser = env.COUCHDB_USER
    var cpass = env.COUCHDB_PASS
    var chost = env.COUCHDB_HOST  || '127.0.0.1'
    var cport = env.COUCHDB_PORT || 5984
    //  override env. vars
    if(opts.cuser !== undefined) cuser = opts.cuser
    if(opts.cpass !== undefined) cpass = opts.cpass
    if(opts.chost !== undefined) chost = opts.chost
    if(opts.cport !== undefined) cport = +opts.cport
```

If you need to "reput" a document, you can call the function
`putter.overwrite(true)`, as in

``` javascript
var putter = putdoc({cdb:test_db,
                     cuser:cuser,
                     cpass:cpass,
                     chost:chost,
                     cport:cport
                    })
var testdoc = {'_id':'testing',
               'value':'banana'
              }
var doc_replace = {_id:testdoc._id,
                   'pancake':'breakfast'}
putter(testdoc,function(e,r){
    putter.overwrite(true)
    putter(doc_replace,function(e,r){
        // old doc was replaced with new doc
        r.should.have.property('ok')
        r.should.have.property('rev')
        r.should.have.property('id',testdoc._id)
        r.should.not.have.property('value')
        r.should.have.property('pancake','breakfast')
        done()
    })
})
```
