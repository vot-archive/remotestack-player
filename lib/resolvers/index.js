var _ = require('lodash');
var async = require('async');

var ytdl = require('./lib/ytdl');
var fetch = require('./lib/fetch');
var extract = require('./lib/extract');

var uuid = require('../utils/gen-uuid');

/**
 * Main function - runs all parses
 * @param {String} url URL to resolve
 * @param {Object} opts No options supported yet
 * @param {Function} callback Returns object in a single argument
 */
function main (url, opts, callback) {
  opts = opts || {};
  opts.ytdl = typeof opts.ytdl !== 'undefined' ? opts.ytdl : false;
  opts.raw = typeof opts.raw !== 'undefined' ? opts.raw : false;
  opts.clean = typeof opts.clean !== 'undefined' ? opts.clean : false;

  var rtn = {
    timestamp: Date.now(),
    errors: {}
  };

  var resolvers = [];

  resolvers.push(function (cb) {
    ytdl(url, function (err, info) {
      if (err || !info) {
        rtn.errors['ytdl'] = err;
      }
      if (opts.ytdl) rtn.ytdl = !err && info ? info : false;
      return cb();
    });
  });

  resolvers.push(function (cb) {
    fetch(url, function (err, info) {
      if (err || !info) {
        // console.log(err);
        rtn.errors['fetch'] = err;
      }
      // escape info.response
      if (opts.raw) rtn.raw = !err && info ? info : false;

      extract(url, function (err, info) {
        if (err || !info) {
          rtn.errors['extract'] = err;
        }
        if (opts.clean) rtn.clean = !err && info ? info : false;

        return cb();
      });
    });
  });


  async.parallel(resolvers, function(err, results) {
    var canonical = {};

    canonical.title = _.get(rtn, 'ytdl.fulltitle') || _.get(rtn, 'clean.title') || null;
    canonical.url = _.get(rtn, 'ytdl.webpage_url') || _.get(rtn, 'clean.url') || _.get(rtn, 'raw.url') || null;
    canonical.preferred = _.get(rtn, 'ytdl.preferredFormat', null);
    canonical.id = uuid();

    rtn.canonical = canonical;
    return callback(rtn);
  });
}

module.exports = main;
