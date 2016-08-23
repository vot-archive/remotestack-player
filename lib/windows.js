'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const _ = require('lodash');
const Utils = require('./utils');

var _debug = true;

var instances = {
  // default: 'main',
  // main: {},
  // background: [],
  // players: []
};

var presets = {
  main: {width: 620, height: 440, minWidth: 360, minHeight: 150, custom: {showOnReady: true}},
  player: {width: 300, height: 55, minWidth: 300, minHeight: 55, show: false, frame: false, closable: true, resizable: true, focusable: false, x: 1040, y: 700, custom: {kamikaze: true}}
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
    instances[name] = null;
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
