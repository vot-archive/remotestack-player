var _ = require('lodash');
var uuid = require('uuid');
var crypto = require('crypto');

var Utils = {};

Utils.objectWithoutKeys = function (object, keys) {
  if (!keys) {
    console.log('Keys not provided');
    return;
  }

  if (!Array.isArray(keys)) {
    if (typeof keys === 'string') {
      keys = [keys];
    } else {
      console.log('Unsupported type of key provided:', typeof key, key);
      return;
    }
  }

  var obj = _.cloneDeep(object);
  _.each(keys, function (key) {
    delete obj[key];
  });
  return obj;
};

Utils.createUUID = function () {
  return uuid.v4();
};

Utils.md5 = function (input) {
  return crypto.createHash('md5').update(input).digest('hex');
  // return input.replace(/[^a-z0-9]/gi,'');
}



module.exports = Utils;
