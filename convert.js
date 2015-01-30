var fs = require("fs");
var cheerio = require('cheerio');
var md5 = require('MD5');
var csvWriter = require('csv-write-stream')

var filename = process.argv[2];
var outDir = 'out';
var csvFilename = outDir + '/out.csv';

var xhtmlData = fs.readFileSync(filename, "utf8");

var $ = cheerio.load(xhtmlData);

var csvData = [];

var total = $('.bookmark').length;

$('.bookmark').each(function(index, elem) {
	encImg = $(elem).find('img').first().attr('src');
	var pageNo = $(elem).find('.bm-page').first().text();
	var note = $(elem).find('.bm-note').first().text();
	var imageBuffer = decodeBase64Image(encImg);
	var imageFilename = md5(imageBuffer.data) + '.jpg';
	var imageLocation = outDir + '/' + imageFilename;
    
    fs.exists(imageLocation, function(exists) {
    	if (!exists) {
			fs.writeFile(imageLocation, imageBuffer.data, function(err) {
				if(err)
					console.log(err);
				console.log('Wrote ' + imageLocation);
			});
		}
	});
	csvData.push({note: note, imageFilename: imageFilename, pageNo: pageNo});
	if(csvData.length == total) {
		writeCsv( csvData );
	}
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