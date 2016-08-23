var _ = require('lodash');

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
}


module.exports = Utils;
