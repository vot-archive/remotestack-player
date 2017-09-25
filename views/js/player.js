(function(global) {
  const UI = require('../renderer/ui');
  const Player = require('../renderer/player');

  RS.displayNotification = function (text) {
    $('#notifications').text(text).fadeIn(250).delay(3000).fadeOut(1000);
  };

  global.WaveSurfer = require('./js/libs/wavesurfer/wavesurfer.min.js');

  $(document).ready(function () {
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
