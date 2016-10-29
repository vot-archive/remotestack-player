const ipcEmitters = require('../lib/ipcEmitters');
const windowFn = require('../lib/windowFn');

module.exports = {
  windowMinimizeFn: windowFn.minimizeFn,
  windowMaximizeFn: windowFn.maximizeFn,
  windowCloseFn: windowFn.closeFn,
  appQuitFn: windowFn.appQuitFn,
  ipc: ipcEmitters
}
