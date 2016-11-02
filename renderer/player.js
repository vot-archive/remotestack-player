const _ = require('lodash');
const Utils = require('rs-base/utils');
const ytdl = require('rs-base/resolvers/lib/ytdl');
const cache = require('rs-base/lib/filecache');
const PlaylistLib = require('../lib/playlist');
const PreferencesModel = require('../models/preferences');
const PlaylistsModel = require('../models/playlists');
const renderer = require('../renderer/render');

function ensureWavesurfer() {
  if (Player.wavesurferObject) {
    return Player.wavesurferObject;
  }

  var wavesurfer = WaveSurfer.create({
      container: '#waveform',

      waveColor: '#847c71',
      progressColor: '#ffa100',

      barWidth: 1,
      height: 40,
      // width: 600,
      normalize: true,
      scrollParent: false,
      skipLength: 5

  });

  $('#WSPlay').off();
  $('#WSPlay').on('click', function () {
    wavesurfer.playPause();
  })

  wavesurfer.on('error', function (e) {
    console.log('wavesurfer error', e);
    return;
  });

  wavesurfer.on('ready', function () {
    Utils.log('Track ready');
    // wavesurfer.empty();
    wavesurfer.drawBuffer();
    Player.applyVolumeSetting();
    Player.updateTrackTime();
    Player.populatePlaylist();

    if (Player.playing) {
      wavesurfer.play();
    }

    $(window).resize(function() {
      // Utils.log('Window resize');
      wavesurfer.drawBuffer();
    });
  });



  wavesurfer.on('audioprocess', function () {
    Player.updateTrackTime();
  });

  wavesurfer.on('play', function () {
    // Utils.log('Play event');
    Player.setPlayButton(false);
  });
  wavesurfer.on('pause', function () {
    // Utils.log('Pause event');
    Player.setPlayButton(true);
  });

  wavesurfer.on('finish', function () {
    Utils.log('Track finished');
    // Player.wavesurferObject.destroy();
    // Player.wavesurferObject = null;
    Player.updateTrackTime(true);
    Player.next();
    Player.play();
  });

  Player.wavesurferObject = wavesurfer;
}

function _interpretPlaylistItem (item, cb) {
  var cached = cache.getJSON('meta-resolved', item.url);
  if (cached) {
    return cb(cached);
  }

  if (item.source === 'youtube') {
    return ytdl(item.url, function (err, info) {
      // Utils.log('resolved info:', info);
      if (err || !info) {
        item.playbackUrl = false;
      } else {
        item.playbackUrl = info.preferredFormat.url;
      }
      item.raw = info;

      PlaylistLib.update({url: item.url}, item);
      cache.setJSON('meta-resolved', item.url, item);
      console.log('playlist updated');
      return cb(item);
    });
  }

  // cache.setJSON('meta-resolved', item.url, item);
  return cb(item);
}

function _getPlaylistItem (item, cb) {
  var key = item.playbackUrl;
  var cached = cache.getFile('item', key);
  if (cached) {
    return cb(cached);
  }
  cache.fetchFile(key, function (filepath) {
    return filepath;
  })
}

