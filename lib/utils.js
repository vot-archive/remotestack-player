var _ = require('lodash');
var uuid = require('uuid');
var crypto = require('crypto');
var logger = require('./log');

var Utils = {};

Utils.log = logger;

Utils.objectWithoutKeys = function (object, keys) {
  var _self = this;
  if (!keys) {
    _self.log('Keys not provided');
    return;
  }

  if (!Array.isArray(keys)) {
    if (typeof keys === 'string') {
      keys = [keys];
    } else {
      _self.log('Unsupported type of key provided:', typeof key, key);
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



function appendLeadZeroes (num, positions) {
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

function formatSecondsAsTime (sec) {
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
  if (days) rtn += appendLeadZeroes(days) + ':';
  if (hours) rtn += appendLeadZeroes(hours, 2) + ':';
  rtn += appendLeadZeroes(minutes, 2) + ':';
  rtn += appendLeadZeroes(seconds, 2) + '';

  return rtn;
}

Utils.trailingZero = appendLeadZeroes;
Utils.formatSecondsAsTime = formatSecondsAsTime;

module.exports = Utils;
