# osmparser

Script that will process addresses in .osm files (OpenStreetMaps) into csv files

# usage

1. Create a `data` folder (first time usage)
2. download .bz2 file for desired country/region/city from https://download.geofabrik.de/ into the `data` folder
3. unzip it using `npm unzip.js <filename>` (don't include the -latest.osm.bz2 in the downloaded file)
4. process it using `npm parse.js <filename>`
