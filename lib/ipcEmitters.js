const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

function showSettings() {
  ipcRenderer.send('show-settings');
}
function showPlayer() {
  ipcRenderer.send('show-player');
}
function hidePlayer() {
  ipcRenderer.send('hide-player');
}
function togglePlayer() {
  ipcRenderer.send('toggle-player');
}


module.exports = {
  showSettings: showSettings,
  showPlayer: showPlayer,
  hidePlayer: hidePlayer,
  togglePlayer: togglePlayer
};
