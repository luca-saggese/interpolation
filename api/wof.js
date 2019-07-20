var sqlite3 = require('sqlite3')


// export setup method
function setup( wofDbPath ){

  // connect to db
  sqlite3.verbose();
  var db = new sqlite3.Database( wofDbPath, sqlite3.OPEN_READWRITE );

  var stmt = {
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

  // query method
  var q = function( cb ){

    var sql = 'SELECT * FROM geojson;';
  
    // execute query
    db.all( sql, [], (err,res) => {
      console.log(err, res)
      res.forEach(row=>{
        var bbox = JSON.parse(row['body']).bbox;
        var data = {
          $max_latitude: bbox[2],
          $min_latitude: bbox[0],
          $max_longitude: bbox[3],
          $min_longitude: bbox[1],
          $id: row.id
        }
        stmt.names.run(data);
      })
      return cb( null, {});
    } );
    
    

    
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
