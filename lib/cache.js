const path = require('path');
const os = require('os');
const _ = require('lodash');
const fse = require('fs-extra');
const request = require('request');
const Utils = require('./utils');

let _debug = true;

/********************
 ***   MEMCACHE   ***
 ********************/
const memcacheTTL = 360 * 60 * 1000; // 6 hours
let memcacheStorage = {};

let memcache = {
  shouldUse: function shouldUse (store, key) {
    var cacheObj = _.get(memcacheStorage, [store, key].join('.'));
    if (!cacheObj) {
      Utils.log('No memcache found for', store, key);
      return false;
    }

    var stamp = cacheObj._rstimestamp || 0;

    return (stamp + memcacheTTL > Date.now());
  },

  set: function set (store, key, value) {
    Utils.log('Storing memcache for', store, key);
    value._rstimestamp = Date.now();
    _.set(memcacheStorage, [store, key].join('.'), value)
  },

  get: function get (store, key) {
    Utils.log('Getting memcache for', store, key);
    return _.get(memcacheStorage, [store, key].join('.'));
  }
};



/********************
 ***  PERSISTENT  ***
 ********************/
const tmpdir = path.join(os.tmpdir(), 'remotestackcache');
Utils.log('tmpdir', tmpdir);
// define stores
try {
  fse.ensureDirSync(tmpdir);
  fse.ensureDirSync(tmpdir + '/meta-resolved');
  fse.ensureDirSync(tmpdir + '/files');
} catch (err) {
  console.error(err);
}

let persistent = {
  setJSON: function setJSON (store, key, value, temp) {
    var md5 = Utils.md5(key);
    Utils.log('Storing persistent cache for', store, key, md5);
    try {
      fse.writeFileSync(tmpdir + '/' + store + '/' + md5 + '.json', JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  getJSON: function getJSON (store, key, temp) {
    Utils.log('Getting persistent cache for', store, key);
    let file = false;
    store = store || 'default';
    if (!key) {
      return false;
    }
    if (!temp && typeof temp !== 'boolean') {
      temp = true;
    }

    var md5 = Utils.md5(key);

    try {
      file = fse.readFileSync(tmpdir + '/' + store + '/' + md5 + '.json');
      return JSON.parse(file);
    } catch (e) {
      // console.error(e);
      return false;
    }
  },

  fetchFile: function fetchFile (url, cb) {
    Utils.log('fetch', url);
    var filepath = path.join(tmpdir + '/files/' + Utils.md5(url));
    Utils.log(filepath);

    request.get(url)
      .pipe(fse.createWriteStream(filepath))
      .on('close', function () {
        Utils.log('Request close event captured');
        return cb(filepath);
      })
      .on('end', function () {
        Utils.log('Request end event captured');
        return cb(filepath);
      });
  },


  getFile: function getFile (url, cb) {
    Utils.log('get', url)
    // Utils.log('Shorting the cache - returning original URL');
    // return cb(url);

    var _self = this;
    var filepath = path.join(tmpdir + '/files/' + Utils.md5(url));
    // Utils.log(filepath);

    fse.access(filepath, function (err) {
      if (err) {
        Utils.log('Can\'t read cache:', filepath, err);
        // return cb(false);
        return _self.fetchFile(url, cb);
      } else {
        Utils.log('Cache found:', filepath);
      }
      // return cb(filepath);
      return cb('file://' + filepath);
    });
  }
};





module.exports = {
  memcache: memcache,
  persistent: persistent
}
