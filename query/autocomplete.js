
// maximum names to match on
var MAX_NAMES = 10;

// maximum address records to return
var MAX_MATCHES = 20;

/**
  this query should only ever return max 3 rows.
  note: the amount of rows returned does not adequently indicate whether an
  exact match was found or not.
**/

var SQL = [
  'SELECT address.id, name, city',
  'FROM street.names, address',
  'WHERE street.names.id = address.id',
  'AND( %%NAME_CONDITIONS%% )',
  '%%CITY_CONDITIONS%%',
  'LIMIT %%MAX_MATCHES%%;'
].join(' ');

var NAME_SQL = '(street.names.name like ?)';
var CITY_SQL = ' AND street.names.id IN (SELECT id FROM address WHERE city = ?)';

module.exports = function( db, address, cb ){

  var names = address.street;
  var city = address.city;
  var number = address.number;
  // error checking
  if( !names || !names.length ){
    return cb( null, [] );
  }

  // max conditions to search on
  var max = { names: Math.min( names.length, MAX_NAMES ) };

  // use named parameters to avoid sending coordinates twice for rtree conditions
  var position = 1; // 1 and 2 are used by lon and lat.

  // add name conditions to query
  var nameConditions = Array.apply(null, new Array(max.names)).map( function(){
    return NAME_SQL.replace('?', '?' + position++);
  });
  
  if(city) {
    CITY_SQL = CITY_SQL.replace('?', '?' + position++);
  } else {
    CITY_SQL = '';
  }

  // build unique sql statement
  var sql = SQL.replace( '%%NAME_CONDITIONS%%', nameConditions.join(' OR ') )
               .replace( '%%CITY_CONDITIONS%%', CITY_SQL )
               .replace( '%%MAX_MATCHES%%', MAX_MATCHES );

  // create a variable array of params for the query
  var params = names.slice(0, max.names).map(n=>('%' + n + '%'));
  if(city) {
    params = params.concat(city);
  }

  // execute query
  db.all( sql, params, cb );
};
