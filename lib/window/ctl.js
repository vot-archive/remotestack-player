'use strict';

const electron = require('electron');
const remote = electron.remote;

function windowMinimiseFn() {
  const window = remote.getCurrentWindow();
  window.minimize();
}

function windowMaximiseFn() {
  const window = remote.getCurrentWindow();
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }

  // window.setFullScreen(!window.isFullScreen());
}

function windowCloseFn() {
  const window = remote.getCurrentWindow();
  window.close();
}

function appQuitFn() {
  remote.app.quit();
}


module.exports = {
  minimise: windowMinimiseFn,
  maximise: windowMaximiseFn,
  close: windowCloseFn,
  appQuit: appQuitFn,
};
