/**
* Emit IPC event from renderer
*/
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

module.exports = ipcRenderer.send;
