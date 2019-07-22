var admin = require('../api/admin'),
    pretty = require('../lib/pretty');

// help text
if( process.argv.length !== 6  ){
  console.error('invalid args.');
  console.error('usage:  {streetdb} {wofdb} {lat} {lon}');
  console.error('example: node cmd/admin street.db wof.db "-41.288788" "174.766843"');
  process.exit(1);
}

var conn = admin( process.argv[2], process.argv[3] );

var point = {
  lat: parseFloat( process.argv[4] ),
  lon: parseFloat( process.argv[5] )
};

conn.query( point,  function( err, res ){

  if( !res ){
    return console.error( '0 results found' );
  }


  console.log(res);

});

conn.close();
