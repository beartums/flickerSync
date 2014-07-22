var express = require('express');
var fs 			= require('fs');
var nodeIni 		= require('node-ini');
var xml2js 	= require('xml2js');

var app     = express();
// var mongo = require("mongodb");

var config = {
	rootDirectory: '//192.168.0.253/GrifNas/Shared/Photos',
	iniFiles: ['.picasa.ini','Picasa.ini'],
	originalsFolder: '.picasaoriginals',
	includedExts: ['JPG','GIF','PNG','TIF','AVI','MP4','MPG'],
	tabChar: '  '
}

var dirTree = explodeDir(config.rootDirectory);
console.log(dirTree);

function explodeDir(directory,parent,path,depth) {
	var tab = '';
	depth = depth || 0;
	path = path || '';
	parent = parent || null;
	var fullPath = makePath(directory,path);

	var statObj = fs.statSync(fullPath);
	var fsObj = {};
	fsObj.name = directory;
	fsObj.type = statObj.isDirectory() ? 'dir' : 'file';
	fsObj.parent = parent;
	fsObj.path = path;

	if (fsObj.type==='file' && !extIsIncluded(fsObj.name,config.includedExts)) {
		return null;
	}
	if (fsObj.type==='file') {
		var iniObj = parent && parent.iniFile && parent.iniFile[fsObj.name] ?
									parent.iniFile['fsObj.name'] | {};
		if (iniObj.star && inObj.star==='yes') fsObj.star=true;
		if (iniObj.keywords) fsObj.keywords=iniObj.keywords;
		var iniFaces = [];
		if (iniObj.faces) {
			var faces = iniObj.faces.split(';');
			for (var i = 0; i < faces.length; i++) {
				var coordStr = /rect64\(([0123456789abcdef]{16})\)/i.exec(faces[i])[1];
				var faceId = faces[i].split(',')[1];
				var left = parseInt(coordStr.substring(0,4),16)/65536;
				var top = parseInt(coordStr.substring(4,8),16)/65536;
				var right = parseInt(coordStr.substring(8,12),16)/65536;
				var bottom = parseInt(coordStr.substring(12,16),16)/65536;
				var faceObj = {};
				faceObj.faceId = faceId;
				faceObj.coords = {left:left,top:top,right:right,bottom:bottom};
				faceObj.name = parent.iniFile.contacts2[faceId];
				iniFaces.push(faceObj);
			}
			fsObj.faces = iniFaces;
		}

	}

	var tab = '';
	for (var i = 0; i < depth; i++) tab += config.tabChar;
	console.log(tab + directory);
	// var dirs = [], files = [];

	if (fsObj.type==='dir') {
		fsObj.children = [];
		fsObj.iniFile = getIniFile(fullPath);
		console.log(fsObj.iniFile);
		var children = fs.readdirSync(fullPath);
		for (var i = 0; i < children.length; i++) {
			var child = explodeDir(children[i],fsObj,fullPath,depth+1);
			if (child) fsObj.children.push();
		}

		return fsObj;

	}
}

function makePath(directory,parentPath) {
	parentPath = parentPath || '';
	if (parentPath == '') return directory;
	parentPath = parentPath.replace(/\\$/,'').replace(/\/$/,'');
	var path = parentPath + '/' + directory;
	return path;
}
function getIniFile(path) {
	var ini = null, iniFileNames = config.iniFiles;

	var iniFileName;

 	for (var i = 0; i < iniFileNames.length; i++) {
		iniFileName = iniFileNames[i];
		try {
			ini = nodeIni.parseSync(path + '/' + iniFileName)
		} catch(e) {

		}
		if (ini) break;
	}
	return ini;
}
function extIsIncluded(fileName, includedExts) {
	includedExts = includedExts || config.includedExts;
	extRE = new RegExp('\.(' + includedExts.join('|') + ')$','i');
	return extRE.test(fileName);
}
// })
//
// app.listen('3005')
// console.log('Magic happens on port 3005');
// exports = module.exports = app;
