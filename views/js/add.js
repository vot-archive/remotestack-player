(function(global) {
  const UI = require('../renderer/ui');
  // const Player = require('../renderer/player');
  // const Playlist = require('../lib/playlist');

  $(document).ready(function () {
    UI.bindShortcuts();
    UI.preventDragRedirections();
  });


}(window));
