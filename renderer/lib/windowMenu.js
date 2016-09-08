const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const shell = electron.shell;

function intialise() {
  var template = [
    {
      label: 'RemoteStack',
      submenu: [
          { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
          // { label: 'Preferences', click: function () {
          //     ipc.send('open-settings-window')
          //   }
          // },
          // {
          //   label: 'Learn More',
          //   click () { shell.openExternal('http://remotestack.com') }
          // },
          { type: 'separator' },
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'minimize' },
          { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); }}
      ]
    },
    {
      label: 'Edit',
      submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    },

    // {
    //   label: 'Player',
    //   submenu: [
    //       { label: 'Previous track', accelerator: '<'},
    //       { label: 'Next track', accelerator: '>'},
    //       { label: 'Play/Pause', accelerator: 'Space'},
    //       { type: 'separator' },
    //       { label: 'Volume up', accelerator: ''},
    //       { label: 'Volume down', accelerator: ''}
    //   ]
    // },

    // {
    //   label: 'Developer tools',
    //   submenu: [
    //     {
    //       label: 'Reload', accelerator: 'CmdOrCtrl+R',
    //       click (item, focusedWindow) {
    //         if (focusedWindow) focusedWindow.reload()
    //       }
    //     },
    //     {
    //       label: 'Toggle Developer Tools', accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
    //       click (item, focusedWindow) {
    //         if (focusedWindow) focusedWindow.webContents.toggleDevTools()
    //       }
    //     }
    //   ]
    // }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports.intialise = intialise;

// http://electron.atom.io/docs/api/menu/
