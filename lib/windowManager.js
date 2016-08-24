'use strict';

const _ = require('lodash');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const Utils = require('./utils');

var _debug = true;

var instances = {};
// instances.default = 'main';
// instances.main = {};
// instances.background = [];
// instances.players = [];


var presets = {
  main: {width: 620, height: 440, minWidth: 360, minHeight: 150, custom: {showOnReady: true}},
  player: {width: 300, height: 55, minWidth: 300, minHeight: 55, show: false, frame: false, closable: true, resizable: true, focusable: true, x: 1040, y: 700, custom: {kamikaze: false}},
  stream: {width: 0, height: 0, show: false}
};


// create function
function create (name, opts) {
  if (instances[name]) {
    return;
  }
  var defaultWindowOpts = {
    width: 500,
    height: 400,
    show: true,
    frame: true,
    icon: __dirname + '/views/public/rs.ico'
  };
  var windowOpts = _.merge({}, defaultWindowOpts, opts.windowOpts);

  var showOnReady = _.get(windowOpts, 'custom.showOnReady');
  var isKamikaze = _.get(windowOpts, 'custom.kamikaze');

  if (showOnReady) {
    windowOpts.show = false;
  }

  // create
  instances[name] = new BrowserWindow(windowOpts);
  instances[name].loadURL('file://' + __dirname + '/../views/' + opts.template + '.html');
  console.log('Created window "' + name + '":', JSON.stringify(Utils.objectWithoutKeys(windowOpts, 'icon'), null, 0));


  if (_debug) {
    console.log('Registered windows:', Object.keys(instances));
  }
  if (_debug === 'dev') {
    instances[name].webContents.openDevTools();
  }

  instances[name].on('closed', function () {
    instances[name].destroy();
    // instances[name] = null;
    delete instances[name];
    console.log('Destroyed window "' + name + '"');
  });


  if (showOnReady) {
    instances[name].once('ready-to-show', function () {
      instances[name].show();
      console.log('Autoshowing window "' + name + '"');
    });
  }

  if (isKamikaze) {
    instances[name].on('closed', function () {
      console.log('Closing "' + name + '" kamikaze window - shutting down the app');
      instances[name] = null;
      app.quit();
    });
  }


  /** Decorate window object
  *
  */
  instances[name].toggle = function () {
    var isHidden = !instances[name].isVisible();
    console.log('Toggling window "' + name + '": ' + (isHidden ? 'show' : 'hide'));
    if (isHidden) {
      instances[name].show();
    } else {
      instances[name].hide();
    }
  }

  instances[name].uuid = Utils.createUUID();

}

function ensure (name, opts) {
  if (!instances[name]) {
    create(name, opts);
  }
  return instances[name];
}


module.exports = {
  instances: instances,
  presets: presets,
  create: create,
  ensure: ensure
}
