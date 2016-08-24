const electron = require('electron');
const globalShortcut = electron.globalShortcut;
// const Accelerator = electron.Accelerator;



var GlobalShortcuts = {
  registerOne: function registerOne(key, fn) {
    const ret = globalShortcut.register(key, function () {
      console.log(key, 'is pressed');
    })

    if (!ret) {
      console.log(key, 'registration failed');
    }

    var isRegistered = globalShortcut.isRegistered(key);
    console.log(key, 'is', isRegistered ? 'registered' : 'not registered');
  },

  registerAll: function registerAll() {
    console.log('Registering global shortcuts');
    // this.registerOne('MediaPlayPause');
    // this.registerOne('CommandOrControl+Alt+S');
    // this.registerOne('CommandOrControl+X');
  },

  unregisterAll: function unregisterAll() {
    console.log('Unregistering global shortcuts');
    // globalShortcut.unregister('MediaPlayPause');
    // globalShortcut.unregister('CommandOrControl+Alt+S');
    // globalShortcut.unregister('CommandOrControl+X');

    if (globalShortcut.isRegistered('MediaPlayPause')) {
      console.log('Global shortcut still registered:', 'MediaPlayPause');
    }
    if (globalShortcut.isRegistered('CommandOrControl+Alt+S')) {
      console.log('Global shortcut still registered:', 'CommandOrControl+Alt+S');
    }
    if (globalShortcut.isRegistered('CommandOrControl+X')) {
      console.log('Global shortcut still registered:', 'CommandOrControl+X');
    }

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  }
}

module.exports = GlobalShortcuts;
