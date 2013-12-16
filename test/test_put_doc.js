/* global require console process describe it before after */

var should = require('should')
var superagent = require('superagent')

var putdoc = require('../.')


var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;

var test_db ='test%2fput%2fdocs'

var couch = 'http://'+chost+':'+cport+'/'+test_db
console.log('testing couchdb='+couch)

/**
 * create a test db, and populate it with data
 * and with a view
 *
 */

var doc = {"_id": "801245",
           "2006": {
           },
           "2007": {
               "vdsimputed": "todo",
               "wim_neigbors_ready": {
                   "wim_id": 77,
                   "distance": 14788,
                   "direction": "east"
               },
               "wim_neigbors": {
                   "wim_id": 77,
                   "distance": 14788,
                   "direction": "east"
               },
               "truckimputed": "2013-04-06T04:45:11.832Z finish",
               "paired_wim": null,
               "vdsdata": "0",
               "rawdata": "1",
               "row": 1,
               "vdsraw_chain_lengths": [2,2,2,2,2],
               "vdsraw_max_iterations": 0,
               "occupancy_averaged": 1,
               "truckimputation_chain_lengths": [
                   145,
                   147,
                   144,
                   139,
                   143
               ],
               "truckimputation_max_iterations": 0
           },
           "2008": {
               "vdsimputed": "todo",
               "wim_neigbors_ready": {
                   "wim_id": 77,
                   "distance": 14788,
                   "direction": "east"
               },
               "wim_neigbors": {
                   "wim_id": 77,
                   "distance": 14788,
                   "direction": "east"
               },
               "vdsdata": "0",
               "rawdata": "1",
               "row": 1,
               "truckimputed": "2012-05-21 inprocess",
               "vdsraw_chain_lengths": [2,2,2,2,2],
               "vdsraw_max_iterations": 0
           }}

describe('put',function(){
    before(function(done){
        // create a test db, the put data into it
        superagent.put(couch)
        .auth(cuser,cpass)
        .end(function(e,r){
            return done()
        })
        return null
    })

    after(function(done){
        // bail in development
        //console.log(couch)
        // return done()
        var opts = {'uri':couch
                   ,'method': "DELETE"
                   ,'headers': {}
                   };
        superagent.del(couch)
        .type('json')
        .auth(cuser,cpass)
        .end(function(e,r){
            if(e) return done(e)
            return done()
        })
        return null
    })

    it('should put a doc woth an id',function(done){
        var putter = putdoc({cdb:test_db,
                             cuser:cuser,
                             cpass:cpass,
                             chost:chost,
                             cport:cport
                            })
        putter(doc,function(e,r){
            should.not.exist(e)
            r.should.have.property('ok')
            r.should.have.property('rev')
            r.should.have.property('id',doc._id)
            done()
        })

    })
    it('should put a doc wothiut an id',function(done){
        var putter = putdoc({cdb:test_db,
                             cuser:cuser,
                             cpass:cpass,
                             chost:chost,
                             cport:cport
                            })
        putter({foo:'bar',beyond:'relief'},function(e,r){
            should.not.exist(e)
            r.should.have.property('ok')
            r.should.have.property('rev')
            r.should.have.property('id')
            done()
        })

    })
    it('should not be able to overwrite an existing doc unless told to do so',function(done){
        var putter = putdoc({cdb:test_db,
                             cuser:cuser,
                             cpass:cpass,
                             chost:chost,
                             cport:cport
                            })
        putter.overwrite(false)
        var testdoc = {'_id':'testingnot',
                       'value':'banana'
                      }
        var doc_replace = {_id:testdoc._id,
                           'pancake':'breakfast'}
        putter(testdoc,function(e,r){
            should.not.exist(e)
            r.should.have.property('ok')
            r.should.have.property('rev')
            r.should.have.property('id',testdoc._id)
            putter(doc_replace,function(e,r){
                r.should.not.have.property('ok')
                r.should.not.have.property('rev')
                r.should.not.have.property('id')
                r.should.have.property('error','conflict')
                done()
            })
        })

    })
    it('should be able to overwrite an existing doc',function(done){
        var putter = putdoc({cdb:test_db,
                             cuser:cuser,
                             cpass:cpass,
                             chost:chost,
                             cport:cport
                            })
        putter.overwrite(true)
        var testdoc = {'_id':'testing',
                       'value':'banana'
                      }
        var doc_replace = {_id:testdoc._id,
                           'pancake':'breakfast'}
        putter(testdoc,function(e,r){
            should.not.exist(e)
            r.should.have.property('ok')
            r.should.have.property('rev')
            r.should.have.property('id',testdoc._id)
            putter(doc_replace,function(e,r){
                r.should.have.property('ok')
                r.should.have.property('rev')
                r.should.have.property('id',testdoc._id)
                superagent.get(couch+'/'+testdoc._id)
                .type('json')
                .end(function(e,r){
                    var got_doc = JSON.parse(r.text)
                    got_doc.should.not.have.property('value')
                    got_doc.should.have.property('pancake','breakfast')
                })
                done()
            })
        })

    })
})