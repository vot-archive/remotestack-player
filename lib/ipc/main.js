'use strict';

const _ = require('lodash');
const electron = require('electron');
const WindowManager = require('../window/manager');
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
  const player = _.get(WindowManager.instances, 'player', {}).webContents;
  if (player) {
    player.executeJavaScript('RS.UI.resolveUIPreferences()', true);
  }
  // player.reload();
});

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('add-to-playlist', function ipcAddToPlaylist(context, data) {
  console.log('[IPC Event received]', 'add-to-playlist', data);

  if (!Array.isArray(data)) {
    data = [data];
  }
  _.each(data, function (entry) {
    Playlist.add(entry);
  });
  // Playlist.add(data);

  const notification = data.length > 1 ? data.length + ' tracks added' : 'Track added';

  const player = WindowManager.instances.player.webContents;
  const add = WindowManager.instances.add;

  if (player) {
    player.executeJavaScript('RS.PlayerWindow.populatePlaylist()', true);
    player.executeJavaScript('RS.displayNotification("' + notification + '");', true);
  }

  add.close();
});
