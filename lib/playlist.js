var electron = require('electron');
var settings = require('electron-settings');
var cache = require('./cache');

// var app = electron.app;

var initialPlaylist = [
  {
    'url': 'http://siliconfen.co/v/mp3/Infused-1.41.mp3',
    'source': 'http',
    'type': 'audio',
    'resolved': {
      'audio': 'http://siliconfen.co/v/mp3/Infused-1.41.mp3',
      'video': '',
      'cached': {
        'audio': 'http://siliconfen.co/v/mp3/Infused-1.41.mp3',
        'video': ''
      },
      'meta': {
        'canonical': {
          'title': 'Infused (1.4.1)',
          'artist': 'Vot'
        },
        'id3': {}
      }
    }
  },
  {
    'url': 'http://siliconfen.co/v/mp3/Forget%20me%20now-6.8.11b.mp3',
    'source': 'http',
    'type': 'audio',
    'resolved': {
      'audio': 'http://siliconfen.co/v/mp3/Forget%20me%20now-6.8.11b.mp3',
      'video': '',
      'cached': {
        'audio': 'http://siliconfen.co/v/mp3/Forget%20me%20now-6.8.11b.mp3',
        'video': ''
      },
      'meta': {
        'canonical': {
          'title': 'Forget me now (6.8.11b)',
          'artist': 'Vot'
        },
        'id3': {}
      }
    }
  },
  {
    'url': 'https://www.youtube.com/watch?v=DZGINaRUEkU',
    'source': 'youtube',
    'type': 'video',
    'resolved': {
      'audio': '',
      'video': '',
      'cached': {
        'audio': '',
        'video': ''
      },
      'meta': {
        'canonical': {
          'title': 'Quantum world',
          'artist': 'Symphony of science'
        },
        'ytdl': {},
        'html': {}
      }
    }
  }
];


var Playlist = {
  get: function get (stream) {
    stream = stream || '0';
    return settings.getSync('streams.' + stream + '.playlist') || initialPlaylist;
  },
  update: function update (stream, updateObject) {
    return stream;
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
