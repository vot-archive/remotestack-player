var _ = require('lodash');
var Utils = require('../lib/utils');
var Playlist = require('../lib/playlist');
var PreferencesModel = require('../models/preferences');
var fs = require('fs-extra');

var ignoredFilenames = ['.DS_Store', 'desktop.ini'].map(function (i) {return i.toLowerCase()});
var ignoredExtensions = ['jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'].map(function (i) {return i.toLowerCase()});

function _isAudioFile (filepath) {
  var filename = _.last(filepath.split('/')).toLowerCase();
  var extension = _.last(filename.split('.'));

  if (ignoredFilenames.indexOf(filename) !== -1) return false;
  if (ignoredExtensions.indexOf(extension) !== -1) return false;

  return true;
}


function _unfoldFiles (path, list) {
  list = list || [];
  var stats = fs.statSync(path);
  var isFile = stats.isFile();
  var isDir = stats.isDirectory();

  if (isFile) {
    list.push(path);
  }
  if (isDir) {
    _.each(fs.readdirSync(path), function (i) {
      return _unfoldFiles(path + '/' + i, list);
    });
  }

  return _.filter(list, _isAudioFile);
}

var NowPlaying = {
  init: function init () {
    _self = this;
    console.log('NowPlaying.init function triggered');

    _self.populatePlaylist();
    _self.bindShortcuts();
    _self.bindFiledrag('filedrag');
    _self.bindFileinput('urlinput');
    _self.bindTabs('rsPlayerBrowser');


    PreferencesModel.on('streams.default.playlist', evt => {
      console.log('Playlist changed, refreshing')
      _self.populatePlaylist();
    });
  },
  // get playlist entries and load them into the appropriate container
  populatePlaylist: function populatePlaylist () {
    var list = Playlist.get();
    Utils.log('populatePlaylist', _.map(list, 'url'));

    var markup = '';
    if (Array.isArray(list)) {
      // recursively add markup
      var index = 0;
      list.forEach(function (i) {
        if (i) {
          var classname = i.active ? 'active' : '';
          markup += '<li class="' + classname + '" ondblclick="Player.loadByIndex(' + index + ');">';
          markup += '<span class="delete pull-right" onclick="Playlist.deleteByIndex(' + index + ')"> <i class="fa fa-fw fa-trash-o"></i> </span>';
          markup += '<span class="title">' + Playlist.getDisplayTitle(i) + '</span>';
          markup += '<span class="url">' +  i.url + '</span>';
          markup += '</li>';
          index++;
        }
      });
    }
    $('#nowplaying-playlist').html(markup);
    this.populateTrackinfo();
  },
  populateTrackinfo: function populateTrackinfo () {
    var container = $('#nowplaying-trackinfo');
    var activeIndex = Playlist.getActive();
    var playlist = Playlist.get();
    var currentTrack = playlist[activeIndex];
    var markup = '';
    Utils.log('populateTrackinfo', JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

    if (currentTrack) {
      markup = '<table>';
      _.forEach(Object.keys(currentTrack), function (i) {
        markup += '<tr>';
          markup += '<th width="80">' + i + '</th>';
          var data = currentTrack[i];
          markup += '<td>' + (typeof data === 'object' ? '<pre>' + JSON.stringify(data, null, 2) + '</pre>': data) + '</td>';
        markup += '</tr>';
      });
      markup += '</table>';
    }

    container.html(markup);
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
        var allFiles = _unfoldFiles(f.path);

        _.each(allFiles, function (file) {
          Playlist.add({url: file, source: 'file', type: 'audio'});
        })

        _self.populatePlaylist();
        var message = allFiles.length > 1 ? 'Tracks added' : 'Track added';
        _self.displayNotification(message);
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
        _self.displayNotification('Track added');
        //reset input
        $(e.target).val('')
        return true;
      }
    }
  },
  displayNotification: function displayNotification(text) {
    $('#notifications').text(text).show();
    $('#notifications').fadeOut(3000);
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
