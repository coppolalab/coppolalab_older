var Papa = require('babyparse')
var fs = require("fs");

fs.readFile('test1.csv', {encoding: 'UTF-8'}, function (err, data) {
	if (err) throw err;
	//console.log(data);

	var results = Papa.parse(data, {delimiter: ",", header: true});
	if ((results.errors).length == 0) {
		//console.log(results);

		var outputFilename = 'csvToJSON.json';
		fs.writeFile(outputFilename, JSON.stringify(results, null, 4), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("JSON saved to " + outputFilename);
			}
		}); 
	} else {
		console.log(results.errors);
	}
});

