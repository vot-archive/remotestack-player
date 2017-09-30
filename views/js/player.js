'use strict';

(function (global) {
  const UI = require('../renderer/ui');
  const PlaybackLib = require('../renderer/playback');
  const PlaylistLib = require('../lib/playlist');
  const Utils = require('../lib/utils');

  RS.displayNotification = function displayNotification(text) {
    $('#notifications')
      .clearQueue()
      .text(text)
      .fadeIn(250)
      .delay(3000)
      .fadeOut(1000);
  };

  global.WaveSurfer = require('./vendor/js/wavesurfer/wavesurfer.min.js');

  const PlayerWindow = {
    togglePlaylist: function togglePlaylist() {
      // let activeId = $('.mainContent .navContent.active').attr('id');
      // let isActive = activeId === 'nowplaying';
      // if (!isActive) {
      //   return;
      // }

      // TODO add 35 as a third step and always size forward

      const playlistThresholds = [120, 420];
      const shouldShow = $(window).height() < playlistThresholds[0] + 1;
      const currentWidth = $(window).width();

      if (shouldShow) {
        window.resizeTo(currentWidth, playlistThresholds[1]);
        $('*[data-toggle=playlist]').addClass('active');
      } else {
        window.resizeTo(currentWidth, playlistThresholds[0]);
        $('*[data-toggle=playlist]').removeClass('active');
      }
    },

    initialiseButtonStates: function initialiseButtonStates() {
      const playlistActive = $(window).height() > 120 + 1;
      const repeatActive = PlaylistLib.getRepeat();
      const shuffleActive = PlaylistLib.getShuffle();

      if (playlistActive) {
        $('*[data-toggle=playlist]').addClass('active');
      } else {
        $('*[data-toggle=playlist]').removeClass('active');
      }

      if (repeatActive) {
        $('*[data-toggle=repeat]').addClass('active');
      } else {
        $('*[data-toggle=repeat]').removeClass('active');
      }

      if (shuffleActive) {
        $('*[data-toggle=shuffle]').addClass('active');
      } else {
        $('*[data-toggle=shuffle]').removeClass('active');
      }

      console.log('playlistActive', playlistActive);
      console.log('repeatActive', repeatActive);
      console.log('shuffleActive', shuffleActive);
    },

    toggleRepeat: function toggleRepeat() {
      const self = this;
      const initial = PlaylistLib.getRepeat();
      const newVal = !initial;
      PlaylistLib.setRepeat(newVal);
      self.lightUpToggleRepeat();
      return newVal;
    },
    toggleShuffle: function toggleShuffle() {
      const self = this;
      const initial = PlaylistLib.getShuffle();
      const newVal = !initial;
      PlaylistLib.setShuffle(newVal);
      self.lightUpToggleShuffle();
      return newVal;
    },


    lightUpToggleRepeat: function lightUpToggleRepeat() {
      const value = PlaylistLib.getRepeat();

      if (value) {
        $('*[data-toggle=repeat]').addClass('active');
      } else {
        $('*[data-toggle=repeat]').removeClass('active');
      }
    },

    lightUpToggleShuffle: function lightUpToggleShuffle() {
      const value = PlaylistLib.getShuffle();

      if (value) {
        $('*[data-toggle=shuffle]').addClass('active');
      } else {
        $('*[data-toggle=shuffle]').removeClass('active');
      }
    },

    bindPlayerShortcuts: function bindPlayerShortcuts() {
      const self = this;
      $('*[data-toggle=playlist]').click(function () {
        // resize window
        self.togglePlaylist();
      });

      $('*[data-toggle=repeat]').click(function () {
        self.toggleRepeat();
      });

      $('*[data-toggle=shuffle]').click(function () {
        self.toggleShuffle();
      });


      $(document).on('keydown', function (e) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
          return;
        }

        if (e.which === 80) {
          Utils.log('P hit');
          self.togglePlaylist();
          e.preventDefault();
          return;
        }

        if (e.which === 82 && !(e.ctrlKey || e.metaKey)) {
          Utils.log('R hit');
          self.toggleRepeat();
          e.preventDefault();
          return;
        }

        if (e.which === 83) {
          Utils.log('S hit');
          self.toggleShuffle();
          e.preventDefault();
        }



        // play/pause
        if (e.which === 32) {
          // RS.Utils.log('space hit');
          PlaybackLib.ensureWavesurfer().playPause();
          e.preventDefault();
          return;
        }

        // track +5s
        if (e.which === 37) {
          // RS.Utils.log('arrow left hit');
          PlaybackLib.ensureWavesurfer().skipBackward();
          e.preventDefault();
          return;
        }

        // track -5s
        if (e.which === 39) {
          // RS.Utils.log('arrow right hit');
          PlaybackLib.ensureWavesurfer().skipForward();
          e.preventDefault();
          return;
        }

        // vol up
        if (e.which === 38) {
          // RS.Utils.log('arrow up hit');
          const newVolume = PlaybackLib.volume + 5;
          PlaybackLib.setVolume(newVolume);
          // RS.displayNotification('Volume set to ' + newVolume);
          e.preventDefault();
          return;
        }

        // vol down
        if (e.which === 40) {
          // RS.Utils.log('arrow down hit');
          const newVolume = PlaybackLib.volume - 5;
          PlaybackLib.setVolume(newVolume);
          // RS.displayNotification('Volume set to ' + newVolume);
          e.preventDefault();
          return;
        }

        // prev song
        if (!(e.ctrlKey || e.metaKey) && e.which === 188) {
          // RS.Utils.log('< hit');
          PlaybackLib.prev();
          e.preventDefault();
          return;
        }

        // next song
        if (!(e.ctrlKey || e.metaKey) && e.which === 190) {
          // RS.Utils.log('> hit');
          PlaybackLib.next();
          e.preventDefault();
        }
      });
    },
  };



  $(document).ready(function mainWindowOnDocumentReady() {
    UI.resolveUIPreferences();
    RS.PlayerWindow = PlayerWindow;

    if ($('#waveform').length) {
      PlaybackLib.ensureWavesurfer();
      PlaybackLib.loadByIndex('active');
      PlaybackLib.bindMousewheel();
    }

    PlayerWindow.lightUpToggleRepeat();
    PlayerWindow.lightUpToggleShuffle();

    UI.bindWCtl();
    UI.bindFiledrag();
    RS.PlayerWindow.bindPlayerShortcuts();
    RS.PlayerWindow.initialiseButtonStates();
  });
}(window));
