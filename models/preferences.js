var BaseModelJSON = require('./BaseModelJSON');
var PreferencesModel;

var dataRoot = process.env.userData;
var filename = dataRoot + '/Preferences.json';

console.log('PreferencesModel storing at ' + filename);

if (!PreferencesModel) {
  PreferencesModel = new BaseModelJSON(filename);
}

// PreferencesModel.set('testentry', 'testval');
// console.log('PreferencesModel get: ', PreferencesModel.get());

module.exports = PreferencesModel;
