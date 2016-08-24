const path = require('path');
const os = require('os');
const _ = require('lodash');
const fse = require('fs-extra');
const request = require('request');
const Utils = require('./utils');


/*********************
****   MEMCACHE   ****
**********************/
const memcacheTTL = 360 * 60 * 1000; // 6 hours
let memcacheStorage = {};

let memcache = {
  shouldUse: function shouldUse (store, key) {
    var cacheObj = _.get(memcacheStorage, [store, key].join('.'));
    if (!cacheObj) {
      console.log('No memcache found for', store, key);
      return false;
    }

    var stamp = cacheObj._rstimestamp || 0;

    return (stamp + memcacheTTL > Date.now());
  },

  set: function set (store, key, value) {
    console.log('Storing memcache for', store, key);
    value._rstimestamp = Date.now();
    _.set(memcacheStorage, [store, key].join('.'), value)
  },

  get: function get (store, key) {
    console.log('Getting memcache for', store, key);
    return _.get(memcacheStorage, [store, key].join('.'));
  }
};



/*********************
****  PERSISTENT  ****
**********************/
const tmpdir = path.join(os.tmpdir(), 'remotestackcache');
console.log('tmpdir', tmpdir);
// define stores
try {
  fse.ensureDirSync(tmpdir);
  fse.ensureDirSync(tmpdir + '/default');
  fse.ensureDirSync(tmpdir + '/meta-resolved');
  fse.ensureDirSync(tmpdir + '/files');
} catch (err) {
  console.error(err);
}

let persistent = {
  setJSON: function setJSON (store, key, value, temp) {
    var md5 = Utils.md5(key);
    console.log('Storing persistent cache for', store, key, md5);
    try {
      fse.writeFileSync(tmpdir + '/' + store + '/' + md5 + '.json', JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  getJSON: function getJSON (store, key, temp) {
    console.log('Getting persistent cache for', store, key);
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

  // setFile: function setFile (key, url, cb) {
  //   var filepath = path.join(tmpdir + '/files/' + Utils.md5(key));
  //   request
  //     .get(url)
  //     .on('error', function(err) {
  //       console.log(err);
  //       fse.unlinkSync(filepath);
  //       return;
  //     })
  //     .pipe(fs.createWriteStream(filepath));
  //
  //   // request('http://google.com/doodle.png').pipe(fse.createWriteStream('doodle.png'))
  // },

  fetchFile: function fetchFile (url, cb) {
    console.log('fetch', url);
    var filepath = path.join(tmpdir + '/files/' + Utils.md5(url));
    console.log(filepath);
    // request.get(url, function (err, httpResponse, body) {
    //   if (err || !body) {
    //     console.log(err);
    //     return cb(false);
    //   }
    //   fse.writeFile(filepath, body, function (err) {
    //     if (err) {
    //       return cb(false);
    //     }
    //     return cb(filepath);
    //   });
    // })

    request.get(url).pipe(fse.createWriteStream(filepath)).on('end', function () {
      return cb(filepath);
    });
  },

  getFile: function getFile (url, cb) {

    console.log('get', url)
    var _self = this;
    var filepath = path.join(tmpdir + '/files/' + Utils.md5(url));
    console.log(filepath);

    fse.access(filepath, function (err) {
      if (err) {
        // return cb(false);
        return _self.fetchFile(url, cb);
      }
      return cb(filepath);
    });
  }
};





module.exports = {
  memcache: memcache,
  persistent: persistent
}
