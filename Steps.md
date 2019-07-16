#pelis interpolation
https://github.com/pelias/interpolation
 
#extract polyline from pbf
https://github.com/pelias/polylines
 
 
#install go
https://medium.com/@patdhlk/how-to-install-go-1-9-1-on-ubuntu-16-04-ee64c073cd79
 
#get pbf
go get github.com/missinglink/pbf
 
#download geofabric data
wget http://download.geofabrik.de/europe/italy/centro-latest.osm.pbf 
 
#extract polylines
pbf streets centro-latest.osm.pbf > centro-latest.osm.polylines
 
#download pelis-interpolation
git clone https://github.com/pelias/interpolation.git
 
#install libpostal
sudo apt-get install curl autoconf automake libtool pkg-config
git clone https://github.com/openvenues/libpostal
cd libpostal
./bootstrap.sh
./configure --datadir=[...some dir with a few GB of space...]
make -j4
sudo make install
 
#import polyline
./interpolate polyline ../data/street.db < ../data/centro-latest.osm.polylines
 
#download openaddresses data
wget http://data.openaddresses.io/runs/657519/it/04/acerra.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657808/it/21/city_of_biella.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655810/it/21/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657809/it/21/torino.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656167/it/25/bg.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655943/it/25/bs.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656606/it/25/co.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656306/it/25/cr.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656837/it/25/lc.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656902/it/25/lo.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656146/it/25/mb.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656093/it/25/mi.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657225/it/25/mn.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656349/it/25/pv.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657561/it/25/so.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/653642/it/25/va.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656579/it/32/south-tyrol-de.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656419/it/32/south-tyrol-it.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656575/it/32/south-tyrol-lld.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657172/it/34/city_of_verona.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657542/it/34/venice.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/647033/it/36/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657755/it/42/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655971/it/45/bo.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656982/it/45/bologna.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656164/it/45/fc.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656099/it/45/fe.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/657292/it/45/ferrara.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655860/it/45/mo.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656607/it/45/pc.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656090/it/45/pr.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656094/it/45/ra.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656027/it/45/re.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656114/it/45/rn.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656745/it/52/firenze.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655716/it/52/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/656009/it/55/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655672/it/82/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655855/it/88/statewide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip && wget http://data.openaddresses.io/runs/655648/it/countrywide.zip -O temp.zip; unzip -o temp.zip; rm temp.zip
cat ./it/04/acerra.csv >> italy.csv && cat ./it/21/city_of_biella.csv >> italy.csv && cat ./it/21/statewide.csv >> italy.csv && cat ./it/21/torino.csv >> italy.csv && cat ./it/25/bg.csv >> italy.csv && cat ./it/25/bs.csv >> italy.csv && cat ./it/25/co.csv >> italy.csv && cat ./it/25/cr.csv >> italy.csv && cat ./it/25/lc.csv >> italy.csv && cat ./it/25/lo.csv >> italy.csv && cat ./it/25/mb.csv >> italy.csv && cat ./it/25/mi.csv >> italy.csv && cat ./it/25/mn.csv >> italy.csv && cat ./it/25/pv.csv >> italy.csv && cat ./it/25/so.csv >> italy.csv && cat ./it/25/va.csv >> italy.csv && cat ./it/32/south-tyrol-de.csv >> italy.csv && cat ./it/32/south-tyrol-it.csv >> italy.csv && cat ./it/32/south-tyrol-lld.csv >> italy.csv && cat ./it/34/city_of_verona.csv >> italy.csv && cat ./it/34/venice.csv >> italy.csv && cat ./it/36/statewide.csv >> italy.csv && cat ./it/42/statewide.csv >> italy.csv && cat ./it/45/bo.csv >> italy.csv && cat ./it/45/bologna.csv >> italy.csv && cat ./it/45/fc.csv >> italy.csv && cat ./it/45/fe.csv >> italy.csv && cat ./it/45/ferrara.csv >> italy.csv && cat ./it/45/mo.csv >> italy.csv && cat ./it/45/pc.csv >> italy.csv && cat ./it/45/pr.csv >> italy.csv && cat ./it/45/ra.csv >> italy.csv && cat ./it/45/re.csv >> italy.csv && cat ./it/45/rn.csv >> italy.csv && cat ./it/52/firenze.csv >> italy.csv && cat ./it/52/statewide.csv >> italy.csv && cat ./it/55/statewide.csv >> italy.csv && cat ./it/82/statewide.csv >> italy.csv && cat ./it/88/statewide.csv >> italy.csv && cat ./it/countrywide.csv >> italy.csv
 
#import openaddresses
./interpolate oa ../data/address.db ../data/street.db < ../data/oa/it/countrywide.csv  
 
#install pbf2json
git clone https://github.com/pelias/pbf2json.git
 
#run pbf to json
./build/pbf2json.linux-x64 -tags="addr:housenumber+addr:street" ../data/centro-latest.osm.pbf > ../data/centro-latest.osm.json
 
#import osm data
./interpolate osm ../data/address.db ../data/street.db < ../data/centro-latest.osm.json
 
#compute fractional house numbers for the street vertices
./interpolate vertices ../data/address.db ../data/street.db
 
 
 
./interpolate search ../data/address.db ../data/street.db "41.825042" "12.484651" "187" "viale luca gaurico"