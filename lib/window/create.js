'use strict';

const _ = require('lodash');
const path = require('path');
const electron = require('electron');

const Utils = require('../utils');
const PreferencesModel = require('../../models/preferences');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

function createWindow(name, data) {
  const windowOpts = data.opts;

  if (process.platform === 'windows') {
    windowOpts.icon = path.join(__dirname, '../../views/icons/player.ico');
  }
  if (process.platform === 'linux') {
    windowOpts.icon = path.join(__dirname, '../../views/icons/player-256.png');
  }
  if (process.platform === 'darwin') {
    windowOpts.icon = path.join(__dirname, '../../views/icons/player.icns');
  }

  // create
  let thisWindow = new BrowserWindow(windowOpts);
  thisWindow.loadURL(path.join('file://', __dirname, '/../../views/', data.template + '.html'));
  Utils.log('Created window "' + name + '":', JSON.stringify(_.omitBy(windowOpts, 'icon'), null, 0));

  thisWindow.once('ready-to-show', () => {
    // resize back to last dimensions
    const oldPosition = PreferencesModel.get('settings.ui.windows.' + name + '.position');
    const oldSize = PreferencesModel.get('settings.ui.windows.' + name + '.size');
    // console.log('ready to show pos size', oldPosition, oldSize);

    // enforce minimum height to make player easier to find
    if (oldSize && oldSize.length && oldSize[1] < 128) {
      oldSize[1] = 128;
    }

    if (oldPosition && oldPosition[0] && oldPosition[1]) {
      thisWindow.setPosition(oldPosition[0], oldPosition[1]);
    }
    if (oldSize && oldSize[0] && oldSize[1]) {
      thisWindow.setSize(oldSize[0], oldSize[1]);
    }
    if (windowOpts.showOnReady) {
      thisWindow.show();
      Utils.log('Autoshowing window "' + name + '"');
    }
  });

  if (windowOpts.quitOnClose) {
    thisWindow.on('closed', () => {
      Utils.log('Closing "' + name + '" kamikaze window - shutting down the app');
      thisWindow = null;
      app.quit();
    });
  }


  // remember window size
  thisWindow.on('resize', () => {
    const oldSize = thisWindow.getSize();
    if (oldSize) PreferencesModel.set('settings.ui.windows.' + name + '.size', oldSize);
  });

  // remember window position
  thisWindow.on('move', () => {
    const oldPosition = thisWindow.getPosition();
    if (oldPosition) PreferencesModel.set('settings.ui.windows.' + name + '.position', oldPosition);
  });

  thisWindow.on('focus', () => {
    const windowMenu = require('./menu');
    windowMenu.set(windowOpts.menu);
  });

  return thisWindow;
}

module.exports = createWindow;
