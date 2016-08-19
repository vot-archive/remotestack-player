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

var Player = {
  // state
  queue: [
    {
      'artist': 'Vot',
      'title': 'Infused (demo 1.41)',
      'url': 'http://siliconfen.co/v/mp3/Infused-1.41.mp3'
    },
    {
      'artist': 'Vot',
      'title': 'Forget me now (6.8.11b)',
      'url': 'http://siliconfen.co/v/mp3/Forget%20me%20now-6.8.11b.mp3'
    },
    {
      'artist': 'Vot',
      'title': 'Death and Despair',
      'url': 'http://siliconfen.co/v/mp3/2016-03-23_death-and-despair-1.mp3'
    }
  ],

  volume: 100,
  loopOne: false,
  loopAll: false,
  playing: false,


  // methods
  getElement: function () {
    return $('#rsPlayerAudioContainer audio')[0];
  },

  play: function (state) {
    var _self = this;
    var audioTag = _self.getElement();
    if (!audioTag) {
      alert('No audio element present')
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
      return;
    }
    var _self = this;
    var audioTag = _self.getElement();

    _self.volume = vol;
    audioTag.volume = vol / 100;
  },

  updateTrackTime: function (track) {
    var currTimeDiv = $('.timeElapsed');
    var durationDiv = $('.timeTotal');

    var currTime = Math.floor(track.currentTime).toString();
    var duration = Math.floor(track.duration).toString();

    currTimeDiv.text(_formatSecondsAsTime(currTime));
    durationDiv.text(_formatSecondsAsTime(duration));
  },

  load: function (track) {
    var _self = this;
    var audioTag = _self.getElement();
    if (audioTag) {
      audioTag.remove();
    }

    var newEntry = '<audio preload="true" ontimeupdate="Player.updateTrackTime(this)">';
    newEntry += '<source src="' + track.url + '" type="audio/mpeg">';
    newEntry += '</audio>';


    $('#rsPlayerAudioContainer').append(newEntry);
    $('#currentArtist').text(track.artist);
    $('#currentTitle').text(track.title);

    _self.setVolume(_self.volume);
    _self.updateTrackTime(_self.getElement());
  }
};

module.exports = Player;
