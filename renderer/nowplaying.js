var _ = require('lodash');
var Utils = require('../lib/utils');
var Playlist = require('../lib/playlist');


var NowPlaying = {
  init: function init () {
    _self = this;
    console.log('NowPlaying.init function triggered');

    _self.populatePlaylist();
    _self.bindShortcuts();
    _self.bindFiledrag('filedrag');
  },
  populatePlaylist: function populatePlaylist () {
    // get playlist entries and load them into the appropriate container
    // TODO: highlight active
    var list = Playlist.get();
    Utils.log('populatePlaylist', _.map(list, 'url'));

    var markup = '';
    if (Array.isArray(list)) {
      // recursively add markup
      var index = 0;
      list.forEach(function (i) {
        var classname = i.active ? 'active' : '';
        markup += '<li class="' + classname + '" onclick="Player.loadByIndex(' + index + ');">' + Playlist.getDisplayTitle(i) + '<span class="url">' +  i.url + '</span></li>';
        index++;
      });
    }
    $('#nowplaying-playlist').html(markup);
  },
  bindFiledrag: function bindFiledrag(id) {
    const _self = this;
    const holder = document.getElementById(id || 'filedrag');

    holder.ondragover = () => {
      return false;
    }
    holder.ondragleave = holder.ondragend = () => {
      return false;
    }
    holder.ondrop = (e) => {
      e.preventDefault();
      for (let f of e.dataTransfer.files) {
        var filepath = f.path;

        Utils.log('File dragged: ', filepath);
        Playlist.add({url: filepath, source: 'file', type: 'audio'});
        _self.populatePlaylist();
      }
      return false;
    }
  },
  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      // TODO Ctrl/Cmd + Alt + E (69)    EQ
      // TODO Ctrl/Cmd + Alt + V (XX)    Video

      // Ctrl/Cmd + Alt + P (80)
      if (e.altKey && (e.ctrlKey || e.metaKey) && (e.which === 80)) {
        Utils.log('Cmd+Alt+P hit');
        _self.togglePlaylist();
        return e.preventDefault();
      }
    });
  },
  togglePlaylist: function togglePlaylist () {
    var activeId = $('.mainContent .navContent.active').attr('id');
    var isActive = activeId === 'nowplaying';
    if (!isActive) {
      return;
    }

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
