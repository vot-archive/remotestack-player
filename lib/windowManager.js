'use strict';

const _ = require('lodash');
const electron = require('electron');
const PreferencesModel = require('../models/preferences');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const Utils = require('./utils');

var _envDebug = process.env.RS_DEBUG;
var instances = {};

// internal _create function
function _create (name, data) {
  if (instances[name]) {
    return;
  }

  var defaultOpts = {
    width: 500,
    height: 400,
    show: false,
    showOnReady: false,
    frame: true,
    background: 'black'
  };

  var windowOpts = _.merge({}, defaultOpts, data.opts);

  if (process.platform === 'windows') {
    windowOpts.icon = path.join(__dirname, '../views/icons/player.ico');
  }
  if (process.platform === 'linux') {
    windowOpts.icon = path.join(__dirname, '../views/icons/player-256.png');
  }
  if (process.platform === 'darwin') {
    windowOpts.icon = path.join(__dirname, '../views/icons/player.icns');
  }

  // create
  instances[name] = new BrowserWindow(windowOpts);
  instances[name].loadURL('file://' + __dirname + '/../views/' + data.template + '.html');
  Utils.log('Created window "' + name + '":', JSON.stringify(_.omitBy(windowOpts, 'icon'), null, 0));

  if (_envDebug) {
    Utils.log('Registered windows:', Object.keys(instances));
  }

  instances[name].on('closed', function () {
    instances[name].destroy();
    // instances[name] = null;
    delete instances[name];
    Utils.log('Destroyed window "' + name + '"');
  });

  instances[name].once('ready-to-show', function () {
    // resize back to last dimensions
    var oldPosition = PreferencesModel.get('settings.ui.windows.' + name + '.position');
    var oldSize = PreferencesModel.get('settings.ui.windows.' + name + '.size');
    // console.log('ready to show pos size', oldPosition, oldSize);

    // enforce minimum height to make player easier to find
    if (oldSize && oldSize.length && oldSize[1] < 128) {
      oldSize[1] = 128;
    }

    if (oldPosition && oldPosition[0] && oldPosition[1]) instances[name].setPosition(oldPosition[0], oldPosition[1]);
    if (oldSize && oldSize[0] && oldSize[1])  instances[name].setSize(oldSize[0], oldSize[1]);
    if (windowOpts.showOnReady) {
      instances[name].show();
      Utils.log('Autoshowing window "' + name + '"');
    }
  });

  if (windowOpts.quitOnClose) {
    instances[name].on('closed', function () {
      Utils.log('Closing "' + name + '" kamikaze window - shutting down the app');
      instances[name] = null;
      app.quit();
    });
  }


  // remember window size
  instances[name].on('resize',  function () {
    var oldSize = instances[name].getSize();
    if (oldSize) PreferencesModel.set('settings.ui.windows.' + name + '.size', oldSize);
  });

  // remember window position
  instances[name].on('move',  function () {
    var oldPosition = instances[name].getPosition();
    if (oldPosition) PreferencesModel.set('settings.ui.windows.' + name + '.position', oldPosition);
  });

  const windowMenu = require('./windowMenu');
  // Utils.log(Object.keys(windowMenu));

  windowMenu.intialise();
}

var presets = {
  main: {
    template: 'main',
    opts: {width: 320, height: 420, minWidth: 260, minHeight: 35, frame: false, show:false, showOnReady: true, quitOnClose: true}
  },
  add: {
    template: 'add',
    opts: {width: 320, height: 300, minWidth: 320, minHeight: 300, show: false}
  },
  settings: {
    template: 'settings',
    opts: {width: 400, height: 300, minWidth: 320, minHeight: 300, show: false}
  },
  help: {
    template: 'help',
    opts: {width: 500, height: 600, minWidth: 320, minHeight: 300, show: false}
  }
};

function create (name) {
  if (!instances[name]) {
    if (presets[name]) {
      _create(name, presets[name]);
    }
  }
  return instances[name];
}


module.exports = {
  instances: instances,
  create: create
};
