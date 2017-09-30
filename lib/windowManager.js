'use strict';

const _ = require('lodash');
const electron = require('electron');
const PreferencesModel = require('../models/preferences');
const path = require('path');
const Utils = require('./utils');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const developerMode = PreferencesModel.get('app.enableDeveloperMode');
const instances = {};


function windowCreate(name, data) {
  if (instances[name]) {
    return;
  }

  const windowOpts = data.opts;

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
  instances[name].loadURL(path.join('file://', __dirname, '/../views/', data.template + '.html'));
  Utils.log('Created window "' + name + '":', JSON.stringify(_.omitBy(windowOpts, 'icon'), null, 0));

  if (developerMode) {
    Utils.log('Registered windows:', Object.keys(instances));
  }

  instances[name].on('closed', () => {
    instances[name].destroy();
    // instances[name] = null;
    delete instances[name];
    Utils.log('Destroyed window "' + name + '"');
  });

  instances[name].once('ready-to-show', () => {
    // resize back to last dimensions
    const oldPosition = PreferencesModel.get('settings.ui.windows.' + name + '.position');
    const oldSize = PreferencesModel.get('settings.ui.windows.' + name + '.size');
    // console.log('ready to show pos size', oldPosition, oldSize);

    // enforce minimum height to make player easier to find
    if (oldSize && oldSize.length && oldSize[1] < 128) {
      oldSize[1] = 128;
    }

    if (oldPosition && oldPosition[0] && oldPosition[1]) {
      instances[name].setPosition(oldPosition[0], oldPosition[1]);
    }
    if (oldSize && oldSize[0] && oldSize[1]) {
      instances[name].setSize(oldSize[0], oldSize[1]);
    }
    if (windowOpts.showOnReady) {
      instances[name].show();
      Utils.log('Autoshowing window "' + name + '"');
    }
  });

  if (windowOpts.quitOnClose) {
    instances[name].on('closed', () => {
      Utils.log('Closing "' + name + '" kamikaze window - shutting down the app');
      instances[name] = null;
      app.quit();
    });
  }


  // remember window size
  instances[name].on('resize', () => {
    const oldSize = instances[name].getSize();
    if (oldSize) PreferencesModel.set('settings.ui.windows.' + name + '.size', oldSize);
  });

  // remember window position
  instances[name].on('move', () => {
    const oldPosition = instances[name].getPosition();
    if (oldPosition) PreferencesModel.set('settings.ui.windows.' + name + '.position', oldPosition);
  });

  const windowMenu = require('./windowMenu');
  // Utils.log(Object.keys(windowMenu));

  windowMenu.intialise(windowOpts.menu);
}

const definitions = {
  player: {
    template: 'player',
    opts: {
      width: 320,
      height: 420,
      minWidth: 260,
      minHeight: 35,
      frame: false,
      show: false,
      showOnReady: true,
      quitOnClose: true,
      background: 'black',
    },
  },
  add: {
    template: 'add',
    opts: {
      width: 400,
      height: 360,
      minWidth: 320,
      minHeight: 300,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
      menu: { edit: true },
    },
  },
  settings: {
    template: 'settings',
    opts: {
      width: 400,
      height: 360,
      minWidth: 320,
      minHeight: 300,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
    },
  },
  help: {
    template: 'help',
    opts: {
      width: 500,
      height: 600,
      minWidth: 320,
      minHeight: 300,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
    },
  },
};

function show(name) {
  if (!instances[name] && definitions[name]) {
    windowCreate(name, definitions[name]);
  }
  instances[name].focus();
}


module.exports = {
  instances,
  show,
};
