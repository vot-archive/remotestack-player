(function(global) {
  var imports = require('../renderer/imports');
  var Nav = require('../renderer/nav');
  var fse = require('fs-extra');
  var UI = require('../renderer/ui');
  var Player = require('../renderer/player');
  var Playlist = require('../lib/playlist');
  var PreferencesUI = require('./js/preferences');
  var Utils = require('rs-base/utils');
  var ipcEmitters = require('../lib/ipcEmitters');
  var windowCtl = require('../lib/windowCtl');

  var packageObj = fse.readJsonSync(__dirname + '/../package.json');
  var appVersion = packageObj.version || '';

  var RS = {};

  RS.version = appVersion;

  RS.displayNotification = function (text) {
    $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
  };

  RS.renderPartial = function (partial, data) {
    console.log('RS.renderPartial called with', partial, data);
    return imports.renderPartial(partial, data);
  }

  RS.renderTemplate = function (template, data) {
    data.appVersion = appVersion;
    console.log('RS.renderTemplate called with', template, data);
    return imports.renderTemplate(template, data);
  }

  RS.Playlist = Playlist;
  RS.Player = Player;
  RS.Preferences = PreferencesUI;
  RS.Nav = Nav;
  RS.Utils = Utils;
  RS.Window = windowCtl;
  RS.IPC = ipcEmitters;

  RS.devices = {};

  global.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');
  global.RS = RS;

  $(document).ready(function () {
    imports.resolveUIPreferences();
    imports.loadAppTemplates({appVersion: appVersion});

    Player.ensureWavesurfer();
    Player.loadByIndex('active');
    Player.populatePlaylist();

    Player.bindShortcuts();

    Nav.init();

    UI.bindShortcuts();
    UI.preventDragRedirections();

    UI.bindFiledrag();
    UI.bindURLInput('urlinput');
    UI.bindTabs('rsPlayerBrowser');

    UI.initialiseButtonStates();

    PreferencesUI.assignCheckboxDefaults();
    PreferencesUI.assignInputDefaults();

    // enumerate devices!

    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      RS.devices.audioOut = devices.filter(function (d) {return d.kind === 'audiooutput'});
      RS.devices.audioIn = devices.filter(function (d) {return d.kind === 'audioinput'});
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  });


}(window))
