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
    _self.bindFileinput('urlinput');
    _self.bindTabs('rsPlayerBrowser');
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
        if (i) {
          var classname = i.active ? 'active' : '';
          markup += '<li class="' + classname + '" onclick="Player.loadByIndex(' + index + ');">';
          markup += '<span class="title">' + Playlist.getDisplayTitle(i) + '</span>';
          markup += '<span class="delete pull-right" onclick="Playlist.deleteByIndex(' + index + ')"> <i class="fa fa-fw fa-trash-o"></i> </span>';
          markup += '<span class="url">' +  i.url + '</span>';
          markup += '</li>';
          index++;
        }
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
  bindFileinput: function bindFileinput(id) {
    const _self = this;
    const holder = document.getElementById(id || 'urlinput');

    holder.onkeydown = function (e) {
      if (e.which === 13) {
        e.preventDefault();
        var filepath = $(e.target).val();
        Utils.log('Enter pressed: ', filepath);

        Playlist.add({url: filepath, source: 'youtube', type: 'audio'});
        _self.populatePlaylist();
        //reset input
        $(e.target).val('')
        return true;
      }
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
  bindTabs: function bindTabs (containerId) {
    $('.tabContent', container).hide();

    var container = $('#' + containerId);
    var tabs = $('ul.tabs', container);
    // var content = $('.tabContent', container);

    $('li', tabs).click(function () {
      var destination = $(this).data('tabDestination');
      $('li', tabs).removeClass('active');
      $(this).addClass('active');
      console.log('tabDestination', destination);
      $('.tabContent', container).hide();
      $('.tabContent[rel=' + destination + ']', container).show();
    });

    $('ul.tabs li:first', container).trigger('click');
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
