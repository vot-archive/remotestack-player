'use strict';

const _ = require('lodash');
const electron = require('electron');
const PreferencesModel = require('../models/preferences');
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
  main: {width: 300, height: 140, minWidth: 250, minHeight: /*110*/35, frame: false, custom: {showOnReady: true}},
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
  Utils.log('Created window "' + name + '":', JSON.stringify(Utils.objectWithoutKeys(windowOpts, 'icon'), null, 0));


  if (_debug) {
    Utils.log('Registered windows:', Object.keys(instances));
  }
  if (_debug === 'dev') {
    instances[name].webContents.openDevTools();
  }

  instances[name].on('closed', function () {
    instances[name].destroy();
    // instances[name] = null;
    delete instances[name];
    Utils.log('Destroyed window "' + name + '"');
  });


  if (showOnReady) {
    instances[name].once('ready-to-show', function () {
      // resize back to last dimensions
      var oldPosition = PreferencesModel.get('settings.ui.windows.' + name + '.position')
      var oldSize = PreferencesModel.get('settings.ui.windows.' + name + '.size')
      // console.log('ready to show pos size', oldPosition, oldSize);
      if (oldPosition && oldPosition[0] && oldPosition[1]) instances[name].setPosition(oldPosition[0], oldPosition[1]);
      if (oldSize && oldSize[0] && oldSize[1])  instances[name].setSize(oldSize[0], oldSize[1]);
      instances[name].show();

      Utils.log('Autoshowing window "' + name + '"');
    });
  }

  if (isKamikaze) {
    instances[name].on('closed', function () {
      Utils.log('Closing "' + name + '" kamikaze window - shutting down the app');
      instances[name] = null;
      app.quit();
    });
  }


  /** Decorate window object
  *
  */
  instances[name].toggle = function () {
    var isHidden = !instances[name].isVisible();
    Utils.log('Toggling window "' + name + '": ' + (isHidden ? 'show' : 'hide'));
    if (isHidden) {
      instances[name].show();
    } else {
      instances[name].hide();
    }
  }


  // if (name === 'main') {
  //   instances.main.on('close', function (e) {
  //     Utils.log('Hiding main window rather than closing it.');
  //     instances.main.hide();
  //     return e.preventDefault();
  //   })
  // }

  instances[name].on('resize',  function () {
    var oldSize = instances[name].getSize();
    if (oldSize) PreferencesModel.set('settings.ui.windows.' + name + '.size', oldSize);
  });

  instances[name].on('move',  function () {
    var oldPosition = instances[name].getPosition();
    if (oldPosition) PreferencesModel.set('settings.ui.windows.' + name + '.position', oldPosition);
  });

  instances[name].uuid = Utils.createUUID();


  const windowMenu = require('../renderer/lib/windowMenu');
  Utils.log(Object.keys(windowMenu))

  windowMenu.intialise();
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
