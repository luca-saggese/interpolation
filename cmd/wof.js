var wof = require('../api/wof');

// help text
if( process.argv.length !== 3 ){
  console.error('invalid args.');
  console.error('usage: {wofdb}');
  console.error('example: node cmd/wof wof.db');
  process.exit(1);
}

var conn = wof( process.argv[2] );

conn.query( function( err, res ){

  if( err ){
    return console.error( err );
  }

  console.error( 'done', res );
  

});

conn.close();
