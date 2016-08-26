const electron = require('electron');
const remote = electron.remote;

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


module.exports = {
  minimizeFn: windowMinimizeFn,
  maximizeFn: windowMaximizeFn,
  closeFn: windowCloseFn
}
