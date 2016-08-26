const electron = require('electron');
const globalShortcut = electron.globalShortcut;
// const Accelerator = electron.Accelerator;
const Utils = require('./utils');


var GlobalShortcuts = {
  registerOne: function registerOne(key, fn) {
    const ret = globalShortcut.register(key, function () {
      Utils.log(key, 'is pressed');
    })

    if (!ret) {
      Utils.log(key, 'registration failed');
    }

    var isRegistered = globalShortcut.isRegistered(key);
    Utils.log(key, 'is', isRegistered ? 'registered' : 'not registered');
  },

  registerAll: function registerAll() {
    Utils.log('Registering global shortcuts');
    // this.registerOne('MediaPlayPause');
    // this.registerOne('CommandOrControl+Alt+S');
    // this.registerOne('CommandOrControl+X');
  },

  unregisterAll: function unregisterAll() {
    Utils.log('Unregistering global shortcuts');
    // globalShortcut.unregister('MediaPlayPause');
    // globalShortcut.unregister('CommandOrControl+Alt+S');
    // globalShortcut.unregister('CommandOrControl+X');

    if (globalShortcut.isRegistered('MediaPlayPause')) {
      Utils.log('Global shortcut still registered:', 'MediaPlayPause');
    }
    if (globalShortcut.isRegistered('CommandOrControl+Alt+S')) {
      Utils.log('Global shortcut still registered:', 'CommandOrControl+Alt+S');
    }
    if (globalShortcut.isRegistered('CommandOrControl+X')) {
      Utils.log('Global shortcut still registered:', 'CommandOrControl+X');
    }

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  }
}

module.exports = GlobalShortcuts;
