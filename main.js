'use strict';

const electron = require('electron');
const app = electron.app;

const WindowManager = require('./lib/windowManager');
const Utils = require('./lib/utils');

function start () {
  Utils.log('userdata:', app.getPath('userData'));

  WindowManager.create('main');
  require('./lib/ipc/listeners/main');
}

function preQuitRoutine () {
  Utils.log('preQuitRoutine');
  Object.keys(WindowManager.instances).map(function (i) {
    WindowManager.instances[i].hide();
  });

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
