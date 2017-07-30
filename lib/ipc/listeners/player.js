const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

/**
 * Register IPC listeners
 * Process: renderer
 * Channel: player
 */
ipcRenderer.on('player', function (data) {
  console.log(data);
  // test stream mgmt
  // StreamManager.create('audio');
  // Utils.log(StreamManager.streams);
});
