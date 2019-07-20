var sqlite3 = require('sqlite3')


// export setup method
function setup( wofDbPath ){

  // connect to db
  sqlite3.verbose();
  var db = new sqlite3.Database( wofDbPath, sqlite3.OPEN_READWRITE );

  var stmt = {
    names: db.prepare([
      'UPDATE names SET max_latitude=$max_latitude, min_latitude=$min_latitude',
      'max_longitude=$max_longitude, min_longitude=$min_longitude;'
    ].join(' '))
  };

  // attach street database
  //query.attach( db, streetDbPath, 'street' );

  // enable memmapping of database pages
  db.run('PRAGMA mmap_size=268435456;');
  db.run('PRAGMA street.mmap_size=268435456;');

  // query method
  var q = function( cb ){

    var sql = 'SELECT * FROM geojson;';
  
    // execute query
    db.all( sql, null, (res) => {
      res.forEach(row=>{
        var bbox = JSON.parse(row['geojson']).bbox;
        var data = {
          $max_latitude: bbox[2],
          $min_latitude: bbox[0],
          $max_longitude: bbox[3],
          $min_longitude: bbox[1]
        }
        stmt.names.run(data);
      })
    } );
    
    // close method to close db
    var close = db.close.bind( db );

    return cb( null, close);
  };

  

  // return methods
  return {
    
  };
}

module.exports = setup;
