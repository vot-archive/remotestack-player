const electron = require('electron');
const ipcMain = electron.ipcMain;
const WindowManager = require('../../windowManager');
var PreferencesModel = require('../../../models/preferences');

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('show-window', function (context, data) {
  console.log('[IPC Event received]', 'show-window', data);
  WindowManager.create(data);
  WindowManager.instances[data].show();
});

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('update-setting', function (context, data) {
  console.log('[IPC Event received]', 'update-setting', data.key, data.value);

  PreferencesModel.set(data.key, data.value);
  var player = WindowManager.instances.player.webContents;
  player.executeJavaScript('RS.UI.resolveUIPreferences()', true);
  // player.reload();
});
