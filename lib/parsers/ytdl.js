var youtubedl = require('youtube-dl');

module.exports = function (url, cb) {
  return youtubedl.getInfo(url, function (err, info) {
    info.preferredFormat = info.formats[info.formats.length - 1];
    return cb(err, info);
  });
};
