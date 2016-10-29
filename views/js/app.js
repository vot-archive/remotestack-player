window.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');
require('../renderer/imports')
var Nav = require('../renderer/nav');
var UI = require('../renderer/ui');
var fse = require('fs-extra');



var Renderer = require('../renderer');
var Player = require('../lib/player');
var NowPlaying = require('../renderer/nowplaying');
var Playlist = require('../lib/playlist');

require('./js/preferences')

var RS = {};

RS.updateAppVersionInfo = function () {
  var packageObj = fse.readJsonSync(__dirname + '/../package.json');
  var version = packageObj.version || '';

  $('#versionTag').text(version);
};

$(document).ready(function () {
  Player.ensureWavesurfer();
  // Player.next();
  Player.loadByIndex('active');
  NowPlaying.init();

  // Renderer.bindShortcuts();
  Player.bindShortcuts();

  Nav.init();
  UI.bindShortcuts();
  UI.preventDragRedirections();

  RS.updateAppVersionInfo();
});
