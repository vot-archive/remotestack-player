const electron = require('electron');

const Utils = require('../lib/utils');

const ipcEmitters = require('./lib/ipcEmitters');
const windowFn = require('./lib/windowFn');
// const windowMenu = require('./lib/windowMenu');
//
// windowMenu.initialise();

module.exports = {
  windowMinimizeFn: windowFn.minimizeFn,
  windowMaximizeFn: windowFn.maximizeFn,
  windowCloseFn: windowFn.closeFn,
  appQuitFn: windowFn.appQuitFn,
  ipc: ipcEmitters
}
