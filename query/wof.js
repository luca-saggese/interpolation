
/**
  find all streets which have a bbox which envelops the specified point; regardless of their names.
**/

var gju = require('geojson-utils');

// maximum street segments to return
var MAX_MATCHES = 100;

//https://github.com/maxogden/geojson-js-utils

//select * from spr where min_latitude < 42.522128 and max_latitude > 42.522128 and min_longitude< 12.095443 and max_longitude > 12.095443 limit 10;
/*
id|parent_id|name|placetype|country|repo|latitude|longitude|min_latitude|min_longitude|max_latitude|max_longitude|is_current|is_deprecated|is_ceased|is_superseded|is_superseding|superseded_by|supersedes|lastmodified                                                                                                                                       
85633253|102191581|Italy|country|IT|whosonfirst-data-admin-it|45.003229|11.083693|35.4924849999999|6.62711899999979|47.0924264999999|18.5205204999998|1|0|-1|0|0|||1561769880  
404227517|85633253|Lazio|macroregion|IT|whosonfirst-data-admin-it|41.979989|12.766887|40.7846857642772|11.4494273768779|42.838712408787|14.0277159918416|1|0|-1|0|0|||1561770639                                                                                                                                                                              
85685451|404227517|Viterbo|region|IT|whosonfirst-data-admin-it|42.436013|12.003053|42.1457341942459|11.4494273768779|42.838712408787|12.5196785588727|1|0|-1|0|0|||1561769892  
404227511|85633253|Toscany|macroregion|IT|whosonfirst-data-admin-it|43.450842|11.126243|42.2376443813715|9.68674826105159|44.4726857959067|12.3714182858261|1|0|-1|0|0|||1561770645                                                                                                                                                                           
404461349|85685451|Viterbo|localadmin|IT|whosonfirst-data-admin-it|42.423845|12.079167|42.2971269921666|11.9036637661107|42.5872139570889|12.2264901484311|-1|0|-1|0|0|||1504308564                                                                                                                                                                           
85685443|404227513|Terni|region|IT|whosonfirst-data-admin-it|42.8048|12.159745|42.3644118531189|11.8919473619878|42.9430946025599|12.8964024713577|1|0|-1|0|0|||1561769896     
404227513|85633253|Umbria|macroregion|IT|whosonfirst-data-admin-it|42.965912|12.490159|42.3644118531189|11.8919473619878|43.6173157497872|13.2642578747204|1|0|-1|0|0|||1561770653  
*/

var SQL = [
  'SELECT * FROM wof.spr',
  'JOIN wof.geojson ON wof.geojson.id = wof.spr.id',
  'WHERE (wof.spr.min_latitude < $LAT and wof.spr.Max_latitude > $LAT and wof.spr.min_longitude < $LON and wof.spr.max_longitude > $LON)',
  'LIMIT $LIMIT;'
].join(' ');

// sqlite3 prepared statements
var stmt;

module.exports = function( db, point, cb ){

  // create prepared statement if one doesn't exist
  if( !stmt ){ stmt = db.prepare( SQL ); }

  // execute statement
  stmt.all({
    $LON: point.lon,
    $LAT: point.lat,
    $LIMIT: MAX_MATCHES
  }, (err,res)=>{
    
    var ret={};
    res.forEach(row=>{
      if(!ret[row.placetype]) {
        ret[row.placetype] = [row];
      } else {
        ret[row.placetype].push(row);
      }
    });
    Object.keys(ret).forEach(k=>{
      if(ret[k].length === 1) {
        ret[k] = ret[k][0].name; 
      } else {
        var filtered = ret[k].filter(item => {
          var geojson = JSON.parse(item.body);
          var isIn = gju.pointInPolygon({"type":"Point","coordinates":[point.lon,point.lat]},
                 {"type":"Polygon", "coordinates":geojson.geometry.coordinates[0]});
          console.log(item.id, isIn);
          return isIn
        }); 
        ret[k] = filtered[0].name; 
      }
      delete ret[k].body;
    });
    cb(err, ret);
  });
};

module.exports.finalize = function(){
  if( stmt ){
    stmt.finalize();
  }
};
