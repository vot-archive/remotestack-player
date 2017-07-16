const electron = require('electron');
const globalShortcut = electron.globalShortcut;
// const Accelerator = electron.Accelerator;
const Utils = require('./utils');

var GlobalShortcuts = {
  registerOne: function registerOne(key, fn) {
    const noopFn = function () {
      Utils.log(key, 'is pressed');
    };
    const binding = globalShortcut.register(key, typeof fn === 'function' ? fn : noopFn);

    if (!binding) {
      Utils.log(key, 'registration failed');
    } else {
      Utils.log(key, 'registration successful');
    }

    var isRegistered = globalShortcut.isRegistered(key);
    Utils.log(key, 'is', isRegistered ? 'registered' : 'not registered');
  },

  registerAll: function registerAll() {
    Utils.log('Registering global shortcuts');
    this.registerOne('MediaPlayPause', function () {
      Utils.log('Media Play Pause custom routine');
    });

    this.registerOne('MediaPreviousTrack');
    this.registerOne('MediaNextTrack');
  },

  unregisterAll: function unregisterAll() {
    Utils.log('Unregistering global shortcuts');
    globalShortcut.unregister('MediaPlayPause');
    globalShortcut.unregister('MediaPreviousTrack');
    globalShortcut.unregister('MediaNextTrack');

    if (globalShortcut.isRegistered('MediaPlayPause')) {
      Utils.log('Global shortcut still registered:', 'MediaPlayPause');
    }

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  }
}

module.exports = GlobalShortcuts;
