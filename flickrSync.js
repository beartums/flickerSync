var config = module.parent.exports.config;
var fs 			= require('fs');
var nodeIni 		= require('node-ini');
var xml2js 	= require('xml2js');
var http 		= require('http');
var exiftool = require('exiftool');
var Q = require('q')

  exports.explodeDir = function(directory,parent,path,depth) {
    var tab = '';
    depth = depth || 0;
    path = path || '';
    parent = parent || null;
    var fullPath = makePath(directory,path);

    var statObj = fs.statSync(fullPath);
    var fsObj = {};
    fsObj.fullPath = fullPath;
    fsObj.name = directory;
    fsObj.type = statObj.isDirectory() ? 'dir' : 'file';
    //fsObj.parent = parent;
    fsObj.path = path;
    fsObj.depth = depth;
    fsObj.parentId = parent && parent.Id ? parent.Id : null;

    if (fsObj.type==='file' && !extIsIncluded(fsObj.name,config.includedExts)) {
      return null;
    }
    if (fsObj.type==='file') {
      fsObj = getFile(fsObj,parent);
    }

    if (fsObj.type==='dir') {
      fsObj.children = [];
      fsObj.iniFile = getIniFile(fullPath);
      console.log(fullPath);
      var children = fs.readdirSync(fullPath);
      //var count = 5
      for (var i = 0; i < children.length; i++) {
        var child = explodeDir(children[i],fsObj,fullPath,depth+1);
        if (child) fsObj.children.push(child);
        //if (child.type==='file') break;
      }
    }

    return fsObj;
  }

/**
  non-exported functions
  **/
function saveDir() {

}

function getFile(file,parent) {
  var exifObj = getExif(file);
  var iniObj = (parent && parent.iniFile && parent.iniFile[file.name]) ?	parent.iniFile[file.name] : {};
  file.star = iniObj.star && iniObj.star==='yes' ? true : false;
  file.keywords = iniObj.keywords ? iniObj.keywords : '';
  file.albums = [];
  file.flickrAlbum = '';
  var iniFaces = [];
  if (iniObj.faces) {
    var faces = iniObj.faces.split(';');
    for (var i = 0; i < faces.length; i++) {
      var faceId = faces[i].split(',')[1];
      var coordStr = faces[i].split(',')[0].replace('rect64(','').replace(')','');
      var left = parseInt(coordStr.substring(0,4),16)/65536;
      var top = parseInt(coordStr.substring(4,8),16)/65536;
      var right = parseInt(coordStr.substring(8,12),16)/65536;
      var bottom = parseInt(coordStr.substring(12,16),16)/65536;
      var faceObj = {};
      faceObj.faceId = faceId;
      faceObj.coords = {left:left,top:top,right:right,bottom:bottom};
      if (parent.iniFile && parent.iniFile.Contacts2 && parent.iniFile.Contacts2[faceId]) {
        faceObj.name = parent.iniFile.Contacts2[faceId];
      } else {
        faceObj.name = 'unknown';
      }
      iniFaces.push(faceObj);
    }
    file.faces = iniFaces;
    exifTool.parsePromise(file.fullPath, ['-j','-g','-u'])
      .then(saveFsobjPromise.bind(file));
  }
}

function getExifPromise(file) {
  return exifTool.parsePromise(file.fullPath, ['-j','-g','-u']);
}
// this function must be bound to the object being saved
function saveFsobjPromise(exifdata) {
  this.exif = JSON.parse(exifdata)[0];
  var fileString = JSON.stringify(this);
  var options = {
    host: config.db.hostname,
    path: config.db.path,
    port: config.db.port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': fileString.length
    }
  };

  var deferred = Q.defer();
  var req = http.request(options,function(res){
    deferred.resolve(res);
  });
  req.on('error', function(err) {
    deferred.reject(err);
  })
  req.write(fileString);
  req.end();
  return deferred.promise;
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

function saveDirPromise(dirObj) {
  var deferred = q.defer;

}
