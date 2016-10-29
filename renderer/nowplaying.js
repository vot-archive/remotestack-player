var _ = require('lodash');
var Utils = require('rs-base/utils');
var Playlist = require('../lib/playlist');
var PlaylistsModel = require('../models/playlists');
var renderer = require('./render');

var NowPlaying = {
  // get playlist entries and load them into the appropriate container
  populatePlaylist: function populatePlaylist () {
    var _self = this;
    PlaylistsModel.removeAllListeners('default.playlist');
    var list = Playlist.get();
    Utils.log('populatePlaylist', _.map(list, 'url'));


    var markup = '';
    if (Array.isArray(list)) {
      markup = renderer.renderPartial('playlist', {playlist: list});
    }
    if (markup === '') {
      markup = '<p class="padding-10 small text-center well subtle"><strong>Tip:</strong><br> To add files from your disk simply drag them onto the&nbsp;player&nbsp;window.</p>'
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
    var activeIndex = Playlist.getActive();
    var playlist = Playlist.get();
    var currentTrack = playlist[activeIndex];
    var markup = '';
    Utils.log('populateTrackinfo', JSON.stringify(_.omit(currentTrack, 'raw'), null, 2));

    if (currentTrack) {
      markup = renderer.renderPartial('trackinfo', {currentTrack: currentTrack});
    }

    container.html(markup);
  }

}

module.exports = NowPlaying;
