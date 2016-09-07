var electron = require('electron');
var settings = require('electron-settings');
var cache = require('./cache');

// var app = electron.app;

var initialPlaylist = require('../playlist.json');
const STREAMNAME = 'default';

var Playlist = {
  get: function get (stream) {
    // stream = stream || '0';
    // return settings.getSync('streams.' + stream + '.playlist') || initialPlaylist;
    return initialPlaylist;
  },
  update: function update (stream, updateObject) {
    return initialPlaylist;
  },
  add: function add (stream, newObject) {
    initialPlaylist.push(newObject);
  },
  resolveAll: function (stream) {
    stream = stream || '0';
    var _self = this;
    var pls = _self.get(stream);

    // _.each(pls, function (item) {
    //   item
    // })
  }
}

module.exports = Playlist;
module.exports.initialPlaylist = initialPlaylist;
