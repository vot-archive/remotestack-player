const _ = require('lodash');
var PreferencesModel = require('../models/preferences');
const Utils = require('rs-base/utils');
const FileUtils = require('rs-base/utils/files');
const Nav = require('../renderer/nav');

Utils.log('settingsPath: ', PreferencesModel.getLocation());
Utils.log('settings:     ', JSON.stringify(_.omit(PreferencesModel.get(), 'streams'), null, 2));

var UI = {
  isInitialised: false,

  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');

    $('.togglePlaylistBtn').click(function () {
      // resize window
      _self.togglePlaylist();
    });

    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      // Ctrl/Cmd + ,
      if ((e.ctrlKey || e.metaKey) && e.which === 188) {
        Utils.log('Cmd+, hit');
        Nav.goto('preferences');
        return e.preventDefault();
      }
      // Esc [27] || Ctrl/Cmd + .
      if (e.which == 27 || (e.ctrlKey || e.metaKey) && e.which === 190) {
        Utils.log('Esc or Cmd+. hit');
        Nav.goto('nowplaying');
        return e.preventDefault();
      }
      // F1 [112] || Ctrl/Cmd + / [191]
      if (e.which === 112 || (e.ctrlKey || e.metaKey) && e.which === 191) {
        Utils.log('F1 or / hit');
        Nav.goto('help');
        return e.preventDefault();
      }


      // TODO Ctrl/Cmd + Alt + E (69)    EQ
      // TODO Ctrl/Cmd + Alt + V (XX)    Video

      // Ctrl/Cmd + Alt + P (80)
      // if (e.altKey && (e.ctrlKey || e.metaKey) && (e.which === 80)) {

      // Just P (80)
      if (e.which === 80) {
        Utils.log('P hit');
        if ($('.navContent.active').attr('id') === 'nowplaying') {
          _self.togglePlaylist();
          return e.preventDefault();
        }
      }
    });
  },


  preventDragRedirections: function preventDragRedirections() {
    document.addEventListener('dragover',function(event){
      event.preventDefault();
      return false;
    },false);

    document.addEventListener('drop',function(event){
      event.preventDefault();
      return false;
    },false);
  },

 /**
  * Functions below migrated from NowPlaying
  */
  bindFiledrag: function bindFiledrag(id) {
    const _self = this;
    let holder;
    if (!id) {
      holder = document;
    } else {
      holder = document.getElementById(id || 'filedrag');
    }

    holder.ondragover = () => {
      return false;
    }
    holder.ondragleave = holder.ondragend = () => {
      return false;
    }
    holder.ondrop = (e) => {
      e.preventDefault();
      console.log(e);
      for (let f of e.dataTransfer.files) {
        var filepath = f.path;
        var allFiles = FileUtils.unfoldFiles(f.path);

        _.each(allFiles, function (file) {
          Playlist.add({url: file, source: 'file', type: 'audio'});
        })

        Player.populatePlaylist();
        var message = allFiles.length > 1 ? 'Tracks added' : 'Track added';
        RS.displayNotification(message);
      }
      return false;
    }
  },
  bindURLInput: function bindURLInput(id) {
    const _self = this;
    const inputEl = $('#' + (id || 'urlinput'));

    function addURLToPlaylist () {
      if (inputEl.val()) {
        Playlist.add({url: inputEl.val(), source: 'youtube', type: 'audio'});
        Player.populatePlaylist();
        RS.displayNotification('Track added');
        inputEl.val('');
        return true;
      }
    }

    $('.urlentry .btn').on('click', function () {
      addURLToPlaylist();
    });

    inputEl.on('keydown', function (e) {
      if (e.which === 13) {
        e.preventDefault();
        addURLToPlaylist();
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

    // add 35 as a third step and always size forward

    var playlistThresholds = [128, 420];
    var shouldShow = $(window).height() < playlistThresholds[0]+1;
    var currentWidth = $(window).width();

    if (shouldShow) {
      window.resizeTo(currentWidth, playlistThresholds[1])
    } else {
      window.resizeTo(currentWidth, playlistThresholds[0])
    }
  }

};

module.exports = UI;
