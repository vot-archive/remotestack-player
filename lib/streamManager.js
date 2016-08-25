'use strict';

const _ = require('lodash');

const Utils = require('./utils');
const WindowManager = require('./windowManager');

var _debug = true;

var streams = [];

var presets = {
  audio: {},
  video: {custom: {showOnReady: true}}
};

/** Streams are basically background windows with miniplayers
 * that can be attached to them. They are primarily designed to control
 * background audio but should work equally well for video streams.
 *
 * A little extra hassle in order to seamlessly transfer video between windows
 * is expected. Maybe visual streams should have visible background windows?
 */

// create function
function create (type, name, opts) {
  var id = Utils.createUUID();
  WindowManager.create('stream-' + id, {template: 'player', windowOpts: WindowManager.presets.stream})

  var stream = {
    id: id,
    window: WindowManager.instances['stream-' + id],
    playlist: []
  }
  Utils.log('Created a stream', id)
  streams.push(stream);
}

function find (query) {
  if (typeof query !== 'object') {
    query = {};
  }
  return _.find(streams, query);
}


module.exports = {
  streams: streams,
  // presets: presets,
  create: create,
  find: find
}
