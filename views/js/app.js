(function(global) {
  const os = require('os');
  const fse = require('fs-extra');
  const UI = require('../renderer/ui');
  const Player = require('../renderer/player');
  const Playlist = require('../lib/playlist');
  const Utils = require('../lib/utils');
  const ipcEmitters = require('../lib/ipcEmitters');
  const windowCtl = require('../lib/windowCtl');
  const checkForUpdates = require('./js/checkForUpdates');

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
  })



  RS.platform = os.type().toLowerCase();
  UI.mousewheelMultiplier = RS.platform === 'darwin' ? 0.5 : 1.5;
  RS.version = appVersion;

  RS.displayNotification = function (text) {
    $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
  };

  RS.renderPartial = function (partial, data) {
    console.log('RS.renderPartial called with', partial, data);
    return UI.renderPartial(partial, data);
  }

  RS.renderTemplate = function (template, data) {
    data.appVersion = appVersion;
    console.log('RS.renderTemplate called with', template, data);
    return UI.renderTemplate(template, data);
  }

  RS.Playlist = Playlist;
  RS.Player = Player;
  RS.UI = UI;
  RS.Utils = Utils;
  RS.Window = windowCtl;
  RS.IPC = ipcEmitters;

  global.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');
  global.RS = RS;

  $(document).ready(function () {
    UI.resolveUIPreferences();
    UI.loadAppTemplates({appVersion: appVersion});

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

    // enumerate devices
    // navigator.mediaDevices.enumerateDevices()
    // .then(function(devices) {
    //   RS.devices = {
    //     audioOut: devices.filter(function (d) {return d.kind === 'audiooutput'}),
    //     audioIn: devices.filter(function (d) {return d.kind === 'audioinput'})
    //   };
    // })
    // .catch(function(err) {
    //   console.log(err.name + ": " + err.message);
    // });
  });


}(window))
