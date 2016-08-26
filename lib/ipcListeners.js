const electron = require('electron');
const ipcMain = electron.ipcMain;
const WindowManager = require('./windowManager');

// register Ipc handlers
ipcMain.on('toggle-player', function () {
  WindowManager.ensure('player', {template: 'player', windowOpts: WindowManager.presets.player});
  WindowManager.instances.player.toggle();

  // test stream mgmt
  // StreamManager.create('audio');
  // Utils.log(StreamManager.streams);
});
