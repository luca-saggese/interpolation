
// maximum names to match on
var MAX_NAMES = 10;

// maximum address records to return
var MAX_MATCHES = 20;

/**
  this query should only ever return max 3 rows.
  note: the amount of rows returned does not adequently indicate whether an
  exact match was found or not.
**/

var SQL2= [
  'WITH base AS (',
    'SELECT id, housenumber, rowid',
    'FROM address',
    'WHERE id IN (',
      'SELECT id',
      'FROM street.names',
      'WHERE ( %%NAME_CONDITIONS%% )',
    ')',
  ')',
  'SELECT * FROM address',
  'WHERE rowid IN (',
    'SELECT rowid FROM (',
      'SELECT * FROM base',
      'WHERE housenumber < "%%TARGET_HOUSENUMBER%%"',
      'GROUP BY id HAVING( MAX( housenumber ) )',
      'ORDER BY housenumber DESC',
    ')',
    'UNION',
    'SELECT rowid FROM (',
      'SELECT * FROM base',
      'WHERE housenumber >= "%%TARGET_HOUSENUMBER%%"',
      'GROUP BY id HAVING( MIN( housenumber ) )',
      'ORDER BY housenumber ASC',
    ')',
  ')',
  'ORDER BY housenumber ASC', // @warning business logic depends on this
  'LIMIT %%MAX_MATCHES%%;'
].join(' ');

var SQL2= [
 
    'SELECT *',
    'FROM address',
    'WHERE id IN (',
      'SELECT id',
      'FROM street.names',
      'WHERE ( %%NAME_CONDITIONS%% )',
    ')',
  
  'LIMIT %%MAX_MATCHES%%;'
].join(' ');

var NAME_SQL = '(street.names.name=?)';

module.exports = function( db, number, names, cb ){

  // error checking
  if( !names || !names.length ){
    return cb( null, [] );
  }

  // max conditions to search on
  var max = { names: Math.min( names.length, MAX_NAMES ) };

  // use named parameters to avoid sending coordinates twice for rtree conditions
  var position = 3; // 1 and 2 are used by lon and lat.

  // add name conditions to query
  var nameConditions = Array.apply(null, new Array(max.names)).map( function(){
    return NAME_SQL.replace('?', '?' + position++);
  });

  // build unique sql statement
  var sql = SQL.replace( '%%NAME_CONDITIONS%%', nameConditions.join(' OR ') )
               .replace( '%%MAX_MATCHES%%', MAX_MATCHES )
               .split( '%%TARGET_HOUSENUMBER%%' ).join( number );

  // create a variable array of params for the query
  var params = [].concat( names.slice(0, max.names) );

  // execute query
  db.all( sql, params, cb );
};