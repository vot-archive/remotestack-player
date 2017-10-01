'use strict';

const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const shell = electron.shell;
const WindowManager = require('./windowManager');
const PreferencesModel = require('../models/preferences');

function intialise(opts) {
  opts = opts || {};
  const editGroupEnabled = opts.edit === true;
  const developerGroupEnabled = PreferencesModel.get('app.enableDeveloperMode');

  const template = [
    {
      label: 'RemoteStack',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => { WindowManager.show('settings'); },
        },
        { type: 'separator' },
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => { app.quit(); },
        },
      ],
    },
  ];


  if (editGroupEnabled) {
    const editGroup = {
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
    };
    template.push(editGroup);
  }

  if (developerGroupEnabled) {
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
        { type: 'separator' },
        {
          label: 'Open App Data folder',
          // accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => {
            const userDataFolder = app.getPath('userData');
            shell.openItem(userDataFolder);
          },
        },
        // {
        //   label: 'Clear cache',
        //   click: () => {},
        // },
        // {
        //   label: 'Clear logs',
        //   click: () => {},
        // },
        // {
        //   label: 'Global console',
        //   click: () => {},
        // },
      ],
    };
    template.push(devToolsGroup);
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports.intialise = intialise;
