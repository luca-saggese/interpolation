var sqlite3 = require('sqlite3'),
    requireDir = require('require-dir'),
    query = requireDir('../query'),
    project = require('../lib/project'),
    geodesic = require('../lib/geodesic'),
    analyze = require('../lib/analyze');

// export setup method
function setup( addressDbPath, streetDbPath ){

  // connect to db
  sqlite3.verbose();
  var db = new sqlite3.Database( addressDbPath, sqlite3.OPEN_READONLY );

  // attach street database
  query.attach( db, streetDbPath, 'street' );

  // enable memmapping of database pages
  db.run('PRAGMA mmap_size=268435456;');
  db.run('PRAGMA street.mmap_size=268435456;');

  // query method
  var q = function( street, cb ){

    if( 'string' !== typeof street ){ return cb( 'invalid street' ); }

    var normalized = analyze.parse_address( street );
    if(!normalized.street) {
        normalized={street:[street]};
    }

    // avoid expand?
    //normalized.street=[normalized.street[0]];
    console.log('searching for:', normalized)

    //if( isNaN( normalized.number ) ){ return cb( 'invalid number' ); }
    if( !normalized.street.length ){ return cb( 'invalid street' ); }

    // perform a db lookup for the specified street
    // @todo: perofmance: only query for part of the table
    query.autocomplete( db, normalized, function( err, res ){

      // @note: results can be from multiple different street ids.
console.log('---',err, res)
      // an error occurred or no results were found
      if( err || !res || !res.length ){ return cb( err, null ); }

      var suggestions = res.map(r=>(
        r.name + normalized.number? normalized.number:''+ ', ' + r.city
      ));
      // return interpolated address
      return cb( null, {query: normalized, results:res});
    });
  };

  // close method to close db
  var close = db.close.bind( db );

  // return methods
  return {
    query: q,
    close: close,
  };
}

module.exports = setup;
