var imports = require('../renderer/imports');
var Nav = require('../renderer/nav');
var fse = require('fs-extra');
var UI = require('../renderer/ui');
var Player = require('../renderer/player');
var Playlist = require('../lib/playlist');
require('./js/preferences')

var packageObj = fse.readJsonSync(__dirname + '/../package.json');
var appVersion = packageObj.version || '';

window.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');

var RS = {};
RS.version = appVersion;
RS.displayNotification = function (text) {
  $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
};

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
});
