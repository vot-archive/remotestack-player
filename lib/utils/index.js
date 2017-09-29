'use strict';

const Utils = {};

Utils.log = require('../electron/log');

Utils.md5 = require('./gen-md5');
Utils.uuid = require('./gen-uuid');

Utils.formatFileSize = require('./str-formatFileSize');
Utils.formatSecondsAsTime = require('./str-formatSecondsAsTime');

module.exports = Utils;
