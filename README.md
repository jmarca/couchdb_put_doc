# couchdb_put_doc

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
