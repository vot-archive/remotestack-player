'use strict';

const _ = require('lodash');
const urlgent = require('../lib/urlgent');
const cache = require('../lib/electron/filecache');
const PlaylistLib = require('../lib/playlist');
const PreferencesModel = require('../models/preferences');

function getWavesurfer() {
  if (RS.Playback.wavesurfer) {
    return RS.Playback.wavesurfer;
  }

  const wavesurfer = WaveSurfer.create({
    container: '#waveform',

    waveColor: '#847c71',
    progressColor: '#ffa100',

    barWidth: 1,
    cursorWidth: 0,

    height: 40,
    // width: 600,
    normalize: true,
    scrollParent: false,
    skipLength: 5,
  });

  $('#WSPlay').off();
  $('#WSPlay').on('click', function onPlayButtonClick() {
    wavesurfer.playPause();
  });

  wavesurfer.on('error', function wavesurferOnError(e) {
    console.log('wavesurfer error', e);
    return null;
  });

  wavesurfer.on('ready', function wavesurferOnReady() {
    RS.Utils.log('Track ready');
    // wavesurfer.empty();
    wavesurfer.drawBuffer();
    RS.Playback.applyVolumeSetting();
    RS.PlayerWindow.populatePlaylist();
    RS.PlayerWindow.updateTrackTime();

    // postEvent
    function onreadyFn() {
      $('#waveform').css('visibility', 'visible');
      $('#waveform-loading').hide();
    }
    onreadyFn();


    if (RS.Playback.isPlaying()) {
      wavesurfer.play();
    }

    $(window).resize(function onWindowResize() {
      // RS.Utils.log('Window resize');
      wavesurfer.drawBuffer();

      const openModals = $('.modal.in');
      const modalsMinHeight = 400;
      if (openModals.length) {
        const height = $(document).height();
        if (height < modalsMinHeight) {
          $('.modal').modal('hide');
        }
      }
    });
  });



  wavesurfer.on('audioprocess', function wavesurferOnAudioprocess() {
    RS.PlayerWindow.updateTrackTime();
  });

  wavesurfer.on('seek', function wavesurferOnSeek() {
    RS.PlayerWindow.updateTrackTime();
  });

  wavesurfer.on('play', function wavesurferOnPlay() {
    // RS.Utils.log('Play event');
    RS.Playback.isPlaying(true);
    RS.PlayerWindow.setPlayButton(true);
  });

  wavesurfer.on('pause', function wavesurferOnPause() {
    // RS.Utils.log('Pause event');
    RS.Playback.isPlaying(false);
    RS.PlayerWindow.setPlayButton(false);
  });

  wavesurfer.on('finish', function wavesurferOnFinish() {
    RS.Utils.log('Track finished');
    RS.PlayerWindow.updateTrackTime(true);
    RS.Playback.next();
  });

  RS.Playback.wavesurfer = wavesurfer;
  return wavesurfer;
}

function interpretPlaylistItem(item, cb) {
  const cached = cache.getJSON('meta-resolved', item.url);
  if (cached) {
    return cb(cached);
  }

  if (item.source === 'youtube') {
    return urlgent(item.url, function urlgentLookup(err, info) {
      // RS.Utils.log('resolved info:', info);
      if (err || !info) {
        item.playbackUrl = false;
      } else {
        item.playbackUrl = (info.media.audio.url || info.media.video.url);
        item.title = info.title;
      }
      // item.raw = info;

      PlaylistLib.update({ url: item.url }, item);
      cache.setJSON('meta-resolved', item.url, item);
      // console.log('playlist updated');
      return cb(item);
    });
  }

  // cache.setJSON('meta-resolved', item.url, item);
  return cb(item);
}

