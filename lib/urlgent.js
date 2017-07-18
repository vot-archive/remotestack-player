var _ = require('lodash');
var request = require('request');
var cache = require('./utils/memcache');
var uuid = require('./utils/gen-uuid');

module.exports = function fetch (url, opts, cb) {
  console.log('RETRIEVE', url);
  if (!cb && typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};

  if (!url) {
    return cb('No URL');
  }

  if (cache.shouldUseCache('urlgent', url)) {
    return cb(null, cache.get('urlgent', url));
  }

  var requestOpts = {
    url: 'http://urlgent.com/api/v1/resolve?type=media&url=' + encodeURIComponent(url),
    method: opts.method || 'GET'
  };

  request(requestOpts, function (err, response, body) {
    // var rtn = {
    //   url: url,
    //   response: body,
    //   code: response && response.statusCode ? response.statusCode : false
    // };
    // if (err) {
    //   rtn.error = err;
    // }

    var parsedBody = JSON.parse(body);

    if (!err && response.code === 200) {
      cache.save('urlgent', url, parsedBody);
    }

    return cb(err, parsedBody);
  });
};
