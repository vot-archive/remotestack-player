'use strict';

const BaseModelJSON = require('../lib/electron/BaseModelJSON');
let PreferencesModel;

// let dataRoot = process.env.userData;
const electron = require('electron');
const app = electron.app || electron.remote.app;
const dataRoot = app.getPath('userData');
const filename = dataRoot + '/Preferences.json';

console.log('PreferencesModel storing at ' + filename);

if (!PreferencesModel) {
  PreferencesModel = new BaseModelJSON(filename);
}

// PreferencesModel.set('testentry', 'testval');
// console.log('PreferencesModel get: ', PreferencesModel.get());

module.exports = PreferencesModel;
