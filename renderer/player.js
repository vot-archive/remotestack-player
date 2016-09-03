const ytdl = require('../lib/parsers/ytdl');
const cache = require('../lib/cache');
const playlist = require('../lib/playlist');
var settings = require('electron-settings');
var Utils = require('../lib/utils');

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

  wavesurfer.on('ready', function () {
    Utils.log('Track ready');
    // wavesurfer.empty();
    wavesurfer.drawBuffer();
    Player.applyVolumeSetting();
    Player.updateTrackTime();

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
    Player.next();
    Player.play();
  });

  Player.wavesurferObject = wavesurfer;
}

function _interpretPlaylistItem (item, cb) {
  var cached = cache.persistent.getJSON('meta-resolved', item.url);
  if (cached) {
    return cb(cached);
  }
  item.playbackUrl = item.url;

  if (item.source === 'youtube') {
    return ytdl(item.url, function (err, info) {
      Utils.log(info);
      if (err || !info) {
        item.playbackUrl = false;
      } else {
        item.playbackUrl = info.preferredFormat.url;
      }

      cache.persistent.setJSON('meta-resolved', item.url, item);
      return cb(item);
    });
  }

  cache.persistent.setJSON('meta-resolved', item.url, item);
  return cb(item);
}

function _getPlaylistItem (item, cb) {
  var key = item.playbackUrl;
  var cached = cache.persistent.getFile('item', key);
  if (cached) {
    return cb(cached);
  }
  cache.persistent.fetchFile(key, function (filepath) {
    return filepath;
  })
}

var Player = {
  // state
  // queue: settings.getSync('streams.0.playlist'),
  queue: playlist.initialPlaylist,

  volume: 100,
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
    var prevTrack = this.queue.pop();
    this.queue.unshift(prevTrack); // add track to the end of queue

    // var audioTag = this.getElement();
    // var playState = audioTag ? !audioTag.paused : false;

    this.load(prevTrack);
    // this.play(playState);
  },

  next: function next () {
    var nextTrack = this.queue.shift();
    this.queue.push(nextTrack); // add track to the end of queue

    var audioTag = this.getElement();
    var playState = audioTag ? !audioTag.paused : false;

    this.load(nextTrack);
    this.play(playState);
  },

  setPlayButton: function setPlayButton (state) {
    this.playing = state;
    $('.fa.fa-play, .fa.fa-pause').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'play' : 'pause'));
  },

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
      this.applyVolumeSetting();
    }
  },

  applyVolumeSetting: function () {
    Utils.log('setting volume to', this.volume)
    this.ensureWavesurfer().setVolume(this.volume / 100);
    $('#rsPlayerVolume').val(this.volume);
  },


  updateTrackTime: function (track) {
    var currTimeDiv = $('.timeElapsed');
    var durationDiv = $('.timeTotal');

    var currTime = this.ensureWavesurfer().getCurrentTime();
    var duration = this.ensureWavesurfer().getDuration();

    // Utils.log('updateCurrentTime', currTime, duration);

    currTimeDiv.text(Utils.formatSecondsAsTime(currTime));
    durationDiv.text(Utils.formatSecondsAsTime(duration));

    // update current position on the range element
    var positionInput = $('#rsPlayerPosition');
    positionInput.val(Math.floor(currTime));
  },

  load: function load (source) {
    var _self = this;
    _self.ensureWavesurfer();
    var wavesurferObject = _self.wavesurferObject;

    $('#currentArtist').text('Loading');
    $('#currentTitle').text(source.url);

    _interpretPlaylistItem(source, function (track) {
      Utils.log('>> _interpretPlaylistItem returned', track);
      cache.persistent.getFile(track.playbackUrl, function (filepath) {
        var finalPath = filepath || track.url;
        // var finalPath = track.url;
        //_.get(track, 'resolved.audio', false);

        Utils.log('>> finalPath', finalPath);
        wavesurferObject.load(finalPath);

        // $('#currentArtist').text(track.artist);
        // $('#currentTitle').text(track.title);

        $('#currentArtist').text(track.resolved.meta.canonical.artist);
        $('#currentTitle').text(track.resolved.meta.canonical.title);
        Utils.log('Track info updated', track.resolved.meta.canonical.artist, track.resolved.meta.canonical.title);
      })
    });

  },

  bindShortcuts: function bindShortcuts () {
    const _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      // 32 === space
      if (e.which === 32) {
        Utils.log('space hit');
        _self.ensureWavesurfer().playPause();
        return e.preventDefault();
      }

      if (e.which === 37) {
        // Utils.log('arrow left hit');
        _self.ensureWavesurfer().skipBackward();
        return e.preventDefault();
      }

      if (e.which === 39) {
        // Utils.log('arrow right hit');
        _self.ensureWavesurfer().skipForward();
        return e.preventDefault();
      }

    });

    $('#rsPlayerVolume').mousewheel(function(event) {
      var newVal = parseInt($('#rsPlayerVolume').val()) + event.deltaY;
      _self.setVolume(newVal);
    });

    $('#waveform').mousewheel(function(event) {
      if (event.deltaX) {
        _self.ensureWavesurfer().skip(event.deltaX/3);
      }
    });

  }
};

module.exports = Player;
