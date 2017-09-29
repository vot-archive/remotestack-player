'use strict';

const _ = require('lodash');
const urlgent = require('../lib/urlgent');
const cache = require('../lib/electron/filecache');
const PlaylistLib = require('../lib/playlist');
const PreferencesModel = require('../models/preferences');
const PlaylistsModel = require('../models/playlists');
const MarkupRenderer = require('../renderer/markup');

function ensureWavesurfer(opts) {
  if (RS.Player.wavesurferObject) {
    return RS.Player.wavesurferObject;
  }
  opts = opts || {};

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
    RS.Player.applyVolumeSetting();
    RS.Player.updateTrackTime();
    RS.Player.populatePlaylist();

    // postEvent
    function onreadyFn() {
      $('#waveform').css('visibility', 'visible');
      $('#waveform-loading').hide();
    }
    if (typeof opts.onready === 'function') {
      opts.onready();
    } else {
      onreadyFn();
    }


    if (RS.Player.playing) {
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
    RS.Player.updateTrackTime();
  });

  wavesurfer.on('play', function wavesurferOnPlay() {
    // RS.Utils.log('Play event');
    RS.Player.setPlayButton(false);
  });
  wavesurfer.on('pause', function wavesurferOnPause() {
    // RS.Utils.log('Pause event');
    RS.Player.setPlayButton(true);
  });

  wavesurfer.on('finish', function wavesurferOnFinish() {
    RS.Utils.log('Track finished');
    // RS.Player.wavesurferObject.destroy();
    // RS.Player.wavesurferObject = null;
    RS.Player.updateTrackTime(true);
    RS.Player.next();
    RS.Player.play();
  });

  RS.Player.wavesurferObject = wavesurfer;
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

