'use strict';

const PlaylistsModel = require('../models/playlists');
const _ = require('lodash');
const Utils = require('./utils');

const initialPlaylist = [];
const STREAMNAME = 'default';

Utils.log('playlist.js:getSettingsFilePath', PlaylistsModel.getLocation());

const Playlist = {
  /**
   * Gets the full playlist object
   * TODO allow for stream switching
   */
  get: function get() {
    // Utils.log('playlist.js:getSettingsFilePath', PlaylistsModel.getLocation());
    let pls = PlaylistsModel.get(STREAMNAME + '.playlist');
    // stream = stream || '0';
    if (!pls) {
      Utils.log('\x1b[31m>>>>\x1b[0m', 'No playlist found, replacing with file contents');
      this.save(initialPlaylist);
      pls = initialPlaylist;
    } else {
      // Utils.log('\x1b[32m>>>>\x1b[0m', 'Playlist found');
      // Utils.log(_.map(pls, 'url'));
    }
    return _.compact(pls);
  },

  /**
   * Update playlist entry
   * update({id: 'ffff0000', {title: 'Test entry'}})
   */
  update: function update(queryWhere, querySet) {
    // Utils.log('playlist.js:update \n\nwhere:', queryWhere, '\n\nset:', querySet,'\n\n');
    const pls = this.get();
    const index = _.findIndex(pls, queryWhere);
    if (pls[index]) {
      pls[index] = _.merge({}, pls[index], querySet);
      return this.save(pls);
    }
  },

  /**
   * Adds a new entry to the playlist
   */
  add: function add(newObject) {
    Utils.log('\x1b[33mplaylist.js:add\x1b[0m', newObject);
    let pls = this.get();
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
  deleteByIndex: function deleteByIndex(index) {
    Utils.log('\x1b[33mplaylist.js:delete\x1b[0m', index);
    const pls = this.get();
    // pls.push(newObject);
    delete pls[index];
    Utils.log('pls', _.map(pls, 'url'));
    this.save(pls);
  },

  /**
   * Saves the playlist array
   * OVERRIDES everything and needs an array provided
   */
  save: function save(fullPlaylist) {
    if (!fullPlaylist || !Array.isArray(fullPlaylist)) {
      Utils.log('Cannot save fullPlaylist', fullPlaylist);
      return null;
    }
    // Utils.log('\x1b[33mplaylist.js:saving\x1b[0m', fullPlaylist);
    return PlaylistsModel.set(STREAMNAME + '.playlist', fullPlaylist);
  },

  // resolveAll: function (stream) {
  //   stream = stream || '0';
  //   let self = this;
  //   let pls = self.get(stream);
  //
  //   // _.each(pls, function (item) {
  //   //   item
  //   // })
  // },

  /**
   * Puts together a playlist entry display string
   */
  getDisplayTitle: function getDisplayTitle(entry) {
    const artist = _.get(entry, 'artist');
    const title = _.get(entry, 'title');
    const fullpath = _.get(entry, 'url', '');
    let displayTitle = '-';

    if (artist && title) {
      displayTitle = artist + ' - ' + title;
    } else if (title) {
      displayTitle = title;
    }

    if (entry && entry.source === 'file') {
      let filename = fullpath.split('/');
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
  getActive: function getActive() {
    const self = this;
    const playlist = self.get();
    let index = _.findIndex(playlist, { active: true });
    Utils.log('found active at ', index + 1);

    Utils.log('playlist length', playlist.length);
    if (index > playlist.length - 1) index = playlist.length - 1;
    if (index < 0) index = 0;
    self.setActive(index);
    return index;
  },

  getNext: function getNext() {
    const self = this;
    const repeat = RS.PlayerWindow.getRepeat();
    const shuffle = RS.PlayerWindow.getShuffle();
    const playlist = self.get();
    const currentIndex = _.findIndex(playlist, { active: true });

    if (shuffle) {
      const random = self.randomTrackIndex();
      if (random === currentIndex) {
        return self.getNext();
      }
      return random;
    }

    let index = currentIndex + 1;

    if (index > playlist.length - 1) {
      if (repeat) {
        Utils.log('Repeat Active - looping playlist');
        index = 0;
      } else {
        return false;
      }
    }

    return index;
  },

  getPrev: function getPrev() {
    const self = this;
    const repeat = RS.PlayerWindow.getRepeat();
    const shuffle = RS.PlayerWindow.getShuffle();
    const playlist = self.get();
    const currentIndex = _.findIndex(playlist, { active: true });

    if (shuffle) {
      const random = self.randomTrackIndex();
      if (random === currentIndex) {
        return self.getPrev();
      }
      return random;
    }

    let index = currentIndex - 1;

    if (index < 0) {
      if (repeat) {
        Utils.log('Repeat Active - looping playlist');
        index = playlist.length - 1;
      } else {
        return false;
      }
    }
    return index;
  },

  /**
   * Sets the active item
   */
  setActive: function setActive(index) {
    const self = this;
    let playlist = self.get();
    // console.trace('setting playlist item ' + index + ' as active');

    const currentIndex = _.findIndex(playlist, { active: true });
    Utils.log('currentIndex', currentIndex);

    if (index === 'next' || index === 'prev' || index === 'active') {
      if (index === 'active') {
        index = currentIndex;
      }
      if (index === 'next') {
        index = self.getNext();
      }
      if (index === 'prev') {
        index = self.getPrev();
      }
    }

    if (index === false) {
      return false;
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

    self.save(playlist);
    return index;
  },

  /**
   * Returns an index of a random track
   */
  randomTrackIndex: function randomTrackIndex() {
    const playlist = this.get();
    if (!playlist.length) {
      return 0;
    }

    const max = playlist.length;
    return Math.floor(Math.random() * max);
  },

  /**
   * Reads the order as represented in the UI
   * Binding to jQuery UI sortable plugin
   */
  readPlaylistOrderFromUI: function readPlaylistOrderFromUI() {
    return $('#nowplaying-playlist').sortable('toArray');
  },

  /**
   * Updates playlist order
   * Takes array of track IDs
   */
  saveSort: function saveSort(newOrder) {
    newOrder = _.compact(newOrder);
    const currentPlaylist = this.get();

    const newList = [];

    _.each(newOrder, function (i) {
      const hit = _.find(currentPlaylist, { id: i });
      if (hit) newList.push(hit);
    });

    this.save(newList);
  },
};

module.exports = Playlist;
module.exports.initialPlaylist = initialPlaylist;
