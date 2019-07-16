
var geocode = require('../api/geocode');

// help text
if( process.argv.length !== 5 ){
  console.error('invalid args.');
  console.error('usage: {addressdb} {streetdb} {name}');
  console.error('example: node cmd/search address.db street.db "glasgow street 14"');
  process.exit(1);
}

var conn = geocode( process.argv[2], process.argv[3] );
var street = process.argv[4];

conn.query( street, function( err, res ){

  if( err ){
    return console.error( err );
  }

  if( !res ){
    return console.error( '0 results found' );
  }

  for( var attr in res ){
    console.log( attr + '\t' + res[attr] );
  }

});

conn.close();
