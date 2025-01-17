
var express = require('express'),
    directory = require('serve-index'),
    polyline = require('@mapbox/polyline'),
    search = require('../api/search'),
    geocode = require('../api/geocode'),
    autocomplete = require('../api/autocomplete'),
    extract = require('../api/extract'),
    reverse = require('../api/reverse'),
    street = require('../api/street'),
    near = require('../api/near'),
    pretty = require('../lib/pretty'),
    analyze = require('../lib/analyze'),
    project = require('../lib/project'),
    proximity = require('../lib/proximity');

const morgan = require( 'morgan' );
const logger = require('pelias-logger').get('interpolation');
const through = require( 'through2' );
const _ = require('lodash');

// optionally override port using env var
var PORT = process.env.PORT || 3000;
console.log(process.argv)

// help text
if( process.argv.length !== 5 ){
  console.error('invalid args.');
  console.error('usage: {addressdb} {streetdb} {wofdb}');
  console.error('example: node cmd/server address.db street.db wof.db');
  process.exit(1);
}

var app = express();
app.use(log());

var conn = {
  search: search( process.argv[2], process.argv[3] ),
  extract: extract( process.argv[2], process.argv[3] ),
  street: street( process.argv[3] ),
  geocode: geocode( process.argv[2], process.argv[3] ),
  autocomplete: autocomplete( process.argv[2], process.argv[3] ),
  near: near( process.argv[3] ),
  reverse: reverse( process.argv[2], process.argv[4]  )
};

function log() {
  morgan.token('url', (req, res) => {
    // if there's a DNT header, just return '/' as the URL
    if (['DNT', 'dnt', 'do_not_track'].some(header => _.has(req.headers, header))) {
      return _.get(req, 'route.path');
    } else {
      return req.originalUrl;
    }
  });

  // 'short' format includes response time but leaves out date
  return morgan('short', {
    stream: through( function write( ln, _, next ){
      logger.info( ln.toString().trim() );
      next();
    })
  });
}

// search with geojson view
// eg: http://localhost:3000/search/geojson?lat=-41.288788&lon=174.766843&number=16&street=glasgow%20street
app.get('/search/geojson', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };
  var number = req.query.number;
  var street = req.query.street;

  conn.search.query( point, number, street, function( err, point ){
    if( err ){ return res.status(400).json( err ); }
    if( !point ){ return res.status(200).json({}); }

    res.json( pretty.geojson.point( point, point.lon, point.lat ) );
  });
});

// search with geojson view
// eg: http://localhost:3000/search/reverse?lat=41.846270&lon=12.419987
app.get('/search/reverse', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };

  conn.reverse.query( point, function( err, ret ){
    if( err ){ return res.status(400).json( err ); }
    if( !ret ){ return res.status(200).json({}); }

    res.json( ret );
  });
});

// search with geojson view
// eg: http://localhost:3000/search/geocode?address=via%20portuense%2012
app.get('/search/geocode', function( req, res ){

  var address = req.query.address;

  conn.geocode.query( address, function( err, point ){
    if( err ){ return res.status(400).json( err ); }
    if( !point ){ return res.status(200).json({}); }

    res.json( pretty.geojson.point( point, point.lon, point.lat ) );
  });
});

// search with geojson view
// eg: http://localhost:3000/search/geocode?address=via%20portuense%2012
app.get('/search/autocomplete', function( req, res ){

  var address = req.query.address;

  conn.autocomplete.query( address, function( err, result ){
    if( err ){ return res.status(400).json( err ); }
    if( !result ){ return res.status(200).json({}); }

    res.json( result );
  });
});

// search with table view
// eg: http://localhost:3000/search/table?lat=-41.288788&lon=174.766843&number=16&street=glasgow%20street
app.get('/search/table', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };
  var number = req.query.number;
  var street = req.query.street;

  conn.search.query( point, number, street, function( err, point ){
    if( err ){ return res.status(400).json( err ); }
    if( !point ){ return res.status(200).send(''); }

    res.setHeader('Content-Type', 'text/html');
    res.send( pretty.htmltable([ point ]) );
  });
});

