const electron = require('electron');
const ipcMain = electron.ipcMain;
const WindowManager = require('../../windowManager');

/**
* Register IPC listeners
* Process: main
* Channel: window.show
*/
ipcMain.on('window.create', function (data) {
  WindowManager.create(data.window);
});

/**
* Register IPC listeners
* Process: main
* Channel: window.show
*/
ipcMain.on('window.close', function (data) {
  WindowManager.close(data.window);
});

/**
 * Register IPC listeners
 * Process: main
 * Channel: window.show
 */
ipcMain.on('window.show', function (data) {
  WindowManager.create(data.window);
  WindowManager.instances[data.window].show();
});
