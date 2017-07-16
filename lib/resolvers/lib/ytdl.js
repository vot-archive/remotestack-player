var youtubedl = require('youtube-dl');
var cache = require('../../utils/memcache');

module.exports = function (url, cb) {
  if (cache.shouldUseCache('ytdl', url)) {
    return cb(null, cache.get('ytdl', url));
  }
  return youtubedl.getInfo(url, function (err, info) {
    if (info && info.formats) {
      info.preferredFormat = info.formats[info.formats.length - 1];
    }

    cache.save('ytdl', url, info);
    return cb(err, info);
  });
}
