require('../renderer/imports')
require('./js/preferences')

window.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');

var fse = require('fs-extra');

var Nav = require('../renderer/nav');
var UI = require('../renderer/ui');
var Renderer = require('../renderer');
var NowPlaying = require('../renderer/nowplaying');
var Player = require('../lib/player');
var Playlist = require('../lib/playlist');



var RS = {};

RS.updateAppVersionInfo = function () {
  var packageObj = fse.readJsonSync(__dirname + '/../package.json');
  var version = packageObj.version || '';

  $('#versionTag').text(version);
};

RS.displayNotification = function (text) {
  $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
}

$(document).ready(function () {
  Player.ensureWavesurfer();
  // Player.next();
  Player.loadByIndex('active');
  NowPlaying.populatePlaylist();

  // Renderer.bindShortcuts();
  Player.bindShortcuts();

  Nav.init();
  UI.bindShortcuts();
  UI.preventDragRedirections();

  UI.bindFiledrag();
  UI.bindURLInput('urlinput');
  UI.bindTabs('rsPlayerBrowser');

  RS.updateAppVersionInfo();
});
