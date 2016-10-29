window.WaveSurfer = require('./assets/js/wavesurfer/wavesurfer.min.js');

$(document).ready(function () {
  Player.ensureWavesurfer();
  // Player.next();
  Player.loadByIndex('active');

  NowPlaying.init();
});
