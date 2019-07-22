
var reverse = require('../api/reverse'),
    pretty = require('../lib/pretty');

// help text
if( process.argv.length !== 6  ){
  console.error('invalid args.');
  console.error('usage:  {streetdb} {wofdb} {lat} {lon}');
  console.error('example: node cmd/reverse street.db wof.db "-41.288788" "174.766843"');
  process.exit(1);
}

var conn = reverse( process.argv[2], process.argv[3] );

var point = {
  lat: parseFloat( process.argv[4] ),
  lon: parseFloat( process.argv[5] )
};

// optionally pass 'geojson' as the 6th arg to get json output
var renderer = ( process.argv[6] === 'geojson' ) ? pretty.geojson : pretty.table;

conn.query( point,  function( err, res ){

  if( !res ){
    return console.error( '0 results found' );
  }
    
  // only return 10 results
  res = res.slice(0,10);

  console.log(res)

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
