var sqlite3 = require('sqlite3')
//https://stackoverflow.com/questions/38869351/is-node-sqlite-each-function-load-all-queries-into-memory-or-it-use-stream-pip

function asyncEach(db, sql, parameters, eachCb, doneCb) {
  let stmt;

  let cleanupAndDone = err => {
    stmt.finalize(doneCb.bind(null, err));
  };

  stmt = db.prepare(sql, parameters, err => {
    if (err) {
      return cleanupAndDone(err);
    }
    let next = err => {
      if (err) {
        return cleanupAndDone(err);
      }
      return stmt.get(recursiveGet);
    };
    // Setup recursion
    let recursiveGet = (err, row) => {
      if (err) {
        return cleanupAndDone(err);
      }
      if (!row) {
        return cleanupAndDone(null);
      }
      // Call the each callback which must invoke the next callback
      return eachCb(row, next);
    }
    // Start recursion
    stmt.get(recursiveGet);
  });
}

// export setup method
function setup( wofDbPath ){

  // connect to db
  sqlite3.verbose();
  var db = new sqlite3.Database( wofDbPath, sqlite3.OPEN_READWRITE );

  var stmt = {
    index: db.prepare('CREATE INDEX IF NOT EXISTS id_idx ON spr (id);'),
    names: db.prepare([
      'UPDATE spr SET max_latitude=$max_latitude, min_latitude=$min_latitude,',
      'max_longitude=$max_longitude, min_longitude=$min_longitude',
      'WHERE id=$id;'
    ].join(' '))
  };


  // attach street database
  //query.attach( db, streetDbPath, 'street' );

  // enable memmapping of database pages
  db.run('PRAGMA mmap_size=268435456;');
  //db.run('PRAGMA street.mmap_size=268435456;');

  stmt.index.run();

  // query method
  var q = function( cb ){

    var sql = 'SELECT * FROM geojson;';
    let rowCount = 0;
    asyncEach(db, sql, [], (row, next) => {
      var bbox = JSON.parse(row['body']).bbox;
      var data = {
        $max_latitude: bbox[2],
        $min_latitude: bbox[0],
        $max_longitude: bbox[3],
        $min_longitude: bbox[1],
        $id: row.id
      }
      stmt.names.run(data);
      if(++rowCount % 100 == 0){
        console.log(rowCount);
      }

      return next();
    }, err => {
      if (err) {
        return done(err);
      }
      assert.equal(rowCount, TEST_ROW_COUNT);
      return cb( null, {});
    });
  };

  // close method to close db
  var close = db.close.bind( db );

  // return methods
  return {
    query:q,
    close
  };
}

module.exports = setup;
