require('../renderer/imports')
var Nav = require('../renderer/nav');
var UI = require('../renderer/ui');

var Renderer = require('../renderer');
var Player = require('../lib/player');
var NowPlaying = require('../renderer/nowplaying');
var Playlist = require('../lib/playlist');

$(document).ready(function () {
  // Renderer.bindShortcuts();
  Player.bindShortcuts();

  Nav.init();
  UI.bindShortcuts();
  UI.preventDragRedirections();
});