const Player = {
  // state
  // queue: PlaylistsModel.get('default.playlist'),
  queue: PlaylistLib.get(),

  volume: PreferencesModel.get('settings.volume') || 100,
  loopOne: false,
  loopAll: false,
  playing: false,
  waveformObject: null,

  ensureWavesurfer,
  // methods
  getElement: function getElement() {
    return $('#rsPlayerAudioContainer audio')[0];
  },

  play: function play(state) {
    RS.Utils.log('play(' + state + ')');
    const self = this;
    const audioTag = self.getElement();
    if (!audioTag) {
      RS.Utils.log('RS.Player.play: No audio element present');
      return;
    }

    // state = state || audioTag.paused || true;
    RS.Utils.log('state:', state);

    if (typeof state !== 'boolean') {
      RS.Utils.log('audioTag.paused:', audioTag.paused);
      state = audioTag.paused || false;
    }

    if (state) {
      RS.Utils.log('Playing');
      audioTag.play();
      self.setPlayButton(false);
    } else {
      RS.Utils.log('Pausing');
      audioTag.pause();
      self.setPlayButton(true);
    }

    self.updatePositionMax(self.getElement());
  },

  prev: function prev() {
    const playlist = PlaylistLib.get();
    const playState = this.playing;
    const nextTrackIndex = PlaylistLib.setActive('prev');
    const nextTrack = playlist[nextTrackIndex];
    console.log((nextTrackIndex + 1), 'out of', playlist.length);

    RS.Utils.log('>>Prev track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  next: function next() {
    const playlist = PlaylistLib.get();
    const playState = this.playing;
    const nextTrackIndex = PlaylistLib.setActive('next');
    const nextTrack = playlist[nextTrackIndex];
    console.log((nextTrackIndex + 1), 'out of', playlist.length);

    RS.Utils.log('>>Next track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  setPlayButton: function setPlayButton(state) {
    this.playing = state;
    $('.playerCtl#WSPlay .fa, .playerCtl#WSPlay .fa').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'play' : 'pause'));
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
    this.ensureWavesurfer().setVolume(this.volume / 100);
    $('#rsPlayerVolume').val(this.volume);
  },


  updateTrackTime: function updateTrackTime(clear) {
    const self = this;
    const currTimeDiv = $('.timeElapsed');
    const durationDiv = $('.timeTotal');
    const wavesurferObject = self.wavesurferObject;

    let currTime = '----';
    let duration = '----';

    if (wavesurferObject && !clear) {
      currTime = this.ensureWavesurfer().getCurrentTime();
      duration = this.ensureWavesurfer().getDuration();

      currTime = RS.Utils.formatSecondsAsTime(currTime);
      duration = RS.Utils.formatSecondsAsTime(duration);
    }

    // RS.Utils.log('updateCurrentTime', currTime, duration);

    currTimeDiv.text(currTime);
    durationDiv.text(duration);
  },

  loadByIndex: function loadByIndex(index) {
    RS.Utils.log('loadByIndex', index);
    if (index === 'active') {
      index = PlaylistLib.setActive('active');
    }
    index = PlaylistLib.setActive(index);
    RS.Utils.log('index', index);

    return this.load(PlaylistLib.get()[index]);
  },
  load: function load(source) {
    console.log('hit populatePlaylist from RS.Player.load');
    const self = this;


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

    // executeWavesurferLoad
    function executeWavesurferLoad(finalPath) {
      RS.Utils.log('>> finalPath', finalPath);
      $('#waveform').css('visibility', 'hidden');

      wavesurferObject.load(finalPath);
    }

    // populatePlaylist
    self.populatePlaylist();

    if (!source) {
      return;
    }
    // if (source.source === 'file') {
    //   let filestat = fs.statSync(source.url);
    //   if (!filestat.isFile()) {
    //     RS.Utils.log(source.url, 'is not a file');
    //     return;
    //   }
    // }

    // reset track info
    $('#currentArtist').text('').addClass('animated pulse');
    $('#currentTitle').text(source.url).addClass('animated pulse');

    $('#waveform-loading').text('RESOLVING').show();
    $('#waveform').css('visibility', 'hidden');

    // reset time
    self.updateTrackTime(true);

    // initialise wavesurfer
    self.ensureWavesurfer();
    const wavesurferObject = self.wavesurferObject;


    interpretPlaylistItem(source, function interpretPlaylistItemCb(trackdata) {
      RS.Utils.log('>> interpretPlaylistItem returned', _.omit(trackdata, 'raw'));

      if (trackdata.source === 'youtube' && !trackdata.playbackUrl) {
        RS.Utils.log('ERR! empty playbackUrl, stopping', _.omit(trackdata, 'raw'));
        $('#waveform-loading').text('ERROR').show();
        return false;
      }
      self.populateTrackinfo();
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

  populatePlaylist: function populatePlaylist() {
    const self = this;
    PlaylistsModel.removeAllListeners('default.playlist');
    const list = PlaylistLib.get();
    // RS.Utils.log('populatePlaylist', _.map(list, 'url'));

    const markup = MarkupRenderer.render('partials/playlist', { playlist: list });
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
    RS.Utils.log('populateTrackinfo', JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

    if (currentTrack) {
      markup = MarkupRenderer.render('partials/trackinfo', { currentTrack });
    }

    container.html(markup);
  },

  bindShortcuts: function bindShortcuts() {
    const self = this;
    RS.Utils.log('bindShortcuts called');
    $(document).on('keydown', function onKeyDown(e) {
      const tag = e.target.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }


      // play/pause
      if (e.which === 32) {
        // RS.Utils.log('space hit');
        self.ensureWavesurfer().playPause();
        e.preventDefault();
        return;
      }



      // track +5s
      if (e.which === 37) {
        // RS.Utils.log('arrow left hit');
        self.ensureWavesurfer().skipBackward();
        e.preventDefault();
        return;
      }

      // track -5s
      if (e.which === 39) {
        // RS.Utils.log('arrow right hit');
        self.ensureWavesurfer().skipForward();
        e.preventDefault();
        return;
      }



      // vol up
      if (e.which === 38) {
        // RS.Utils.log('arrow up hit');
        self.setVolume(self.volume + 5);
        e.preventDefault();
        return;
      }

      // vol down
      if (e.which === 40) {
        // RS.Utils.log('arrow down hit');
        self.setVolume(self.volume - 5);
        e.preventDefault();
        return;
      }



      // prev song
      if (!(e.ctrlKey || e.metaKey) && e.which === 188) {
        // RS.Utils.log('< hit');
        self.prev();
        e.preventDefault();
        return;
      }

      // next song
      if (!(e.ctrlKey || e.metaKey) && e.which === 190) {
        // RS.Utils.log('> hit');
        self.next();
        e.preventDefault();
      }
    });

    $('#rsPlayerVolume').mousewheel(function onVolumeMouseWheel(event) {
      const offset = event.deltaX || event.deltaY;
      const newVal = parseInt($('#rsPlayerVolume').val(), 10) + offset;
      self.setVolume(newVal);
    });

    $('#waveform').mousewheel(function onWaveformMouseWheel(event) {
      const offset = event.deltaX || event.deltaY;
      if (offset) {
        self.ensureWavesurfer().skip(offset * (RS.UI.mousewheelMultiplier || 1));
      }
    });
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

};

module.exports = Player;
