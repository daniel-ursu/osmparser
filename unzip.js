const http = require('https'); // or 'https' for https:// URLs
var bz2 = require('unbzip2-stream');
var fs = require('fs');
const stream = require('stream');

const writable = new stream.Writable({

});

const output = fs.createWriteStream('./data/'+ process.argv[2] + '.osm');
const input = fs.createReadStream('./data/'+ process.argv[2] + '-latest.osm.bz2');
// decompress test.bz2 and output the result
var callback = function() {
console.log("done");
}
/*var piper = fs.createReadStream('./data/'+ process.argv[2] + '-latest.osm.bz2').pipe(bz2()).pipe(output).end(null, null, function() {
	console.log("end event")
})
output.on("close", function(){
    console.log("finish event.");
});*/

const compressFile = (_input, _output) => {
 try {


  _input.pipe(bz2()).pipe(_output);

  return "finished piping";
 } catch (e) {
  log.error(e, `gzip -> compressFile`);
 }
}
console.log(compressFile(input, output))