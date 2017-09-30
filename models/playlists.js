'use strict';

const BaseModelJSON = require('../lib/electron/BaseModelJSON');
let Playlists;

const electron = require('electron');
const app = electron.app || electron.remote.app;
const dataRoot = app.getPath('userData');
const filename = dataRoot + '/Playlists.json';

console.log('Playlists storing at ' + filename);

if (!Playlists) {
  Playlists = new BaseModelJSON(filename);
}

// Playlists.set('testentry', 'testval');
// console.log('Playlists get: ', Playlists.get());

module.exports = Playlists;
