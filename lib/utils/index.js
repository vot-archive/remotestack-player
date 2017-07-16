var Utils = {};

Utils.log = require('../electron/log');

Utils.md5 = require('./gen-md5');
Utils.mongoid = require('./gen-mongoid');
Utils.uuid = require('./gen-uuid');

Utils.formatFileSize = require('./str-formatFileSize');
Utils.formatSecondsAsTime = require('./str-formatSecondsAsTime');

module.exports = Utils;
