'use strict';

const request = require('request');
const cache = require('./utils/memcache');

module.exports = function fetch(url, opts, cb) {
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

  const requestOpts = {
    url: 'http://urlgent.com/api/v1/resolve?type=media&url=' + encodeURIComponent(url),
    method: opts.method || 'GET',
  };

  request(requestOpts, function urlgentRequestCb(err, response, body) {
    // let rtn = {
    //   url: url,
    //   response: body,
    //   code: response && response.statusCode ? response.statusCode : false
    // };
    // if (err) {
    //   rtn.error = err;
    // }

    const parsedBody = JSON.parse(body);

    if (!err && response.code === 200) {
      cache.save('urlgent', url, parsedBody);
    }

    return cb(err, parsedBody);
  });
};
