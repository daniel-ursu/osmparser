

var fs = require('fs');
var OSMStream = require('node-osm-stream');
var JSONStream = require('JSONStream');
var EOL = require('os').EOL;
const { Transform } = require('json2csv');
const {range, shuffle} = require('lodash');
const f = require('faker')
// list of node ids that we want to skip when writing our data to file
var skipNodes = [];

var source      = __dirname + '/data/' + process.argv[2] + '.osm';
var destination = __dirname + '/data/' + process.argv[2] + '.json';

// open .osm file as a Readable file stream
var readstream  = fs.createReadStream(source);

// initialize our .osm stream parser
var parser      = OSMStream(); // or new OSMStream()

// open a Writeable file stream to write our JSON file
var writestream = fs.createWriteStream(destination);

// a JSON parser that we will use later to ensure that we have our valid JSON file
var jsonParser;

// attach our pipelines
readstream
  .pipe(parser)
  .pipe(writestream);

readstream.on('open', function () {
  console.log('Opened .osm file:', source, '\n');
});

var firstLine = true;
parser.on('writeable', function (data, callback) {
  if (firstLine) {
    firstLine = false;
    // add an opening square bracket before the first JSON object
    // that we are about to write to file
    callback('[' + EOL + '  ' + JSON.stringify(data));
  } else {
    // prepend a comma to the rest of the JSON objects
    callback(',' + EOL + '  ' + JSON.stringify(data));
  }
});
parser.on('flush', function (callback) {
  // add closing square bracket after all data has been written to file
  callback(EOL + ']' + EOL);
});

parser.on('node', function (node, callback) {
  // check current node id against list of nodes we want to skip
  if (skipNodes.indexOf(node.id) > -1) {
    // send back null or false to skip object
    callback();
  } else {

	

		if(node.tags && node.tags["addr:city"] /*&& node.tags["addr:street"]*/ && node.tags["name"]) {
			//console.log(node)
			let newNode = {
				country: node.tags["addr:country"] || node.tags["is_in:country"] || "",
				postcode: node.tags["addr:postcode"] || "",
				city: node.tags["addr:city"] || "",
				streetnumber: node.tags["addr:housenumber"] || node.tags["addr:unit"] || "",
				lat: node.lat || "",
				lon: node.lon || "",
				street: node.tags["addr:street"] || "",
				state: node.tags["addr:state"] || node.tags["addr:county"] || node.tags["addr:province"] || node.tags["addr:district"] || node.tags["addr:suburb"] || node.tags["addr:hamlet"] || node.tags["addr:region"] || node.tags["is_in:county"] || node.tags["is_in:state"] ||"",
				name: node.tags["name"],
			}
			callback(newNode);
		} else {
			callback();
		}	

	

    
  }
});

parser.on('way', function (node, callback) {
		if(node.tags && node.tags["addr:city"] /*&& node.tags["addr:street"] */&& node.tags["name"]) {
			//console.log(node)
			let newNode = {
				country: node.tags["addr:country"] || node.tags["is_in:country"] || "",
				postcode: node.tags["addr:postcode"] || "",
				city: node.tags["addr:city"] || "",
				streetnumber: node.tags["addr:housenumber"] || node.tags["addr:unit"] || "",
				lat: node.lat || "",
				lon: node.lon || "",
				street: node.tags["addr:street"] || "",
				state: node.tags["addr:state"] || node.tags["addr:county"] || node.tags["addr:province"] || node.tags["addr:district"] || node.tags["addr:suburb"] || node.tags["addr:hamlet"] || node.tags["addr:region"] || node.tags["is_in:county"] || node.tags["is_in:state"] ||"",
				name: node.tags["name"],
				//type: node.tags["place"],
			}

			callback(newNode);
		} else {
			callback();
		}		
});
parser.on('relation', function (relation, callback) {
	callback();
});

parser.on('end', function () {
  console.log('Finished parsing our .osm file');
  console.log('Bytes read from incoming stream:', parser.bytesRead, 'bytes');
  console.log('Bytes written to outgoing stream:', parser.bytesWritten, 'bytes\n');

  console.log('Checking that written file is a valid JSON:', destination);
  console.log("start reducing duplicates")
  	let rawdata = fs.readFileSync(__dirname + '/data/' + process.argv[2] + '.json');
	let a = JSON.parse(rawdata);

	u = []; 
	console.time('set');
	u = [...new Set(a.map((el) => JSON.stringify(el)))].map((el) => JSON.parse(el));
	
	let data = JSON.stringify(u);
	fs.writeFileSync(__dirname + '/data/' + process.argv[2] + '-un.json', data);
	console.timeEnd('set');
	console.log("finished reducing");
	console.log("start csv conversion");
  
	const fields = ['country', 'postcode', 'city', 'street', 'streetnumber', 'state', 'name', 'lat', 'lon'];
	const opts = { fields };
	const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

	const input = fs.createReadStream('./data/' + process.argv[2] + "-un.json");
	const output = fs.createWriteStream('./data/' + process.argv[2] + "-un.csv");
	const json2csv = new Transform(opts);

	const processor = input.pipe(json2csv).pipe(output);

	// You can also listen for events on the conversion and see how the header or the lines are coming out.
	json2csv
	  .on('header', header => console.log(header))
	  .on('line', line => {})
	  .on('error', err => console.log(err));
});