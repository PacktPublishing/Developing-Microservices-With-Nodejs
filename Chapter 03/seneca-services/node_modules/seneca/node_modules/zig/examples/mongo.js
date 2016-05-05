

//callbacky()
ziggy()
//asyncy()

function callbacks() {

  var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    collection.insert({a:2}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
  })

}


function asyncy() {

  var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

  var async = require('async')

  var collection,db

  async.series([
    function(done){
      MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err,data){
        if( err ) return done(err)
        db = data
        done()
      })
    },
    function(done){
      collection = db.collection('test_insert')
      collection.insert({a:2}, done)
    },
  ], function(err,docs){
    if( err ) return console.log(err);

    async.parallel([
      function(done){
        collection.count(function(err, count) {
          console.log(format("count = %s", count));
          done()
        });
      },
      function(done){
        collection.find().toArray(done)
      }
    ],function(err, results) {
      if( err ) return console.log(err);
      console.dir(results)
      db.close()
    })
  })
}


function ziggy() {
  var zig = require('..') 

  var MongoClient = require('mongodb').MongoClient
  var format = require('util').format;

  var db,collection

  zig({trace:false})
    .wait(function(data,done){
      MongoClient.connect('mongodb://127.0.0.1:27017/test', done)
    })
    .step(function(data){
      db = data
      return collection = db.collection('test_insert')
    })
    .wait(function(data,done){
      collection.insert({a:2},done)
    })
    .wait(function(data,done){
      collection.count(done)
    })
    .step(function(count){
      console.log(format("count = %s", count));
      return true;
    })
    .wait(function(data,done){
      collection.find().toArray(done)
    })
    .end(function(err,docs){
      if( err ) return console.log(err);
      console.dir(docs)
      db.close()
    })

}
