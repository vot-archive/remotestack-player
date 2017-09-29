'use strict';

const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const WindowManager = require('./windowManager');

const runningFromCLI = process.env.PWD && process.env._ && process.env._.endsWith('/electron');

function intialise() {
  const template = [
    {
      label: 'RemoteStack',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: function onClickPreferences() {
            WindowManager.create('settings');
            WindowManager.instances.settings.show();
          },
        },
        // {
        //   label: 'Learn More',
        //   click () { shell.openExternal('http://remotestack.com') }
        // },
        { type: 'separator' },
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function onClickQuit() {
            app.quit();
          },
        },
      ],
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
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      ],
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
  ];

  if (runningFromCLI) {
    const devToolsGroup = {
      label: 'Developer tools',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function onClickDevToolsReload(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: function onClickDevToolsToggle(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    template.push(devToolsGroup);
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports.intialise = intialise;
