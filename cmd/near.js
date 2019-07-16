
var near = require('../api/near'),
    pretty = require('../lib/pretty');

// help text
console.log(process.argv.length)

if( process.argv.length !== 6 ){
  console.error('invalid args.');
  console.error('usage: {addressdb} {streetdb} {lat} {lon}');
  console.error('example: node cmd/near address.db street.db "-41.288788" "174.766843"');
  process.exit(1);
}

var conn = near( process.argv[2], process.argv[3] );
var names = [ process.argv[6] ];

var point = {
  lat: parseFloat( process.argv[4] ),
  lon: parseFloat( process.argv[5] )
};

// optionally pass 'geojson' as the 6th arg to get json output
var renderer = ( process.argv[6] === 'geojson' ) ? pretty.geojson : pretty.table;

conn.query( point, names, function( err, res ){

  if( !res ){
    return console.error( '0 results found' );
  }

  if( renderer === pretty.geojson ){
    console.log( JSON.stringify( renderer( res ), null, 2 ) );
  } else {
    console.log( renderer( res ) );
  }

});

conn.close();
