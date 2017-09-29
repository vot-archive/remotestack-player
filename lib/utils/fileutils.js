'use strict';

const _ = require('lodash');
const fse = require('fs-extra');

const extensions = {
  audio: ['mp3', 'wav', 'mp4', 'm4a'],
  image: ['jpg', 'jpeg', 'png', 'gif'],
  archive: ['zip', 'rar'],
};


function isAudioFile(filepath) {
  // let ignoredFilenames = ['.DS_Store', 'desktop.ini'].map(function (i) {return i.toLowerCase()});
  // let ignoredExtensions = extensions.image.concat(extensions.archive);

  const filename = _.last(filepath.split('/')).toLowerCase();
  const extension = _.last(filename.split('.'));
  if (filename.startsWith('.')) return false;

  return extensions.audio.indexOf(extension) !== -1;

  // let filename = _.last(filepath.split('/')).toLowerCase();
  // let extension = _.last(filename.split('.'));
  //
  // if (ignoredFilenames.indexOf(filename) !== -1) return false;
  // if (ignoredExtensions.indexOf(extension) !== -1) return false;
  //
  // return true;
}


function unfoldFiles(path, list) {
  list = list || [];
  const stats = fse.statSync(path);
  const isFile = stats.isFile();
  const isDir = stats.isDirectory();

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
