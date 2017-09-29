'use strict';

const _ = require('lodash');
const PreferencesModel = require('../models/preferences');
const Utils = require('../lib/utils');
const FileUtils = require('../lib/utils/fileutils');
const PlaylistLib = require('../lib/playlist');
const electron = require('electron');
const MarkupRenderer = require('./markup');
const shell = electron.shell;

const webFrame = electron.webFrame;
webFrame.setZoomLevelLimits(1, 1);

// Utils.log('settingsPath: ', PreferencesModel.getLocation());
// Utils.log('settings:     ', JSON.stringify(_.omit(PreferencesModel.get(), 'streams'), null, 2));

const UI = {
  mousewheelMultiplier: 1,
  /**
   * Resolves theme and user preferences
   */
  resolveUIPreferences: function resolveUIPreferences() {
    $('body').removeClass();
    $('#wCtls').removeClass();

    let theme = PreferencesModel.get('ui.theme');
    if (!theme) {
      theme = 'light';
    }
    RS.Utils.log('adding style class:', theme);
    $('body').addClass(theme);



    let wCtlPos = PreferencesModel.get('ui.windowCtlPosition');
    if (!wCtlPos) {
      wCtlPos = 'left';
    }
    RS.Utils.log('adding wCtl class:', wCtlPos);
    $('#wCtls').addClass(wCtlPos);


    let wCtlStyle = PreferencesModel.get('ui.windowCtlStyle');
    if (!wCtlStyle) {
      wCtlStyle = 'generic';
    }
    RS.Utils.log('adding wCtl class:', wCtlStyle);
    $('#wCtls').addClass(wCtlStyle);



    let showFullPath = PreferencesModel.get('ui.showFullPath');
    console.log('showFullPath', showFullPath);
    if (typeof showFullPath === 'undefined') {
      showFullPath = false;
      PreferencesModel.set('ui.showFullPath', false);
    }

    if (showFullPath) {
      $('body').addClass('showFullPath');
    }
  },


  /**
   * Renders templates and partials and loads them into DOM
   */
  renderPartialTags: function renderPartialTags(data) {
    const self = this;
    data = data || {};

    const partialTags = $('partial');
    _.forEach(partialTags, function (tag) {
      const view = $(tag).data('view');

      console.log('processing partial:', view);
      const markup = self.render('partials/' + view, data);
      $(tag).after(markup);
      $(tag).remove();
    });
  },


  render: MarkupRenderer.render,

  /**
   * Binds all data binds and shortcuts
   */
  bindShortcuts: function bindShortcuts() {
    const self = this;
    Utils.log('bindShortcuts called');

    $('*[data-toggle=playlist]').click(function () {
      // resize window
      self.togglePlaylist();
    });

    $('*[data-toggle=repeat]').click(function () {
      RS.Player.toggleRepeat();
    });

    $('*[data-toggle=shuffle]').click(function () {
      RS.Player.toggleShuffle();
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



    $(document).on('keydown', function (e) {
      const tag = e.target.tagName.toLowerCase();
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
        self.togglePlaylist();
        e.preventDefault();
        return;
      }

      if (e.which === 82 && !(e.ctrlKey || e.metaKey)) {
        Utils.log('R hit');
        RS.Player.toggleRepeat();
        e.preventDefault();
        return;
      }

      if (e.which === 83) {
        Utils.log('S hit');
        RS.Player.toggleShuffle();
        e.preventDefault();
      }
    });
  },


  preventDragRedirections: function preventDragRedirections() {
    document.addEventListener('dragover', function (event) {
      event.preventDefault();
      return false;
    }, false);

    document.addEventListener('drop', function (event) {
      event.preventDefault();
      return false;
    }, false);
  },

  /**
   * Functions below migrated from NowPlaying
   */
  bindFiledrag: function bindFiledrag(id) {
    let holder;
    if (!id) {
      holder = document;
    } else {
      holder = document.getElementById(id || 'filedrag');
    }

    holder.ondragover = holder.ondragleave = holder.ondragend = function onDragFinish() {
      return false;
    };

    holder.ondrop = function (e) {
      console.log(e);
      e.preventDefault();
      let allFiles = [];

      for (const f of e.dataTransfer.files) {
        const filesBatch = FileUtils.unfoldFiles(f.path);
        allFiles = allFiles.concat(filesBatch);

        _.each(filesBatch, function (file) {
          RS.Playlist.add({ url: file, source: 'file', type: 'audio' });
        });

        RS.Player.populatePlaylist();
      }

      const message = allFiles.length > 1 ? 'Tracks added' : 'Track added';
      RS.displayNotification(message);
      return false;
    };
  },

  togglePlaylist: function togglePlaylist() {
    // let activeId = $('.mainContent .navContent.active').attr('id');
    // let isActive = activeId === 'nowplaying';
    // if (!isActive) {
    //   return;
    // }

    // TODO add 35 as a third step and always size forward

    const playlistThresholds = [128, 420];
    const shouldShow = $(window).height() < playlistThresholds[0] + 1;
    const currentWidth = $(window).width();

    if (shouldShow) {
      window.resizeTo(currentWidth, playlistThresholds[1]);
      $('*[data-toggle=playlist]').addClass('active');
    } else {
      window.resizeTo(currentWidth, playlistThresholds[0]);
      $('*[data-toggle=playlist]').removeClass('active');
    }
  },

  initialiseButtonStates: function initialiseButtonStates() {
    const playlistActive = $(window).height() > 128 + 1;
    const repeatActive = PlaylistLib.getRepeat();
    const shuffleActive = PlaylistLib.getShuffle();

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

  handleExternalLinks: function handleExternalLinks(link) {
    const links = link || document.querySelectorAll('a[href]');

    Array.prototype.forEach.call(links, function (l) {
      let url = l.getAttribute('href');
      Utils.log('Detected a link to "' + url + '"');

      if (url.indexOf('http') === 0) {
        l.addEventListener('click', function (e) {
          e.preventDefault();
          shell.openExternal(url);
        });
      }

      if (url.indexOf('file') === 0) {
        l.addEventListener('click', function (e) {
          e.preventDefault();
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
    });
  },

  //
  // PREFERENCES
  //
  handlePreferencesCheckboxChange: function handlePreferencesCheckboxChange(input) {
    const key = $(input).val();
    const isChecked = $(input).is(':checked');
    RS.IPCEmitter('update-setting', { key, value: isChecked });
  },

  handlePreferencesInputChange: function handlePreferencesInputChange(input) {
    const key = $(input).attr('name');
    const value = $(input).val();
    // PreferencesModel.set(key, value);
    // window.location = window.location;
    RS.IPCEmitter('update-setting', { key, value });
  },

  assignPreferencesCheckboxDefaults: function assignPreferencesCheckboxDefaults() {
    $('.settings-item input[type="checkbox"]').each(function () {
      const key = $(this).val();
      const isChecked = PreferencesModel.get(key) || false;
      $(this).prop('checked', isChecked);
    });
  },

  assignPreferencesInputDefaults: function assignPreferencesInputDefaults() {
    $('.settings-item input, .settings-item select').each(function () {
      if ($(this).attr('type') === 'checkbox') {
        return;
      }
      const key = $(this).attr('name');
      const value = PreferencesModel.get(key) || false;
      $(this).val(value);
    });
  },


  showContextMenu: function showContextMenu(ev) {
    console.log('showContextMenu', $(ev).attr('id'));
  },
};

module.exports = UI;
