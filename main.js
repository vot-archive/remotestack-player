'use strict';

const electron = require('electron');
const app = electron.app;

// set custom user data location
var appDataPath = app.getPath('appData');
var newUserDataPath = appDataPath + '/RemoteStack/Player';

app.setPath('userData', newUserDataPath);
// process.env.userData = newUserDataPath;
// global.userDataDir = newUserDataPath;
// global.getGlobal('userDataDir')

// const GlobalShortcuts = require('./lib/globalShortcuts');
const WindowManager = require('./lib/windowManager');
const StreamManager = require('./lib/streamManager');
const Utils = require('./lib/utils');

function initialise () {
  // Utils.log.rotatelog();
  var welcomeBlock = [
    '\x1b[33m',
    '#####################################',
    '######## REMOTESTACK STARTED ########',
    '#####################################',
    '\x1b[0m'
  ];
  Utils.log(welcomeBlock.join('\n'));
  Utils.log('userdata:', app.getPath('userData'));

  WindowManager.ensure('main', {template: 'main', windowOpts: WindowManager.presets.main});
  // GlobalShortcuts.registerAll();

  // register IPC listeners
  // require('./lib/ipcListeners');
}



function preQuitRoutine () {
  Utils.log('preQuitRoutine');
  Object.keys(WindowManager.instances).map(function (i) {
    WindowManager.instances[i].hide();
    // WindowManager.instances.player.setClosable(true);
    // WindowManager.instances.player.close();

    // WindowManager.instances[i].close();
    // WindowManager.instances[i].destroy();
    // WindowManager.instances[i] = null;
  });

  // GlobalShortcuts.unregisterAll();
  app.quit();
}



// Quit when all WindowManager are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', preQuitRoutine);

// This method will be called when Electron has finished
app.on('ready', initialise);

app.on('activate', function () {
  // Utils.log('app.activate emitted - application brought back from taskbar', this should probably ensure the main window exists and give it focus');
  WindowManager.ensure('main', {template: 'main', windowOpts: WindowManager.presets.main});
  WindowManager.instances['main'].show();
});
