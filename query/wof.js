
var SQL = [
  'SELECT * FROM geojson;'
].join(' ');

module.exports = function( db, cb ){

  // execute query
  db.all( SQL, params, cb );
};
