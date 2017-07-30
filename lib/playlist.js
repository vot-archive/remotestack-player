const PlaylistsModel = require('../models/playlists');
const PreferencesModel = require('../models/preferences');
const _ = require('lodash');
const cache = require('./electron/filecache');
const Utils = require('./utils');

let initialPlaylist = [];
let STREAMNAME = 'default';

Utils.log('playlist.js:getSettingsFilePath', PlaylistsModel.getLocation());

var Playlist = {
  /**
   * Gets the full playlist object
   * TODO allow for stream switching
   */
  get: function get () {
    Utils.log('playlist.js:getSettingsFilePath', PlaylistsModel.getLocation());
    var pls = PlaylistsModel.get(STREAMNAME + '.playlist');
    // stream = stream || '0';
    if (!pls) {
      Utils.log('\x1b[31m>>>>\x1b[0m', 'No playlist found, replacing with file contents');
      this.save(initialPlaylist);
      pls = initialPlaylist;
    } else {
      Utils.log('\x1b[32m>>>>\x1b[0m', 'Playlist found');
      // Utils.log(_.map(pls, 'url'));
    }
    return _.compact(pls);
  },

  /**
   * Update playlist entry
   * update({id: 'ffff0000', {title: 'Test entry'}})
   */
  update: function update (queryWhere, querySet) {
    // Utils.log('playlist.js:update \n\nwhere:', queryWhere, '\n\nset:', querySet,'\n\n');
    var pls = this.get();
    var index = _.findIndex(pls, queryWhere);
    if (pls[index]) {
      pls[index] = _.merge({}, pls[index], querySet);
      return this.save(pls);
    }
  },

  /**
   * Adds a new entry to the playlist
   */
  add: function add (newObject) {
    Utils.log('\x1b[33mplaylist.js:add\x1b[0m', newObject);
    var pls = this.get();
    newObject.id = Utils.uuid();
    pls.push(newObject);
    pls = _.compact(pls);
    Utils.log('pls', _.map(pls, 'url'));
    this.save(pls);
  },

  /**
   * Deletes an item based on its index
   * TODO switch to ID-based deletions
   */
  deleteByIndex: function deleteByIndex (index) {
    Utils.log('\x1b[33mplaylist.js:delete\x1b[0m', index);
    var pls = this.get();
    // pls.push(newObject);
    delete pls[index];
    Utils.log('pls', _.map(pls, 'url'));
    this.save(pls);
  },

  /**
   * Saves the playlist array
   * OVERRIDES everything and needs an array provided
   */
  save: function save (fullPlaylist) {
    if (!fullPlaylist || !Array.isArray(fullPlaylist)) {
      Utils.log('Cannot save fullPlaylist', fullPlaylist);
      return;
    }
    // Utils.log('\x1b[33mplaylist.js:saving\x1b[0m', fullPlaylist);
    return PlaylistsModel.set(STREAMNAME + '.playlist', fullPlaylist);
  },

  // resolveAll: function (stream) {
  //   stream = stream || '0';
  //   var _self = this;
  //   var pls = _self.get(stream);
  //
  //   // _.each(pls, function (item) {
  //   //   item
  //   // })
  // },

  /**
   * Puts together a playlist entry display string
   */
  getDisplayTitle: function getDisplayTitle (entry) {
    var artist = _.get(entry, 'artist');
    var title = _.get(entry, 'title');
    var artist;
    var displayTitle = '-';

    // if (_.get(entry, 'raw.extractor') === 'soundcloud') {
    //   artist = _.get(entry, 'raw.uploader');
    // }
    // var title = _.get(entry, 'raw.fulltitle');
    //
    var fullpath = _.get(entry, 'url', '');

    if (artist && title) {
      displayTitle = artist + ' - ' + title;
    } else if (title) {
      displayTitle = title;
    }

    if (entry && entry.source === 'file') {
      var filename = fullpath.split('/');
      filename = filename[filename.length - 1];
      displayTitle = filename || '[unknown file]';
    }

    // console.log('entry', entry)
    // Utils.log('getDisplayTitle', entry, displayTitle)
    return displayTitle;
  },

  /**
   * Gets index of active item
   */
  getActive: function setActive() {
    var _self = this;
    var playlist = _self.get();
    var index = _.findIndex(playlist, {active: true});
    Utils.log('found active at ', index + 1);

    Utils.log('playlist length', playlist.length);
    if (index > playlist.length -1) index = playlist.length -1;
    if (index < 0) index = 0;
    _self.setActive(index);
    return index;
  },

  /**
   * Sets the active item
   */
  setActive: function setActive(index) {
    var _self = this;
    const REPEAT = _self.getRepeat();
    const SHUFFLE = _self.getShuffle();
    // console.trace('setting playlist item ' + index + ' as active');

    var playlist = _self.get();

    var currentIndex = _.findIndex(playlist, {active: true});
    Utils.log('currentIndex', currentIndex);

    if (index === 'next' || index === 'prev' || index === 'active') {

      if (index === 'active') {
        index = currentIndex;
      }
      if (index === 'next') {
        index = currentIndex + 1;
        if (REPEAT && (index > playlist.length -1)) {
          Utils.log('Repeat Active - looping playlist');
          index = 0;
        }
        if (SHUFFLE) index = _self.randomTrackIndex();
      }
      if (index === 'prev') {
        index = currentIndex - 1;
        if (REPEAT && (index < 0)) {
          Utils.log('Repeat Active - looping playlist');
          index = playlist.length -1;
        }
        if (SHUFFLE) index = _self.randomTrackIndex();
      }

    }
    Utils.log('index', index);

    // boundaries
    if (index < 0) index = 0;
    if (index > playlist.length - 1) index = playlist.length - 1;


    playlist = _.map(playlist, function (i) {
      i.active = false;
      return i;
    });

    if ((index || index === 0) && playlist[index]) {
      playlist[index].active = true;
    }

    _self.save(playlist);
    return index;
  },

  /**
   * Returns an index of a random track
   */
  randomTrackIndex: function randomTrackIndex(){
    var _self = this;
    var playlist = _self.get();
    var total = playlist.length;
    if (!playlist.length) {
      return 0;
    }

    min = 1;
    max = total;
    return Math.floor(Math.random() * (max - min)) + min + 1;

  },

  /**
   * Reads the order as represented in the UI
   * Binding to jQuery UI sortable plugin
   */
  readPlaylistOrderFromUI: function () {
    return $('#nowplaying-playlist').sortable('toArray');
  },

  /**
   * Updates playlist order
   * Takes array of track IDs
   */
  saveSort: function (newOrder) {
    newOrder = _.compact(newOrder);
    var currentPlaylist = this.get();

    var newList = [];

    _.each(newOrder, function (i) {
      var hit = _.find(currentPlaylist, {id: i});
      if (hit) newList.push(hit);
    });

    this.save(newList);
  },

  /**
   * Getters and setters for shuffle and repeat
   */
  setShuffle: function (bool) {
    var newVal = !!bool;
    PreferencesModel.set('playlist.shuffle', newVal);
  },
  getShuffle: function () {
    return PreferencesModel.get('playlist.shuffle') || false;
  },

  setRepeat: function (bool) {
    var newVal = !!bool;
    PreferencesModel.set('playlist.repeat', newVal);
  },
  getRepeat: function () {
    return PreferencesModel.get('playlist.repeat') || false;
  }
};

module.exports = Playlist;
module.exports.initialPlaylist = initialPlaylist;
