var express = require('express');
var fs = require('fs');
var app     = express();
// var mongo = require("mongodb");

var config = {
	rootDirectory: '//192.168.0.253/GrifNas/Shared/Photos'
}

app.get('/list', function(req, res){

	var files = fs.readdirSync(config.rootDirectory);

	console.log(files);

})

app.listen('3005')
console.log('Magic happens on port 3005');
exports = module.exports = app;
