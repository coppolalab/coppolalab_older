var argv = require('optimist')
							.usage('Parse a CSV file into JSON.\nUsage: $0')
							.demand('f', 'o')
							.alias('f', 'file')
							.alias('o', 'output')
							.default('o', 'output.json')
							.describe('f', 'Input CSV file')
							.describe('o', 'Output JSON file')
							.argv;

var Papa = require('babyparse')
var fs = require("fs");

fs.readFile(argv.f, {encoding: 'UTF-8'}, function (err, data) {
	if (err) throw err;

	var results = Papa.parse(data, {delimiter: ",", header: true});
	if ((results.errors).length == 0) {
		fs.writeFile(argv.o, JSON.stringify(results, null, 4), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("JSON saved to " + argv.o);
			}
		}); 
	} else {
		console.log(results.errors);
	}
});
