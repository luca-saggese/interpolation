
var near = require('../api/near'),
    pretty = require('../lib/pretty');

// help text
if( process.argv.length !== 5  ){
  console.error('invalid args.');
  console.error('usage:  {streetdb} {lat} {lon}');
  console.error('example: node cmd/near street.db "-41.288788" "174.766843"');
  process.exit(1);
}

var conn = near( process.argv[2] );
var names = [ process.argv[6] ];

var point = {
  lat: parseFloat( process.argv[3] ),
  lon: parseFloat( process.argv[4] )
};

// optionally pass 'geojson' as the 6th arg to get json output
var renderer = ( process.argv[6] === 'geojson' ) ? pretty.geojson : pretty.table;

conn.query( point,  function( err, res ){

  if( !res ){
    return console.error( '0 results found' );
  }
    
  // only return 10 results
  res = res.slice(0,10);

  if( renderer === pretty.geojson ){
    console.log( JSON.stringify( renderer( res ), null, 2 ) );
  } else {
    res=res.map(i=>{
      var street = i.street;
      street.coordinates= i.proj.point[0] + ' ' + i.proj.point[1] ;
      street.distance = Math.round(i.proj.dist*1000000)/1000;
      delete street.line;
      return street;
    });
    console.log( renderer( res ) );
  }

});

conn.close();
