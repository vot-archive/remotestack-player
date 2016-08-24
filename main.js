'use strict';

const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;

// const GlobalShortcuts = require('./lib/globalShortcuts');
const WindowManager = require('./lib/windowManager');
const StreamManager = require('./lib/streamManager');

function initialise () {
  WindowManager.ensure('main', {template: 'main', windowOpts: WindowManager.presets.main});
  // GlobalShortcuts.registerAll();
}

function preQuitRoutine () {
  console.log('preQuitRoutine');
  Object.keys(WindowManager.instances).map(function (i) {
    WindowManager.instances[i].hide();
    // WindowManager.instances[i].destroy();
    // WindowManager.instances[i].destroy();
    // WindowManager.instances[i] = null;
  });
  // if (WindowManager.instances.player) {
  //   // WindowManager.instances.player.setClosable(true);
  //   WindowManager.instances.player.close();
  // }
  //
  // if (WindowManager.instances.main) {
  //   WindowManager.instances.main.close();
  // }
  // GlobalShortcuts.unregisterAll();
  app.quit();
}

// register Ipc handlers
ipcMain.on('toggle-player', function () {
  WindowManager.ensure('player', {template: 'player', windowOpts: WindowManager.presets.player});
  WindowManager.instances.player.toggle();

  // test stream mgmt
  // StreamManager.create('audio');
  // console.log(StreamManager.streams);

});


// Quit when all WindowManager are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', preQuitRoutine);

// This method will be called when Electron has finished
app.on('ready', initialise);

// app.on('activate', function () {
//   console.log('app.activate emitted - application brought back from taskbar');
//   console.log('this should probably ensure the main window exists and give it focus');
// });
