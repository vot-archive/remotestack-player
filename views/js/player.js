'use strict';

(function (global) {
  const PlaybackLib = require('../renderer/playback');
  const PlaylistLib = require('../lib/playlist');
  const PlaylistsModel = require('../models/playlists');
  const PreferencesModel = require('../models/preferences');
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

    /**
     * Getters and setters for shuffle and repeat
     */
    setShuffle: function setShuffle(bool) {
      const newVal = !!bool;
      PreferencesModel.set('playlist.shuffle', newVal);
    },
    getShuffle: function getShuffle() {
      return PreferencesModel.get('playlist.shuffle') || false;
    },

    setRepeat: function setRepeat(bool) {
      const newVal = !!bool;
      PreferencesModel.set('playlist.repeat', newVal);
    },
    getRepeat: function getRepeat() {
      return PreferencesModel.get('playlist.repeat') || false;
    },

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
      const repeatActive = this.getRepeat();
      const shuffleActive = this.getShuffle();

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
      const initial = this.getRepeat();
      const newVal = !initial;
      this.setRepeat(newVal);
      this.lightUpToggleRepeat();
      return newVal;
    },
    toggleShuffle: function toggleShuffle() {
      const initial = this.getShuffle();
      const newVal = !initial;
      this.setShuffle(newVal);
      this.lightUpToggleShuffle();
      return newVal;
    },


    lightUpToggleRepeat: function lightUpToggleRepeat() {
      const value = this.getRepeat();

      if (value) {
        $('*[data-toggle=repeat]').addClass('active');
      } else {
        $('*[data-toggle=repeat]').removeClass('active');
      }
    },

    lightUpToggleShuffle: function lightUpToggleShuffle() {
      const value = this.getShuffle();

      if (value) {
        $('*[data-toggle=shuffle]').addClass('active');
      } else {
        $('*[data-toggle=shuffle]').removeClass('active');
      }
    },


    /**
     * Sets the play/pause button to indicate what its currently bound action
     *
     * @param {boolean} state Current playback state (is it actively playing)
     * true = currently playing (display pause symbol on button)
     * false = currently paused (display play symbol on button)
     */
    setPlayButton: function setPlayButton(state) {
      $('.playerCtl#WSPlay .fa, .playerCtl#WSPlay .fa').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'pause' : 'play'));
    },

    updateTrackTime: function updateTrackTime(clear) {
      const currTimeDiv = $('.timeElapsed');
      const durationDiv = $('.timeTotal');
      const wavesurfer = PlaybackLib.wavesurfer;

      let currTime = '----';
      let duration = '----';

      if (wavesurfer && !clear) {
        currTime = PlaybackLib.getWavesurfer().getCurrentTime();
        duration = PlaybackLib.getWavesurfer().getDuration();

        currTime = RS.Utils.formatSecondsAsTime(currTime);
        duration = RS.Utils.formatSecondsAsTime(duration);
      }

      // RS.Utils.log('updateCurrentTime', currTime, duration);

      currTimeDiv.text(currTime);
      durationDiv.text(duration);
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
          PlaybackLib.getWavesurfer().playPause();
          e.preventDefault();
          return;
        }

        // track +5s
        if (e.which === 37) {
          // RS.Utils.log('arrow left hit');
          PlaybackLib.getWavesurfer().skipBackward();
          e.preventDefault();
          return;
        }

        // track -5s
        if (e.which === 39) {
          // RS.Utils.log('arrow right hit');
          PlaybackLib.getWavesurfer().skipForward();
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


    populatePlaylist: function populatePlaylist() {
      const self = this;
      PlaylistsModel.removeAllListeners('default.playlist');
      const list = PlaylistLib.get();
      // RS.Utils.log('populatePlaylist', _.map(list, 'url'));

      const markup = RS.UI.render('partials/playlist', { playlist: list });
      $('#nowplaying-playlist').html(markup);
      self.populateTrackinfo();

      PlaylistsModel.once('default.playlist', function () {
        console.log('Playlist changed, refreshing');
        self.populatePlaylist();
      });
    },

    populateTrackinfo: function populateTrackinfo() {
      const container = $('#nowplaying-trackinfo');
      const activeIndex = PlaylistLib.getActive();
      const playlist = PlaylistLib.get();
      const currentTrack = playlist[activeIndex];
      let markup = '';
      RS.Utils.log('populateTrackinfo'); // , JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

      if (currentTrack) {
        markup = RS.UI.render('partials/trackinfo', { currentTrack });
      }

      container.html(markup);
    },

    bindMousewheel: function bindMousewheel() {
      $('#rsPlayerVolume').mousewheel(function onVolumeMouseWheel(event) {
        const offset = event.deltaX || event.deltaY;
        const newVal = parseInt($('#rsPlayerVolume').val(), 10) + offset;
        PlaybackLib.setVolume(newVal);
      });

      $('#waveform').mousewheel(function onWaveformMouseWheel(event) {
        const offset = event.deltaX || event.deltaY;
        if (offset) {
          PlaybackLib.getWavesurfer().skip(offset * (RS.UI.mousewheelMultiplier || 1));
        }
      });
    },
  };



  $(document).ready(function mainWindowOnDocumentReady() {
    RS.UI.resolveUIPreferences();
    RS.PlayerWindow = PlayerWindow;

    if ($('#waveform').length) {
      PlaybackLib.getWavesurfer();
      PlaybackLib.loadByIndex('active');
      PlayerWindow.bindMousewheel();
    }

    RS.PlayerWindow.lightUpToggleRepeat();
    RS.PlayerWindow.lightUpToggleShuffle();

    RS.UI.bindWCtl();
    RS.UI.bindFiledrag();
    RS.PlayerWindow.bindPlayerShortcuts();
    RS.PlayerWindow.initialiseButtonStates();
  });
}(window));
