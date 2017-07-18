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

  var wavesurfer = WaveSurfer.create({
      container: '#waveform',

      waveColor: '#847c71',
      progressColor: '#ffa100',

      barWidth: 1,
      cursorWidth: 0,

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
    RS.Utils.log('Track ready');
    // wavesurfer.empty();
    wavesurfer.drawBuffer();
    RS.Player.applyVolumeSetting();
    RS.Player.updateTrackTime();
    RS.Player.populatePlaylist();

    // postEvent
    function onreadyFn () {
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

    $(window).resize(function() {
      // RS.Utils.log('Window resize');
      wavesurfer.drawBuffer();

      var openModals = $('.modal.in');
      if (openModals.length) {
        var modalsMinHeight = 400;
        var height = $(document).height();
        if (height < modalsMinHeight) {
          $('.modal').modal('hide');
        }
      }

    });
  });



  wavesurfer.on('audioprocess', function () {
    RS.Player.updateTrackTime();
  });

  wavesurfer.on('play', function () {
    // RS.Utils.log('Play event');
    RS.Player.setPlayButton(false);
  });
  wavesurfer.on('pause', function () {
    // RS.Utils.log('Pause event');
    RS.Player.setPlayButton(true);
  });

  wavesurfer.on('finish', function () {
    RS.Utils.log('Track finished');
    // RS.Player.wavesurferObject.destroy();
    // RS.Player.wavesurferObject = null;
    RS.Player.updateTrackTime(true);
    RS.Player.next();
    RS.Player.play();
  });

  RS.Player.wavesurferObject = wavesurfer;
}

