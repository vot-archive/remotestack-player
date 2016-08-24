const ytdl = require('../lib/parsers/ytdl');
const cache = require('../lib/cache');

function _trailingZero (num, positions) {
  if (!num) {
    num = 0;
  }
  num = num.toString();
  var rtn = num;
  var iterations = positions - num.length;

  if (iterations > 0) {
    for (i = 0; i < iterations; i++) {
      rtn = '0' + rtn;
    }
  }

  return rtn;
}

function _formatSecondsAsTime (sec) {
  var s = parseInt(sec);

  var multipliers = {
    d: 60 * 60 * 24,
    h: 60 * 60,
    m: 60
  };

  var remainder = s;

  var days = Math.floor(remainder / multipliers.d);
  if (days) remainder -= (days * multipliers.d);

  var hours = Math.floor(remainder / multipliers.h)
  if (hours) remainder -= (hours * multipliers.h);

  var minutes = Math.floor(remainder / multipliers.m)
  if (minutes) remainder -= (minutes * multipliers.m);

  var seconds = remainder;

  var rtn = '';
  if (days) rtn += _trailingZero(days) + ':';
  if (hours) rtn += _trailingZero(hours, 2) + ':';
  rtn += _trailingZero(minutes, 2) + ':';
  rtn += _trailingZero(seconds, 2) + '';

  return rtn;
}

function _interpretPlaylistItem (item, cb) {
  var cached = cache.persistent.getJSON('meta-resolved', item.url);
  if (cached) {
    return cb(cached);
  }
  item.playbackUrl = item.url;

  if (item.source === 'youtube') {
    return ytdl(item.url, function (err, info) {
      console.log(info);
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
    return
  })
}

var _playlist = [
  {
    'url': 'http://siliconfen.co/v/mp3/Infused-1.41.mp3',
    'source': 'http',
    'type': 'audio'
  },
  {
    'url': 'http://siliconfen.co/v/mp3/Forget%20me%20now-6.8.11b.mp3',
    'source': 'http',
    'type': 'audio'
  },
  {
    'url': 'https://www.youtube.com/watch?v=DZGINaRUEkU',
    'source': 'youtube',
    'type': 'audio'
  }
];

var Player = {
  // state
  queue: _playlist,

  volume: 100,
  loopOne: false,
  loopAll: false,
  playing: false,


  // methods
  getElement: function () {
    return $('#rsPlayerAudioContainer audio')[0];
  },

  play: function (state) {
    console.log('play(' + state + ')');
    var _self = this;
    var audioTag = _self.getElement();
    if (!audioTag) {
      console.log('No audio element present');
      return;
    }

    // state = state || audioTag.paused || true;
    console.log('state:', state)

    if (typeof state !== 'boolean') {
      console.log('audioTag.paused:', audioTag.paused)
      state = audioTag.paused || false;
    }

    if (state) {
      console.log('Playing');
      audioTag.play();
      _self.setPlayButton(false);
    } else {
      console.log('Pausing');
      audioTag.pause();
      _self.setPlayButton(true);
    }

    _self.updatePositionMax(_self.getElement());
  },

  prev: function () {
    var prevTrack = this.queue.pop();
    this.queue.unshift(prevTrack); // add track to the end of queue

    // var audioTag = this.getElement();
    // var playState = audioTag ? !audioTag.paused : false;

    this.load(prevTrack);
    // this.play(playState);
  },

  next: function () {
    var nextTrack = this.queue.shift();
    this.queue.push(nextTrack); // add track to the end of queue

    var audioTag = this.getElement();
    var playState = audioTag ? !audioTag.paused : false;

    this.load(nextTrack);
    this.play(playState);
  },

  setPlayButton: function (state) {
    $('.fa.fa-play, .fa.fa-pause').removeClass('fa-play fa-pause').addClass('fa-' + (state ? 'play' : 'pause'));
  },

  setVolume: function (vol) {
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

    this.volume = vol;
    this.applyVolumeSetting();
  },

  applyVolumeSetting: function () {
    var audioTag = this.getElement();
    // console.log('setting volume to', this.volume)

    audioTag.volume = this.volume / 100;
  },

  setPosition: function (sec) {
    var audioTag = this.getElement();

    if (typeof sec !== 'number') {
      if (typeof sec === 'object') {
        var obj = $(sec);
        var objVal = obj.val();
        if (obj && objVal) {
          sec = objVal;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    // console.log('jumping to', sec)
    audioTag.currentTime = sec;
  },

  updatePositionMax: function () {
    var audioTag = this.getElement();

    var positionInput = $('#rsPlayerPosition');
    positionInput.attr('max', Math.floor(audioTag.duration));
  },

  updateTrackTime: function (track) {
    var currTimeDiv = $('.timeElapsed');
    var durationDiv = $('.timeTotal');

    var currTime = Math.floor(track.currentTime).toString();
    var duration = Math.floor(track.duration).toString();

    currTimeDiv.text(_formatSecondsAsTime(currTime));
    durationDiv.text(_formatSecondsAsTime(duration));

    // update current position on the range element
    var positionInput = $('#rsPlayerPosition');
    positionInput.val(Math.floor(currTime));
  },

  load: function (source) {
    var _self = this;
    var audioTag = _self.getElement();
    if (audioTag) {
      audioTag.remove();
    }

    $('#currentArtist').text('Loading');
    $('#currentTitle').text(source.url);

    _interpretPlaylistItem(source, function (track) {
      console.log(track);
      cache.persistent.getFile(track.playbackUrl, function (filepath) {
        var finalPath = filepath || track.playbackUrl;

        // if (!finalPath) {
        //   return;
        // }

        var newEntry = '<audio preload="true" ontimeupdate="Player.updateTrackTime(this)">';
        // newEntry += '<source src="' + track.url + '" type="audio/mpeg">';
        newEntry += '<source src="' + finalPath + '" type="audio/mpeg">';
        newEntry += '</audio>';

        $('#rsPlayerAudioContainer').append(newEntry);

        $('#currentArtist').text(track.artist);
        $('#currentTitle').text(track.title);

        _self.setVolume(_self.volume);
        _self.updateTrackTime(_self.getElement());

      })
    });

  }
};

module.exports = Player;
