'use strict';

const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
const shell = electron.shell;
const WindowManager = require('./manager');

function set(opts) {
  opts = opts || {};
  this.windowGroupEnabled = opts.windowGroup === true;
  this.editGroupEnabled = opts.editGroup === true;
  this.developerGroupEnabled = opts.devGroup === true;
  this.escToClose = opts.escToClose === true;

  const template = [
    {
      label: 'RemoteStack',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
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

  if (this.escToClose) {
    template[0].submenu.push({ label: 'Close', accelerator: 'Esc', role: 'close' });
  }

  if (this.windowGroupEnabled) {
    const windowGroup = {
      label: 'Window',
      submenu: [
        {
          label: 'Add',
          accelerator: 'A',
          click: () => { WindowManager.show('add'); },
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => { WindowManager.show('settings'); },
        },
        {
          label: 'Help',
          accelerator: 'H',
          click: () => { WindowManager.show('help'); },
        },
      ],
    };
    template.push(windowGroup);
  }


  if (this.editGroupEnabled) {
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

  if (this.developerGroupEnabled) {
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

module.exports.set = set;
