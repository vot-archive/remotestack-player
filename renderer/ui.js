const _ = require('lodash');
var PreferencesModel = require('../models/preferences');
const Utils = require('rs-base/utils');
const FileUtils = require('rs-base/utils/files');
const PlaylistLib = require('../lib/playlist');
const electron = require('electron');
const shell = electron.shell;
const MarkupRenderer = require('./markup');


// Utils.log('settingsPath: ', PreferencesModel.getLocation());
// Utils.log('settings:     ', JSON.stringify(_.omit(PreferencesModel.get(), 'streams'), null, 2));

var UI = {
  mousewheelMultiplier: 1,
  /**
   * Resolves theme and user preferences
   */
  resolveUIPreferences: function resolveUIPreferences () {
    var theme = PreferencesModel.get('ui.theme');
    if (!theme) {
      theme = 'light';
    }
    RS.Utils.log('adding syle class class:', theme);
    $('#wContainer').addClass(theme);



    var showFullPath = PreferencesModel.get('ui.showFullPath');
    console.log('showFullPath', showFullPath);
    if (typeof showFullPath === 'undefined') {
      showFullPath = false;
      PreferencesModel.set('ui.showFullPath', false);
    }

    if (showFullPath) {
      $('#wContainer').addClass('showFullPath');
    }
  },


  /**
   * Renders templates and partials and loads them into DOM
   */
  loadAppTemplates: function loadAppTemplates (data) {
    var _self = this;
    data = data || {};

    var templateTags = $('rsTemplate');
    _.forEach(templateTags, function (tag) {
      var template = $(tag).data('name');

      console.log('processing template tag:', template);
      var markup = _self.renderTemplate(template, data);
      $(tag).after(markup);
      $(tag).remove();
    })
  },


  renderPartial: MarkupRenderer.renderPartial,
  renderTemplate: MarkupRenderer.renderTemplate,

  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');

    $('*[data-toggle=playlist]').click(function () {
      // resize window
      _self.togglePlaylist();
    });

    $('*[data-toggle=repeat]').click(function () {
      var newVal = RS.Player.toggleRepeat();
      if (newVal) {
        $('*[data-toggle=repeat]').addClass('active');
      } else {
        $('*[data-toggle=repeat]').removeClass('active');
      }
    });

    $('*[data-toggle=shuffle]').click(function () {
      var newVal = RS.Player.toggleShuffle();
      if (newVal) {
        $('*[data-toggle=shuffle]').addClass('active');
      } else {
        $('*[data-toggle=shuffle]').removeClass('active');
      }
    });


    $('*[data-toggle=window-close]').click(function () {
      RS.Window.close();
    });

    $('*[data-toggle=window-minimise]').click(function () {
      RS.Window.minimise();
    });

    $('*[data-toggle=window-maximise]').click(function () {
      RS.Window.maximise();
    });

    $('*[data-toggle=window-app-quit]').click(function () {
      RS.Window.appQuit();
    });



    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      // Ctrl/Cmd + ,
      // if ((e.ctrlKey || e.metaKey) && e.which === 188) {
      //   Utils.log('Cmd+, hit');
      //   Nav.goto('preferences');
      //   return e.preventDefault();
      // }
      // // Esc [27] || Ctrl/Cmd + .
      // if (e.which == 27 || (e.ctrlKey || e.metaKey) && e.which === 190) {
      //   Utils.log('Esc or Cmd+. hit');
      //   Nav.goto('nowplaying');
      //   return e.preventDefault();
      // }
      // // F1 [112] || Ctrl/Cmd + / [191]
      // if (e.which === 112 || (e.ctrlKey || e.metaKey) && e.which === 191) {
      //   Utils.log('F1 or / hit');
      //   Nav.goto('help');
      //   return e.preventDefault();
      // }


      // TODO Ctrl/Cmd + Alt + E (69)    EQ
      // TODO Ctrl/Cmd + Alt + V (XX)    Video

      // E (69)
      // P (80)
      // R (82)
      // S (83)

      // Ctrl/Cmd + Alt: (e.altKey && (e.ctrlKey || e.metaKey))


      if (e.which === 80) {
        Utils.log('P hit');
        _self.togglePlaylist();
        return e.preventDefault();
      }

      if (e.which === 82 && !(e.ctrlKey || e.metaKey)) {
        Utils.log('R hit');
        RS.Player.toggleRepeat();
        return e.preventDefault();
      }

      if (e.which === 83) {
        Utils.log('S hit');
        RS.Player.toggleShuffle();
        return e.preventDefault();
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
          RS.Playlist.add({url: file, source: 'file', type: 'audio'});
        })

        RS.Player.populatePlaylist();
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
        RS.Playlist.add({url: inputEl.val(), source: 'youtube', type: 'audio'});
        RS.Player.populatePlaylist();
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
    // var activeId = $('.mainContent .navContent.active').attr('id');
    // var isActive = activeId === 'nowplaying';
    // if (!isActive) {
    //   return;
    // }

    // TODO add 35 as a third step and always size forward

    var playlistThresholds = [128, 420];
    var shouldShow = $(window).height() < playlistThresholds[0]+1;
    var currentWidth = $(window).width();

    if (shouldShow) {
      window.resizeTo(currentWidth, playlistThresholds[1])
      $('*[data-toggle=playlist]').addClass('active');
    } else {
      window.resizeTo(currentWidth, playlistThresholds[0])
      $('*[data-toggle=playlist]').removeClass('active');
    }
  },

  initialiseButtonStates: function () {
    var playlistActive = $(window).height() > 128+1;
    var repeatActive = PlaylistLib.getRepeat();
    var shuffleActive = PlaylistLib.getShuffle();

    if (playlistActive) {
      $('*[data-toggle=playlist]').addClass('active');
    } else {
      $('*[data-toggle=playlist]').removeClass('active');
    }

    if (repeatActive) {
      $('*[data-toggle=repeat]').addClass('active');
    } else {
      $('*[data-toggle=repeat]').removeClass('active');
    }

    if (shuffleActive) {
      $('*[data-toggle=shuffle]').addClass('active');
    } else {
      $('*[data-toggle=shuffle]').removeClass('active');
    }

    console.log('playlistActive', playlistActive);
    console.log('repeatActive', repeatActive);
    console.log('shuffleActive', shuffleActive);

  },

  handleExternalLinks: function () {
    const links = document.querySelectorAll('a[href]');

    Array.prototype.forEach.call(links, function (link) {
      var url = link.getAttribute('href');
      Utils.log('Caught a click to' + url);

      if (url.indexOf('http') === 0) {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          shell.openExternal(url);
        });
      }

      if (url.indexOf('file') === 0) {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          url = url.replace('file://', '');


          const app = electron.app || electron.remote.app;
          const userData = app.getPath('userData');
          // const tmpdir = os.tmpdir();
          // url = url.replace('$$TMPDIR', tmpdir);
          url = url.replace('$$USERDATA', userData);


          // shell.showItemInFolder(url);
          shell.openItem(url);
        });
      }
    })
  },

  //
  // PREFERENCES
  //
  handlePreferencesCheckboxChange: function handlePreferencesCheckboxChange(input) {
    var key = $(input).val();
    var isChecked = $(input).is(':checked');
    console.log('setting', key, 'to', isChecked);
    PreferencesModel.set(key, !!isChecked);
    window.location = window.location;
  },

  handlePreferencesInputChange: function handlePreferencesInputChange(input) {
    var key = $(input).attr('name');
    var value = $(input).val();
    PreferencesModel.set(key, value);
    window.location = window.location;
  },

  assignPreferencesCheckboxDefaults: function assignPreferencesCheckboxDefaults() {
    $('.settings-item input[type="checkbox"]').each(function () {
      var key = $(this).val();
      var isChecked = PreferencesModel.get(key) || false;
      $(this).prop('checked', isChecked);
    });
  },

  assignPreferencesInputDefaults: function assignPreferencesInputDefaults() {
    $('.settings-item input, .settings-item select').each(function () {
      if ($(this).attr('type') === 'checkbox') {
        return;
      }
      var key = $(this).attr('name');
      var value = PreferencesModel.get(key) || false;
      $(this).val(value);
    });
  }
};

module.exports = UI;
