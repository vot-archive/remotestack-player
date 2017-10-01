'use strict';

const electron = require('electron');
const app = electron.app;

const WindowManager = require('./lib/windowManager');
const Utils = require('./lib/utils');

Utils.log.clearlog();

function start() {
  Utils.log('userdata:', app.getPath('userData'));

  WindowManager.show('player');
  require('./lib/ipc/main');
}

function preQuitRoutine() {
  Object.keys(WindowManager.instances).map(function (i) {
    if (WindowManager.instances[i] && WindowManager.instances[i].close) {
      WindowManager.instances[i].close();
    }
    return null;
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
  WindowManager.show('player');
});
