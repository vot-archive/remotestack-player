'use strict';

const electron = require('electron');
const WindowManager = require('../windowManager');
const PreferencesModel = require('../../models/preferences');
const Playlist = require('../../lib/playlist');
const ipcMain = electron.ipcMain;

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('show-window', function ipcShowWindow(context, data) {
  console.log('[IPC Event received]', 'show-window', data);
  WindowManager.show(data);
  // WindowManager.instances[data].show();
});

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('update-setting', function ipcUpdateSetting(context, data) {
  console.log('[IPC Event received]', 'update-setting', data.key, data.value);

  PreferencesModel.set(data.key, data.value);
  const player = WindowManager.instances.player.webContents;
  player.executeJavaScript('RS.UI.resolveUIPreferences()', true);
  // player.reload();
});

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('add-to-playlist', function ipcAddToPlaylist(context, data) {
  console.log('[IPC Event received]', 'add-to-playlist', data);

  Playlist.add(data);

  const notification = data.length > 1 ? data.length + ' tracks added' : 'Track added';

  const player = WindowManager.instances.player.webContents;
  const add = WindowManager.instances.add;

  player.executeJavaScript('RS.PlayerWindow.populatePlaylist()', true);
  player.executeJavaScript('RS.displayNotification("' + notification + '");', true);

  add.close();
});
