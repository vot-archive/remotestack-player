var _ = require('lodash');
var fse = require('fs-extra');

var extensions = {
  audio: ['mp3', 'wav', 'mp4', 'm4a'],
  image: ['jpg', 'jpeg', 'png', 'gif'],
  archive: ['zip', 'rar']
};


function isAudioFile (filepath) {
  // var ignoredFilenames = ['.DS_Store', 'desktop.ini'].map(function (i) {return i.toLowerCase()});
  // var ignoredExtensions = extensions.image.concat(extensions.archive);

  var filename = _.last(filepath.split('/')).toLowerCase();
  var extension = _.last(filename.split('.'));
  if (filename.startsWith('.')) return false;

  return extensions.audio.indexOf(extension) !== -1;

  // var filename = _.last(filepath.split('/')).toLowerCase();
  // var extension = _.last(filename.split('.'));
  //
  // if (ignoredFilenames.indexOf(filename) !== -1) return false;
  // if (ignoredExtensions.indexOf(extension) !== -1) return false;
  //
  // return true;
}


function unfoldFiles (path, list) {
  list = list || [];
  var stats = fse.statSync(path);
  var isFile = stats.isFile();
  var isDir = stats.isDirectory();

  if (isFile) {
    list.push(path);
  }
  if (isDir) {
    _.each(fse.readdirSync(path), function (i) {
      return unfoldFiles(path + '/' + i, list);
    });
  }

  return _.filter(list, isAudioFile);
}

module.exports.isAudioFile = isAudioFile;
module.exports.unfoldFiles = unfoldFiles;
