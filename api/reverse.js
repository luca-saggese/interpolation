
var sqlite3 = require('sqlite3'),
    polyline = require('@mapbox/polyline'),
    requireDir = require('require-dir'),
    query = requireDir('../query'),
    project = require('../lib/project'),
    proximity = require('../lib/proximity');

// polyline precision
var PRECISION = 6;

// export setup method
function setup( streetDbPath, wofDbPath ){
console.log( streetDbPath, wofDbPath );
  // connect to db
  sqlite3.verbose();
  // @todo: this is required as the query uses the 'street.' prefix for tables
  var db = new sqlite3.Database( ':memory:', sqlite3.OPEN_READONLY );

  // attach street database
  query.attach( db, streetDbPath, 'street' );

  // attach wof database
  query.attach( db, wofDbPath, 'wof' );

  // query method
  var q = function( coord, cb ){

    var point = {
      lat: parseFloat( coord.lat ),
      lon: parseFloat( coord.lon )
    };

    // error checking
    if( isNaN( point.lat ) ){ return cb( 'invalid latitude' ); }
    if( isNaN( point.lon ) ){ return cb( 'invalid longitude' ); }

    // perform a db lookup for nearby streets
    query.reverse( db, point, function( err, res ){

      // an error occurred or no results were found
      if( err || !res || !res.length ){ return cb( err, null ); }

      // decode polylines
      res.forEach( function( street, i ){
        res[i].coordinates = project.dedupe( polyline.toGeoJSON(street.line, PRECISION).coordinates );
      });

      // order streets by proximity from point (by projecting it on to each line string)
      var ordered = proximity.nearest.street( res, [ point.lon, point.lat ] );

      var result = ordered[0];
      delete result.street.coordinates;
      query.wof( db, point, function( err, res ){
        if( err || !res ){ return cb( err, null ); }

        result.admin = res;
        cb( null, result );
      });
    });
  };

  // return methods
  return {
    query: q,
    close: db.close.bind( db ),
  };
}

module.exports = setup;
