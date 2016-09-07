var electron = require('electron');
var settings = require('electron-settings');
var cache = require('./cache');
var Utils = require('./utils');

// var app = electron.app;

var initialPlaylist = [{
  "url": "https://soundcloud.com/vot-z/colours-demo",
  "source": "youtube",
  "type": "audio",
  "resolved": {
    "meta": {
      "canonical": {
        "title": "Colours",
        "artist": "Vot"
      }
    }
  }
}];
const STREAMNAME = 'default';

Utils.log('playlist.js:getSettingsFilePath', settings.getSettingsFilePath());

var Playlist = {
  get: function get () {
    Utils.log('playlist.js:getSettingsFilePath', settings.getSettingsFilePath());
    var pls = settings.getSync('streams.' + STREAMNAME + '.playlist');
    // stream = stream || '0';
    if (!pls) {
      Utils.log('\x1b[31mNo playlist found, replacing with file contents\x1b[0m');
      this.save(initialPlaylist);
      pls = initialPlaylist;
    } else {
      Utils.log('\x1b[32mPlaylist found\x1b[0m');
      Utils.log(pls);
    }
    return pls;
  },
  // update: function update (stream, updateObject) {
  //   return initialPlaylist;
  // },
  add: function add (newObject) {
    Utils.log('\x1b[33mplaylist.js:add\x1b[0m', newObject);
    var pls = this.get();
    pls.push(newObject);
    Utils.log('pls', pls);
    this.save(pls);
  },
  save: function save (fullPlaylist) {
    Utils.log('\x1b[33mplaylist.js:saving\x1b[0m', fullPlaylist);
    return settings.setSync('streams.' + STREAMNAME + '.playlist', fullPlaylist);
  }
  // resolveAll: function (stream) {
  //   stream = stream || '0';
  //   var _self = this;
  //   var pls = _self.get(stream);
  //
  //   // _.each(pls, function (item) {
  //   //   item
  //   // })
  // }
}

module.exports = Playlist;
module.exports.initialPlaylist = initialPlaylist;
