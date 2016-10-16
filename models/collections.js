var BaseModelJSON = require('./BaseModelJSON');
var CollectionsModel;

var dataRoot = process.env.userData;
var filename = dataRoot + '/Collections.json';

console.log('CollectionsModel storing at ' + filename);

if (!CollectionsModel) {
  CollectionsModel = new BaseModelJSON(filename);
}

// CollectionsModel.set('testentry', 'testval');
// console.log('CollectionsModel get: ', CollectionsModel.get());

module.exports = CollectionsModel;
