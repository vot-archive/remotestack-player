'use strict';

(function (global) {
  const UI = require('../renderer/ui');
  const Player = require('../renderer/player');

  RS.displayNotification = function displayNotification(text) {
    $('#notifications')
      .text(text)
      .fadeIn(250)
      .delay(3000)
      .fadeOut(1000);
  };

  global.WaveSurfer = require('./vendor/js/wavesurfer/wavesurfer.min.js');

  $(document).ready(function mainWindowOnDocumentReady() {
    UI.renderPartialTags({});
    UI.resolveUIPreferences();

    if ($('#waveform').length) {
      Player.ensureWavesurfer();
      Player.loadByIndex('active');
      Player.bindShortcuts();

      Player.lightUpToggleRepeat();
      Player.lightUpToggleShuffle();
    }

    UI.bindShortcuts();
    UI.preventDragRedirections();
    UI.bindFiledrag();
    UI.initialiseButtonStates();
  });
}(window));
