// alert('Hello');

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
// var Menu = remote.require('menu');
//
//
// var menu = Menu.buildFromTemplate([
//   {
//     label: 'RemoteStack',
//     submenu: [
//       label: 'Prefs',
//       click: function () {
//         ipc.send('open-settings-window')
//       }
//     ]
//   }
// ]);
//
// Menu.setApplicationMenu(menu);


function windowMinimizeFn (e) {
  var window = remote.getCurrentWindow();
  window.minimize();
}

function windowMaximizeFn (e) {
  var window = remote.getCurrentWindow();
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }

  // window.setFullScreen(!window.isFullScreen());
}

function windowCloseFn(){
  var window = remote.getCurrentWindow();
  window.close();
}

function showSettings() {
  ipcRenderer.send('show-settings');
}
function showPlayer() {
  ipcRenderer.send('show-player');
}
function hidePlayer() {
  ipcRenderer.send('hide-player');
}

module.exports = {
  windowMinimizeFn: windowMinimizeFn,
  windowMaximizeFn: windowMaximizeFn,
  windowCloseFn: windowCloseFn,
  ipc: {
    showSettings: showSettings,
    showPlayer: showPlayer,
    hidePlayer: hidePlayer
  }
}
