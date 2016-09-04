var Utils = require('../lib/utils');
var Playlist = require('../lib/playlist');


var NowPlaying = {
  init: function init () {
    _self = this;
    console.log('NowPlaying.init function triggered');
    // get playlist entries and load them into the appropriate container
    var list = Playlist.get();

    Utils.log('list', list);

    var markup = '';
    if (Array.isArray(list)) {
      // recursively add markup
      list.forEach(function (i) {
        markup += '<li>' + i.resolved.meta.canonical.artist + ' - ' + i.resolved.meta.canonical.title + '<span class="url">' +  i.url + '</span></li>';
      })
    }
    $('#nowplaying-playlist').append(markup);
    // now highlight active
    _self.bindShortcuts();
  },
  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }
      // P = 80; E = 69

      // Ctrl/Cmd + Alt + P
      if (e.altKey && (e.ctrlKey || e.metaKey) && (e.which === 80)) {
        Utils.log('Cmd+Alt+P hit');
        _self.togglePlaylist();
        return e.preventDefault();
      }
    });
  },
  togglePlaylist: function togglePlaylist () {
    var shouldShow = $(window).height() < 111;
    var currentWidth = $(window).width();
    var playlistThresholds = [110, 420];

    if (shouldShow) {
      window.resizeTo(currentWidth, playlistThresholds[1])
    } else {
      window.resizeTo(currentWidth, playlistThresholds[0])
    }
  }
}


// Toggle Playlist


module.exports = NowPlaying;
