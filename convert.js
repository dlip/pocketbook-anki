var fs = require("fs");
var cheerio = require('cheerio');
var md5 = require('MD5');
var csvWriter = require('csv-write-stream');
var gm = require('gm');

var filename = process.argv[2];
var outDir = 'out';
var csvFilename = outDir + '/out.csv';

var xhtmlData = fs.readFileSync(filename, "utf8");

var $ = cheerio.load(xhtmlData);

var total = $('.bookmark').length;
var csvData = new Array(total);

var count = 0;
var nextid = 0;
$('.bookmark').each(function(index, elem) {
	var id = nextid;
	nextid++;
	encImg = $(elem).find('img').first().attr('src');
	var noteElem = $(elem).find('.bm-note > p').first();
	noteElem.find('br').replaceWith('\n');
	var note = noteElem.text();
	var imageBuffer = decodeBase64Image(encImg);
	gm(imageBuffer.data, 'image.jpg').toBuffer('JPG', function(err, buffer) {
		if(err)
			console.log(err);
		var imageFilename = md5(buffer) + '.jpg';
		var imageLocation = outDir + '/' + imageFilename;

	    fs.exists(imageLocation, function(exists) {
	    	if (true) {
				fs.writeFile(imageLocation, buffer, function(err) {
					if(err)
						console.log(err);
					console.log('Wrote ' + imageLocation);
				});
			}
		});
		csvData[id] = {imageFilename: '<img src="' + imageFilename + '"/>', note: note};
		count++;
		if(count == total)
			writeCsv( csvData );
	});
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function writeCsv(data) {
	var writer = csvWriter({sendHeaders: false})
	writer.pipe(fs.createWriteStream(csvFilename));
	data.forEach(function(item) {
		writer.write(item)
	});
	writer.end()
}
