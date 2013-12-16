var superagent = require('superagent')
var env = process.env


/**
 * put_doc
 * initialize with the couchdb to save to
 *
 * expects that the url, port, username, password are in environment
 * variables.  If not, add these to the options object.
 *
 * var cuser = env.COUCHDB_USER ;
 * var cpass = env.COUCHDB_PASS ;
 * var chost = env.COUCHDB_HOST || '127.0.0.1';
 * var cport = env.COUCHDB_PORT || 5984;
 *
 * Options:
 *
 * {"cuser":"somerthineg",
 *  "cpass":"password",
 *  "chost":"couchdb host",
 *  "cport":"couchdb port",  // must be a number
 *  "cdb"  :"the%2fcouchdb%2fto%2fuse" // be sure to properly escape your db names
 * }
 *
 * If you don't need user/pass to create docs, feel free to skip
 * these.  I only try to use credentials if these are truthy
 *
 * returns a function that will save new entries
 *
 * to create a new doc in couchdb, call with the
 * object that is the doc, plus a callback
 *
 * The object should be a couchdb doc, but th _id field is optional.
 *
 * but highly recommended
 *
 * The first argument to the callback is whether there is an error in
 * the requqest, the second is the json object returned from couchdb,
 * whcih should have the save state of the document (ok or rejected)
 *
 */

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


    var couch = 'http://'+chost+':'+cport
    if(/http/.test(chost)) couch = chost+':'+cport
    var overwrite = false

    function put(doc,next){
        var uri = couch+'/'+opts.cdb
        var req
        if(overwrite && doc._id !== undefined){
            uri += '/'+doc._id
            superagent.head(uri)
            .end(function(err,res){
                if(res.header.etag){
                    doc._rev=JSON.parse(res.headers.etag)
                }
                var req = superagent.put(uri)
                          .type('json')
                          .set('accept','application/json')
                if(cuser && cpass){
                    req.auth(cuser,cpass)
                }
                req.send(doc)
                req.end(function(e,r){
                    if(e) return next(e)
                    return next(null,r.body)
                })

            })
        }else{
            if(doc._id !== undefined){
                uri += '/'+doc._id
                req = superagent.put(uri)
            }else{
                req = superagent.post(uri)
            }
            req.type('json')
            .set('accept','application/json')
            if(cuser && cpass){
                req.auth(cuser,cpass)
            }
            req.send(doc)
            req.end(function(e,r){
                if(e) return next(e)
                return next(null,r.body)
            })
        }
        return null
    }
    put.overwrite = function(setting){
        if(setting === undefined){
            return overwrite
        }
        overwrite = setting
        return overwrite
    }
    return put
}
module.exports=put_doc
