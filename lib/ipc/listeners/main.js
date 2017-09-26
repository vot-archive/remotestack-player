const electron = require('electron');
const ipcMain = electron.ipcMain;
const WindowManager = require('../../windowManager');
var PreferencesModel = require('../../../models/preferences');
var Playlist = require('../../../lib/playlist');

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

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('add-to-playlist', function (context, data) {
  console.log('[IPC Event received]', 'add-to-playlist', data);

  Playlist.add(data);

  var notification = data.length > 1? data.length + ' tracks added' : 'Track added';

  var player = WindowManager.instances.player.webContents;
  player.executeJavaScript('RS.Player.populatePlaylist()', true);
  player.executeJavaScript('RS.displayNotification("' + notification + '");', true);

  var add = WindowManager.instances.add;
  add.close();
});