function _interpretPlaylistItem (item, cb) {
  var cached = cache.getJSON('meta-resolved', item.url);
  if (cached) {
    return cb(cached);
  }

  if (item.source === 'youtube') {
    return urlgent(item.url, function (err, info) {
      // RS.Utils.log('resolved info:', info);
      if (err || !info) {
        item.playbackUrl = false;
      } else {
        item.playbackUrl = info.ytdl.preferredFormat.url;
        // item.title = item.canonical.title;
      }
      // item.raw = info;

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
    RS.Utils.log('play(' + state + ')');
    var _self = this;
    var audioTag = _self.getElement();
    if (!audioTag) {
      RS.Utils.log('RS.Player.play: No audio element present');
      return;
    }

    // state = state || audioTag.paused || true;
    RS.Utils.log('state:', state)

    if (typeof state !== 'boolean') {
      RS.Utils.log('audioTag.paused:', audioTag.paused)
      state = audioTag.paused || false;
    }

    if (state) {
      RS.Utils.log('Playing');
      audioTag.play();
      _self.setPlayButton(false);
    } else {
      RS.Utils.log('Pausing');
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

    RS.Utils.log('>>Prev track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  next: function next () {
    var playlist = PlaylistLib.get();
    var playState = this.playing;
    var nextTrackIndex = PlaylistLib.setActive('next');
    console.log('nextTrack', nextTrackIndex +1, 'out of', playlist.length);
    var nextTrack = playlist[nextTrackIndex];

    RS.Utils.log('>>Next track:', nextTrack);

    this.load(nextTrack);
    this.play(playState);
  },

  setPlayButton: function setPlayButton (state) {
    this.playing = state;
    $('.playerCtl#WSPlay .fa, .playerCtl#WSPlay .fa').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'play' : 'pause'));
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
    // RS.Utils.log('setting volume to', this.volume)
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

      currTime = RS.Utils.formatSecondsAsTime(currTime);
      duration = RS.Utils.formatSecondsAsTime(duration);
    }

    // RS.Utils.log('updateCurrentTime', currTime, duration);

    currTimeDiv.text(currTime);
    durationDiv.text(duration);
  },

  loadByIndex: function loadByIndex (index) {
    RS.Utils.log('loadByIndex', index);
    if (index === 'active') {
      index = PlaylistLib.setActive('active');
    }
    index = PlaylistLib.setActive(index);
    RS.Utils.log('index', index);

    return this.load(PlaylistLib.get()[index]);
  },
  load: function load (source) {
    console.log('hit populatePlaylist from RS.Player.load')
    var _self = this;


    // updateCurrentTrack
    function updateCurrentTrack (trackdata) {
      var artist = _.get(trackdata, 'resolved.meta.canonical.artist', '');
      var title = _.get(trackdata, 'resolved.meta.canonical.title', '');

      if (!artist.length || !title.length) {
        title = PlaylistLib.getDisplayTitle(trackdata);
      }

      $('#currentArtist').text(artist).removeClass('animated pulse');
      $('#currentTitle').text(title).removeClass('animated pulse');

      RS.Utils.log('Playlist entry resolved', artist, title);
    }

    // executeWavesurferLoad
    function executeWavesurferLoad (finalPath, trackdata) {
      RS.Utils.log('>> finalPath', finalPath);
      $('#waveform').css('visibility', 'hidden');

      wavesurferObject.load(finalPath);

    }

    // populatePlaylist
    _self.populatePlaylist();

    if (!source) {
      return;
    }
    // if (source.source === 'file') {
    //   var filestat = fs.statSync(source.url);
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
    _self.updateTrackTime(true);

    // initialise wavesurfer
    _self.ensureWavesurfer();
    var wavesurferObject = _self.wavesurferObject;


    _interpretPlaylistItem(source, function (trackdata) {
      RS.Utils.log('>> _interpretPlaylistItem returned', _.omit(trackdata, 'raw'));

      if (trackdata.source === 'youtube' && !trackdata.playbackUrl) {
        RS.Utils.log('ERR! empty playbackUrl, stopping', _.omit(trackdata, 'raw'));
        $('#waveform-loading').text('ERROR').show();
        return false;
      }
      _self.populateTrackinfo();
      $('#waveform-loading').text('BUFFERING').show();


      updateCurrentTrack(trackdata);

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
    // RS.Utils.log('populatePlaylist', _.map(list, 'url'));

    var markup = MarkupRenderer.renderPartial('playlist', {playlist: list});
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
    RS.Utils.log('populateTrackinfo', JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

    if (currentTrack) {
      markup = MarkupRenderer.renderPartial('trackinfo', {currentTrack: currentTrack});
    }

    container.html(markup);
  },

  bindShortcuts: function bindShortcuts () {
    const _self = this;
    RS.Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea') {
        return;
      }


      // play/pause
      if (e.which === 32) {
        // RS.Utils.log('space hit');
        _self.ensureWavesurfer().playPause();
        return e.preventDefault();
      }



      // track +5s
      if (e.which === 37) {
        // RS.Utils.log('arrow left hit');
        _self.ensureWavesurfer().skipBackward();
        return e.preventDefault();
      }

      // track -5s
      if (e.which === 39) {
        // RS.Utils.log('arrow right hit');
        _self.ensureWavesurfer().skipForward();
        return e.preventDefault();
      }



      // vol up
      if (e.which === 38) {
        // RS.Utils.log('arrow up hit');
        _self.setVolume(_self.volume + 5);
        return e.preventDefault();
      }

      // vol down
      if (e.which === 40) {
        // RS.Utils.log('arrow down hit');
        _self.setVolume(_self.volume - 5);
        return e.preventDefault();
      }



      // prev song
      if (!(e.ctrlKey || e.metaKey) && e.which === 188) {
        // RS.Utils.log('< hit');
        _self.prev();
        return e.preventDefault();
      }

      // next song
      if (!(e.ctrlKey || e.metaKey) && e.which === 190) {
        // RS.Utils.log('> hit');
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
        _self.ensureWavesurfer().skip(offset * (RS.UI.mousewheelMultiplier || 1));
      }
    });

  },

  toggleRepeat: function () {
    var _self = this;
    var initial = PlaylistLib.getRepeat();
    var newVal = !initial;
    PlaylistLib.setRepeat(newVal);
    _self.lightUpToggleRepeat();
    return newVal;
  },
  toggleShuffle: function () {
    var _self = this;
    var initial = PlaylistLib.getShuffle();
    var newVal = !initial;
    PlaylistLib.setShuffle(newVal);
    _self.lightUpToggleShuffle();
    return newVal;
  },


  lightUpToggleRepeat: function () {
    var value = PlaylistLib.getRepeat();

    if (value) {
      $('*[data-toggle=repeat]').addClass('active');
    } else {
      $('*[data-toggle=repeat]').removeClass('active');
    }
  },

  lightUpToggleShuffle:  function () {
    var value = PlaylistLib.getShuffle();

    if (value) {
      $('*[data-toggle=shuffle]').addClass('active');
    } else {
      $('*[data-toggle=shuffle]').removeClass('active');
    }
  }

};

module.exports = Player;
