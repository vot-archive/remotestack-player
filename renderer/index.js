const electron = require('electron');

const Utils = require('../lib/utils');

const ipcEmitters = require('./lib/ipcEmitters');
const windowFn = require('./lib/windowFn');
const windowMenu = require('./lib/windowMenu');

// windowMenu.initialise();

function bindShortcuts () {
  const Player = require('./player');
  Utils.log('bindShortcuts called');
  $(document).on('keypress', function(e) {
    var tag = e.target.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea') {
      return;
    }

    // 32 === space
    if (e.which === 32) {
      Utils.log('space hit');
      Player.play();
      // trigger play on main window
      return e.preventDefault();
    }


    Utils.log(e.which);
  });
}

module.exports = {
  windowMinimizeFn: windowFn.minimizeFn,
  windowMaximizeFn: windowFn.maximizeFn,
  windowCloseFn: windowFn.closeFn,
  ipc: ipcEmitters,
  bindShortcuts: bindShortcuts
}
