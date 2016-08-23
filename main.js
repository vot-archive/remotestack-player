'use strict';

const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;

const _ = require('lodash');

const Shortcuts = require('./lib/shortcuts');
const Windows = require('./lib/windows');


function initialise () {
  Windows.ensure('main', {template: 'main', windowOpts: Windows.presets.main});
  Shortcuts.registerAll();
}


// This method will be called when Electron has finished
app.on('ready', initialise);

ipcMain.on('toggle-player', function () {
  Windows.ensure('player', {template: 'player', windowOpts: Windows.presets.player});
  Windows.instances.player.toggle();
});


// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

app.on('will-quit', function () {
  if (Windows.instances.player) {
    Windows.instances.player.setClosable(true);
    Windows.instances.player.close();
  }
  Shortcuts.unregisterAll();
  app.quit();
});

// app.on('activate', function () {
//   Windows.ensure('main', {template: 'main', windowOpts: Windows.presets.main});
//   focus on manager window maybe?
// });
