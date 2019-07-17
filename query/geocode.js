
// maximum names to match on
var MAX_NAMES = 10;

// maximum address records to return
var MAX_MATCHES = 20;

/**
  this query should only ever return max 3 rows.
  note: the amount of rows returned does not adequently indicate whether an
  exact match was found or not.
**/

var SQL= [
  'WITH base AS (',
    'SELECT id, housenumber, rowid',
    'FROM address',
    'WHERE id IN (',
      'SELECT id',
      'FROM street.names',
      'WHERE ( %%NAME_CONDITIONS%% ) %%CITY_CONDITION%%',
    ')',
  ')',
  'SELECT * FROM address, street.names, address_extra',
  'WHERE address_extra.id=address.id and address.id=street.names.id',
  'and address.rowid IN (',
    '%%NUMBER_SQL%%',
  ')',
  'ORDER BY housenumber ASC', // @warning business logic depends on this
  'LIMIT %%MAX_MATCHES%%',
  'COLLATE NOCASE;'
].join(' ');

var NUMBER_SQL = [
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
')'].join(' ');

var NONUMBER_SQL = 'SELECT rowid FROM base';



var NAME_SQL = '(street.names.name=?)';
var CITY_SQL = '(address.city=?)';

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

  var cityConditions = '';
  if ( city ) { cityConditions = 'AND ' + CITY_SQL.replace('?', `'${city}'`)}

  var num_sql = NONUMBER_SQL;
  if ( number ) { num_sql = NUMBER_SQL; } 
  // build unique sql statement
  var sql = SQL.replace('%%NUMBER_SQL%%', NUMBER_SQL)
               .replace( '%%NAME_CONDITIONS%%', nameConditions.join(' OR ') )
               .replace( '%%MAX_MATCHES%%', MAX_MATCHES )
               .replace( '%%CITY_CONDITION%%', cityConditions )
               .split( '%%TARGET_HOUSENUMBER%%' ).join( number );

  console.log(sql)

  // create a variable array of params for the query
  var params = [].concat( names.slice(0, max.names) );

  // execute query
  db.all( sql, params, cb );
};