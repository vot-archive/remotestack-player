'use strict';

const PreferencesModel = require('../../models/preferences');
const developerMode = PreferencesModel.get('app.enableDeveloperMode');

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
      menu: { windowGroup: true, devGroup: developerMode },
    },
  },
  add: {
    template: 'add',
    opts: {
      width: 400,
      height: 300,
      minWidth: 340,
      minHeight: 280,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
      menu: { editGroup: true, devGroup: developerMode, escToClose: true },
    },
  },
  settings: {
    template: 'settings',
    opts: {
      width: 400,
      height: 300,
      minWidth: 340,
      minHeight: 280,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
      menu: { devGroup: developerMode, escToClose: true },
    },
  },
  help: {
    template: 'help',
    opts: {
      width: 560,
      height: 640,
      minWidth: 450,
      minHeight: 380,
      show: false,
      showOnReady: true,
      frame: true,
      background: 'black',
      menu: { devGroup: developerMode, escToClose: true },
    },
  },
};

module.exports = definitions;
