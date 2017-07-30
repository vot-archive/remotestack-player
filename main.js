'use strict';

const electron = require('electron');
const app = electron.app;

// set custom user data location
// var appDataPath = app.getPath('appData');
// var newUserDataPath = appDataPath + '/RemoteStackPlayer';
// app.setPath('userData', newUserDataPath);

// const GlobalShortcuts = require('./lib/globalShortcuts');
const WindowManager = require('./lib/windowManager');
const Utils = require('./lib/utils');

function start () {
  // Utils.log.rotatelog();
  Utils.log('userdata:', app.getPath('userData'));
  // GlobalShortcuts.registerAll();

  WindowManager.create('main');
  require('./lib/ipc/listeners/main');
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

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', preQuitRoutine);
app.on('ready', start);

app.on('activate', function () {
  // app brought back from taskbar: ensure the main window exists and give it focus
  WindowManager.create('main').show();
});