var Player = {
  // state
  // queue: PlaylistsModel.get('default.playlist'),
  queue: PlaylistLib.get(),

  volume: PreferencesModel.get('settings.volume') || 100,
  loopOne: false,
  loopAll: false,
  playing: false,
  waveformObject: null,

  ensureWavesurfer: ensureWavesurfer,
  // methods
  getElement: function getElement () {
    return $('#rsPlayerAudioContainer audio')[0];
  },

  play: function play (state) {
    Utils.log('play(' + state + ')');
    var _self = this;
    var audioTag = _self.getElement();
    if (!audioTag) {
      Utils.log('Player.play: No audio element present');
      return;
    }

    // state = state || audioTag.paused || true;
    Utils.log('state:', state)

    if (typeof state !== 'boolean') {
      Utils.log('audioTag.paused:', audioTag.paused)
      state = audioTag.paused || false;
    }

    if (state) {
      Utils.log('Playing');
      audioTag.play();
      _self.setPlayButton(false);
    } else {
      Utils.log('Pausing');
      audioTag.pause();
      _self.setPlayButton(true);
    }

    _self.updatePositionMax(_self.getElement());
  },

  prev: function prev () {
    var playlist = PlaylistLib.get();
    var playState = this.playing;
    var nextTrackIndex = PlaylistLib.setActive('prev');
    console.log('nextTrack', nextTrackIndex +1, 'out of', playlist.length);
    var nextTrack = playlist[nextTrackIndex];

    Utils.log('>>Prev track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  next: function next () {
    var playlist = PlaylistLib.get();
    var playState = this.playing;
    var nextTrackIndex = PlaylistLib.setActive('next');
    console.log('nextTrack', nextTrackIndex +1, 'out of', playlist.length);
    var nextTrack = playlist[nextTrackIndex];

    Utils.log('>>Next track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  setPlayButton: function setPlayButton (state) {
    this.playing = state;
    $('.playerCtl .fa.fa-play, .playerCtl .fa.fa-pause').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'play' : 'pause'));
  },

  // TODO: Support setVolume('+5') syntax
  setVolume: function setVolume (vol) {
    if (typeof vol !== 'number') {
      if (typeof vol === 'object') {
        var obj = $(vol);
        var objVal = obj.val();
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
      PreferencesModel.set('settings.volume', vol)
      this.applyVolumeSetting();
    }
  },

  applyVolumeSetting: function () {
    Utils.log('setting volume to', this.volume)
    this.ensureWavesurfer().setVolume(this.volume / 100);
    $('#rsPlayerVolume').val(this.volume);
  },


  updateTrackTime: function (clear) {
    var _self = this;
    var currTimeDiv = $('.timeElapsed');
    var durationDiv = $('.timeTotal');
    var wavesurferObject = _self.wavesurferObject;

    var currTime = '----';
    var duration = '----';

    if (wavesurferObject && !clear) {
      currTime = this.ensureWavesurfer().getCurrentTime();
      duration = this.ensureWavesurfer().getDuration();

      currTime = Utils.formatSecondsAsTime(currTime);
      duration = Utils.formatSecondsAsTime(duration);
    }

    // Utils.log('updateCurrentTime', currTime, duration);

    currTimeDiv.text(currTime);
    durationDiv.text(duration);
  },

  loadByIndex: function loadByIndex (index) {
    Utils.log('loadByIndex', index);
    if (index === 'active') {
      index = PlaylistLib.setActive('active');
    }
    index = PlaylistLib.setActive(index);
    Utils.log('index', index);

    return this.load(PlaylistLib.get()[index]);
  },
  load: function load (source) {
    console.log('hit populatePlaylist from Player.load')
    var _self = this;
    _self.populatePlaylist();
    if (!source) {
      return;
    }
    // if (source.source === 'file') {
    //   var filestat = fs.statSync(source.url);
    //   if (!filestat.isFile()) {
    //     Utils.log(source.url, 'is not a file');
    //     return;
    //   }
    // }
    $('#currentArtist').text('Loading').addClass('animated pulse');
    $('#currentTitle').text(source.url).addClass('animated pulse');
    $('#waveform').css('visibility', 'hidden');
    // reset time
    _self.updateTrackTime(true);
    _self.ensureWavesurfer();
    var wavesurferObject = _self.wavesurferObject;

    function executeWavesurferLoad (finalPath, trackdata) {
      Utils.log('>> finalPath', finalPath);
      wavesurferObject.load(finalPath);

      var artist = _.get(trackdata, 'resolved.meta.canonical.artist', '');
      var title = _.get(trackdata, 'resolved.meta.canonical.title', '');

      if (!artist.length || !title.length) {
        title = PlaylistLib.getDisplayTitle(trackdata);
      }

      $('#currentArtist').text(artist).removeClass('animated pulse');
      $('#currentTitle').text(title).removeClass('animated pulse');
      $('#waveform').css('visibility', 'visible');

      Utils.log('Playlist entry resolved', artist, title);
    }

    _interpretPlaylistItem(source, function (trackdata) {
      Utils.log('>> _interpretPlaylistItem returned', _.omit(trackdata, 'raw'));
      _self.populateTrackinfo();

      if (trackdata.source === 'file') {
        return executeWavesurferLoad(trackdata.url, trackdata);
      }

      cache.getFile(trackdata.playbackUrl, function (filepath) {
        // var finalPath = filepath || trackdata.url;
        return executeWavesurferLoad(filepath || trackdata.playbackUrl, trackdata);
      });

    });

  },

  populatePlaylist: function populatePlaylist () {
    var _self = this;
    PlaylistsModel.removeAllListeners('default.playlist');
    var list = PlaylistLib.get();
    Utils.log('populatePlaylist', _.map(list, 'url'));


    var markup = '';
    if (Array.isArray(list)) {
      markup = renderer.renderPartial('playlist', {playlist: list});
    }
    if (markup.trim() === '') {
      markup = renderer.renderPartial('playlist-empty');
    }
    $('#nowplaying-playlist').html(markup);
    _self.populateTrackinfo();

    PlaylistsModel.once('default.playlist', evt => {
      console.log('Playlist changed, refreshing')
      _self.populatePlaylist();
    });
  },
  populateTrackinfo: function populateTrackinfo () {
    var container = $('#nowplaying-trackinfo');
    var activeIndex = PlaylistLib.getActive();
    var playlist = PlaylistLib.get();
    var currentTrack = playlist[activeIndex];
    var markup = '';
    Utils.log('populateTrackinfo', JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

    if (currentTrack) {
      markup = renderer.renderPartial('trackinfo', {currentTrack: currentTrack});
    }

    container.html(markup);
  },

  bindShortcuts: function bindShortcuts () {
    const _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }


      // play/pause
      if (e.which === 32) {
        // Utils.log('space hit');
        _self.ensureWavesurfer().playPause();
        return e.preventDefault();
      }



      // track +5s
      if (e.which === 37) {
        // Utils.log('arrow left hit');
        _self.ensureWavesurfer().skipBackward();
        return e.preventDefault();
      }

      // track -5s
      if (e.which === 39) {
        // Utils.log('arrow right hit');
        _self.ensureWavesurfer().skipForward();
        return e.preventDefault();
      }



      // vol up
      if (e.which === 38) {
        // Utils.log('arrow up hit');
        _self.setVolume(_self.volume + 5);
        return e.preventDefault();
      }

      // vol down
      if (e.which === 40) {
        // Utils.log('arrow down hit');
        _self.setVolume(_self.volume - 5);
        return e.preventDefault();
      }



      // prev song
      if (!(e.ctrlKey || e.metaKey) && e.which === 188) {
        // Utils.log('< hit');
        _self.prev();
        return e.preventDefault();
      }

      // next song
      if (!(e.ctrlKey || e.metaKey) && e.which === 190) {
        // Utils.log('> hit');
        _self.next();
        return e.preventDefault();
      }

    });

    $('#rsPlayerVolume').mousewheel(function(event) {
      var offset = event.deltaX || event.deltaY;
      var newVal = parseInt($('#rsPlayerVolume').val()) + offset;
      _self.setVolume(newVal);
    });

    $('#waveform').mousewheel(function(event) {
      var offset = event.deltaX || event.deltaY;
      if (offset) {
        _self.ensureWavesurfer().skip(offset/3);
      }
    });

  },

  toggleRepeat: function () {
    console.log('Repeat switch not implemented yet.');
  },
  toggleShuffle: function () {
    console.log('Shuffle switch not implemented yet.');
  },

};

module.exports = Player;