// extract with geojson view
// eg: http://localhost:3000/extract/geojson?lat=-41.288788&lon=174.766843&names=glasgow%20street
app.get('/extract/geojson', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };
  var names = req.query.names ? req.query.names.split(',') : [];

  conn.extract.query( point, names, function( err, data ){
    if( err ){ return res.status(400).json( err ); }
    if( !data ){ return res.status(200).json({}); }

    res.json( pretty.geojson( data ) );
  });
});

// extract with table view
// eg: http://localhost:3000/extract/table?lat=-41.288788&lon=174.766843&names=glasgow%20street
app.get('/extract/table', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };
  var names = req.query.names ? req.query.names.split(',') : [];

  conn.extract.query( point, names, function( err, data ){
    if( err ){ return res.status(400).send( err ); }
    if( !data ){ return res.status(200).send(''); }
    if( !data.length ){ return res.status(200).send(''); }

    res.setHeader('Content-Type', 'text/html');
    res.send( pretty.htmltable( data ) );
  });
});

// get streets near point, ordered by proximity to point ASC
// eg: http://localhost:3000/street/near/geojson
app.get('/street/near/geojson', function( req, res ){

  var point = { lat: req.query.lat, lon: req.query.lon };
  var max_distance = req.query.dist || 0.01;

  conn.near.query( point, function( err, ordered ){
    if( err ){ return res.status(400).json( err ); }
    if( !ordered || !ordered.length ){ return res.status(200).json({}); }

    // remove points over a certain distance (in degrees)
    ordered = ordered.filter( function( o ){
      return o.proj.dist <= max_distance;
    });

    var geojson = {
      'type': 'FeatureCollection',
      'features': ordered.map( function( o ){
        return {
          'type': 'Feature',
          'properties': {
            'id': o.street.id,
            'name': Array.isArray( o.street.name ) ? o.street.name[0] : o.street.name,
            'polyline': o.street.line,
            'distance': ( Math.floor(( o.proj.dist || 0 ) * 1000000 ) / 1000000 )
          },
          'geometry': {
            'type': 'LineString',
            'coordinates': o.street.coordinates
          }
        };
      })
    };

    res.json( geojson );
  });
});

// get street geometry as geojson
// eg: http://localhost:3000/street/1/geojson
app.get('/street/:id/geojson', function( req, res ){

  conn.street.query( req.params.id.split(','), function( err, rows ){
    if( err ){ return res.status(400).json( err ); }
    if( !rows || !rows.length ){ return res.status(200).json({}); }

    // dedupe
    // @todo: debug and improve this by returning less results
    // @copy-pasted
    var deduped = [];
    rows = rows.filter( function( row ){
      if( deduped[ row.id ] ){ return false; }
      deduped[ row.id ] = true;
      return true;
    });

    var geojson = {
      'type': 'FeatureCollection',
      'features': rows.map( function( row ){
        return {
          'type': 'Feature',
          'properties': {
            'id': row.id,
            'name': Array.isArray( row.name ) ? row.name[0] : row.name,
            'polyline': row.line
          },
          'geometry': polyline.toGeoJSON( row.line, 6 )
        };
      })
    };

    res.json( geojson );
  });
});

// root page
app.get('/', function( req, res ){ res.redirect('/demo'); });

// serve the demo app
app.use('/demo', express.static('demo'));

// serve the builds dir (for downloads)
// app.get('/data', function( req, res ){ res.redirect('/builds'); });
// app.use('/builds', express.static('/data/builds'));
// app.use('/builds', directory('/data/builds', { hidden: false, icons: false, view: 'details' }));

app.listen( PORT, function() {

  // force loading of libpostal
  analyze.street( 'test street' );

  console.log( 'server listening on port', PORT );
});
