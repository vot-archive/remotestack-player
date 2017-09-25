const electron = require('electron');
const ipcMain = electron.ipcMain;
const WindowManager = require('../../windowManager');

/**
 * Register IPC listeners
 * Process: main
 * Channel: show-window
 */
ipcMain.on('show-window', function (context, data) {
  console.log('IPC received for ', data)
  WindowManager.create(data);
  WindowManager.instances[data].show();
});
