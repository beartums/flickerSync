var express = require('express');
var http 		= require('http');
var flickrSync = require('./flickrSync.js');

var app     = express();
// var mongo = require("mongodb");

var config = {
	db: {
			hostname: 'localhost',
			port: 3000,
			path: '/photos/directory'
	}
	rootDirectory: 'N:\\Shared\\Photos\\2009-12-31 - Happy New Year\\IMG_0002.JPG',
	iniFiles: ['.picasa.ini','Picasa.ini'],
	originalsFolder: '.picasaoriginals',
	includedExts: ['JPG','GIF','PNG','TIF','AVI','MP4','MPG'],
	picasaContacts: 'C:\\Users\\Eric\\AppData\\Local\\Google\\Picasa2\\contacts\\contacts.xml',
	exifToolOutput: '\\\\192.168.0.253\\GrifNas\\Shared\\web\\flickerSync\\vendor\\exiftool\\outfile.json',
	// folders that should be collections rather than albums
	collections: ['Photos','Aikido'],
	// Photos that are in collections root folders should be put in a new album
	loosePhotoAlbums: 'Misc',
	tabChar: '  '
}
module.exports.config = config;

var headers = {
	'Content-Type': 'application/json',
	'Content-Length': 0
};
var options = {
	host: 'localhost',
	port: 3000,
	path: '/photos/directory',
	method: 'POST',
	headers: headers
}
var req = http.request(options,function(res){
	console.log(res);
});
req.on('error', function(err) {
	console.log(err);
})

var dirTree = flickrSync.explodeDir(config.rootDirectory);
console.log(dirTree);
var dirTreeString = JSON.stringify(dirTree);
options.headers['Content-Length'] = dirTreeString.length;
var file = fs.writeFileSync(__dirname + '/outfile',dirTreeString);
req.write(dirTreeString);
req.end

/***

*/
// })
//
// app.listen('3005')
// console.log('Magic happens on port 3005');
// exports = module.exports = app;
