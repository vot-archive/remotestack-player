(function(global) {
  const os = require('os');
  const fse = require('fs-extra');
  const UI = require('../renderer/ui');
  const Player = require('../renderer/player');
  const Playlist = require('../lib/playlist');
  const Utils = require('../lib/utils');
  const windowCtl = require('../lib/windowCtl');
  const checkForUpdates = require('./js/checkForUpdates');
  const ipcEmitter = require('../lib/ipc/emitter');

  const packageObj = fse.readJsonSync(__dirname + '/../package.json');
  const appVersion = packageObj.version || '';

  const RS = {};

  checkForUpdates(function (err, data) {
    if (err) {
      console.log(err);
    }
    if (!err && data) {
      if (data.needsUpdate) {
        $('#updateNotice').show().html('Version ' + data.newest + ' available. <a href="' + data.url + '" class="btn btn-xs btn-default">Update</a>');

        UI.handleExternalLinks($('#updateNotice a'));
      }
    }
  });



  RS.platform = os.type().toLowerCase();
  UI.mousewheelMultiplier = RS.platform === 'darwin' ? 0.5 : 1.5;
  RS.version = appVersion;

  RS.displayNotification = function (text) {
    $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
  };

  RS.render = function (view, data) {
    console.log('RS.render called with', view, data);
    return UI.render(view, data);
  };

  RS.Playlist = Playlist;
  RS.Player = Player;
  RS.UI = UI;
  RS.Utils = Utils;
  RS.Window = windowCtl;
  RS.IPCEmitter = ipcEmitter;

  RS.showContextMenu = RS.UI.showContextMenu;

  global.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');
  global.RS = RS;

  $(document).ready(function () {
    UI.resolveUIPreferences();
    UI.renderPartialTags({appVersion: appVersion});

    Player.ensureWavesurfer();
    Player.loadByIndex('active');
    Player.bindShortcuts();

    Player.lightUpToggleRepeat();
    Player.lightUpToggleShuffle();

    UI.bindShortcuts();
    UI.preventDragRedirections();

    UI.bindFiledrag();
    UI.bindURLInput('urlinput');
    UI.bindTabs('rsPlayerBrowser');

    UI.initialiseButtonStates();
    UI.handleExternalLinks();

    UI.assignPreferencesCheckboxDefaults();
    UI.assignPreferencesInputDefaults();
  });


}(window));
