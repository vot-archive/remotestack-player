'use strict';

const path = require('path');
const fse = require('fs-extra');
const request = require('request');
const electron = require('electron');
const Utils = require('../utils');

/**
 *  Persistent cache
 */
// const cachedir = path.join(os.tmpdir(), 'RemoteStackCache');
const app = electron.app || electron.remote.app;
const dataRoot = app.getPath('userData');

const cachedir = path.join(dataRoot, 'Cache');

Utils.log('cachedir', cachedir);
// define stores
try {
  fse.ensureDirSync(cachedir);
  fse.ensureDirSync(cachedir + '/meta-resolved');
  fse.ensureDirSync(cachedir + '/files');
} catch (err) {
  console.error(err);
}

const CacheLib = {
  setJSON: function setJSON(store, key, value) {
    const md5 = Utils.md5(key);
    Utils.log('Storing cached JSON for', store, key, md5);
    try {
      fse.writeFileSync(cachedir + '/' + store + '/' + md5 + '.json', JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  getJSON: function getJSON(store, key) {
    Utils.log('Getting cached JSON for', store, key);
    let file = false;
    store = store || 'default';
    if (!key) {
      return false;
    }

    const md5 = Utils.md5(key);

    try {
      file = fse.readFileSync(cachedir + '/' + store + '/' + md5 + '.json');
      const rtn = JSON.parse(file);
      Utils.log('Found cached JSON for', store, key);
      return rtn;
    } catch (e) {
      // console.error(e);
      return false;
    }
  },

  fetchFile: function fetchFile(url, cb) {
    Utils.log('fetch', url);
    const filepath = path.join(cachedir + '/files/' + Utils.md5(url));
    Utils.log(filepath);

    request.get(url)
      .pipe(fse.createWriteStream(filepath))
      .on('close', function fetchFileOnClose() {
        Utils.log('Request close event captured');
        return cb(filepath);
      })
      .on('end', function fetchFileOnEnd() {
        Utils.log('Request end event captured');
        return cb(filepath);
      });
  },


  getFile: function getFile(url, cb) {
    Utils.log('get', url);

    const self = this;
    const filepath = path.join(cachedir + '/files/' + Utils.md5(url));

    fse.access(filepath, function getFileReadCb(err) {
      if (err) {
        Utils.log('Can\'t read cache:', filepath, err);
        // return cb(false);
        return self.fetchFile(url, cb);
      }
      Utils.log('Cache found:', filepath);

      return cb(filepath);
      // return cb('file://' + filepath);
    });
  },
};





module.exports = CacheLib;