const PlaybackLib = {
  // state
  // queue: PlaylistsModel.get('default.playlist'),
  // queue: PlaylistLib.get(),

  volume: PreferencesModel.get('settings.volume') || 30, // don't start on full volume
  loopOne: false,
  loopAll: false,
  playing: false,
  waveformObject: null,

  getWavesurfer,
  // methods
  getElement: function getElement() {
    return $('#rsPlayerAudioContainer audio')[0];
  },

  isPlaying: function isPlaying(value) {
    if (typeof value === 'boolean') {
      this.playing = value;
      return null;
    }
    return this.playing;
  },


  prev: function prev() {
    const playlist = PlaylistLib.get();
    const newTrackIndex = PlaylistLib.setActive('prev');
    if (typeof newTrackIndex === 'number') {
      const nextTrack = playlist[newTrackIndex];
      this.load(nextTrack);
    }
  },

  next: function next() {
    const playlist = PlaylistLib.get();
    const newTrackIndex = PlaylistLib.setActive('next');
    if (typeof newTrackIndex === 'number') {
      const nextTrack = playlist[newTrackIndex];
      this.load(nextTrack);
    }
  },

  // TODO: Support setVolume('+5') syntax
  setVolume: function setVolume(vol) {
    if (typeof vol !== 'number') {
      if (typeof vol === 'object') {
        const obj = $(vol);
        const objVal = obj.val();
        if (obj && objVal) {
          vol = objVal;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    if (vol > 100) vol = 100;
    if (vol < 0) vol = 0;
    if (this.volume !== vol) {
      this.volume = vol;
      PreferencesModel.set('settings.volume', vol);
      this.applyVolumeSetting();
    }
  },

  applyVolumeSetting: function applyVolumeSetting() {
    // RS.Utils.log('setting volume to', this.volume)
    this.getWavesurfer().setVolume(this.volume / 100);
    $('#rsPlayerVolume').val(this.volume);
  },

  loadByIndex: function loadByIndex(index) {
    RS.Utils.log('loadByIndex', index);
    if (index === 'active') {
      index = PlaylistLib.setActive('active');
    }
    index = PlaylistLib.setActive(index);
    RS.Utils.log('index', index);

    return PlaybackLib.load(PlaylistLib.get()[index]);
  },

  load: function load(source) {
    console.log('hit populatePlaylist from RS.Playback.load');
    const self = this;
    const currentPlayState = this.isPlaying();

    // updateCurrentTrack
    function updateCurrentTrack(trackdata) {
      const artist = _.get(trackdata, 'resolved.meta.canonical.artist', '');
      let title = _.get(trackdata, 'resolved.meta.canonical.title', '');

      if (!artist.length || !title.length) {
        title = PlaylistLib.getDisplayTitle(trackdata);
      }

      $('#currentArtist').text(artist).removeClass('animated pulse');
      $('#currentTitle').text(title).removeClass('animated pulse');

      RS.Utils.log('Playlist entry resolved', artist, title);
    }

    function resetCurrentTrackInfo() {
      // reset track info
      $('#currentArtist').text('').addClass('animated pulse');
      $('#currentTitle').text(source.url).addClass('animated pulse');

      $('#waveform-loading').text('RESOLVING').show();
      $('#waveform').css('visibility', 'hidden');
    }

    // executeWavesurferLoad
    function executeWavesurferLoad(finalPath) {
      RS.Utils.log('>> finalPath', finalPath);
      $('#waveform').css('visibility', 'hidden');

      self.wavesurfer.load(finalPath);
      if (currentPlayState) {
        // self.wavesurfer.on('ready');
        RS.Utils.log('it was playing and should do now');
        self.wavesurfer.play();
      }
    }

    // populatePlaylist
    RS.PlayerWindow.populatePlaylist();

    if (!source) {
      return;
    }

    resetCurrentTrackInfo();

    // reset time
    RS.PlayerWindow.updateTrackTime(true);

    // initialise wavesurfer
    self.getWavesurfer();


    interpretPlaylistItem(source, function (trackdata) {
      RS.Utils.log('>> interpretPlaylistItem returned'); // , _.omit(trackdata, 'raw'));

      if (trackdata.source === 'youtube' && !trackdata.playbackUrl) {
        RS.Utils.log('ERR! empty playbackUrl, stopping', _.omit(trackdata, 'raw'));
        $('#waveform-loading').text('ERROR').show();
        return false;
      }
      RS.PlayerWindow.populateTrackinfo();
      $('#waveform-loading').text('BUFFERING').show();


      updateCurrentTrack(trackdata);

      if (trackdata.source === 'file') {
        return executeWavesurferLoad(trackdata.url, trackdata);
      }

      cache.getFile(trackdata.playbackUrl, function (filepath) {
        // let finalPath = filepath || trackdata.url;
        return executeWavesurferLoad(filepath || trackdata.playbackUrl, trackdata);
      });
    });
  },

};

module.exports = PlaybackLib;
