'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const _ = require('lodash');

var RS = {
  windows: {},
  debug: false
}

function createWindow (name, opts) {
  if (RS.windows[name]) {
    return;
  }
  var defaultWindowOpts = {
    width: 500,
    height: 400,
    show: true,
    frame: true,
    icon: __dirname + '/views/public/rs.ico'
  };
  var windowOpts = _.merge({}, defaultWindowOpts, opts.windowOpts);
  console.log('Created window:', name, ' | options:', JSON.stringify(windowOpts));


  RS.windows[name] = new BrowserWindow(windowOpts);
  RS.windows[name].loadURL('file://' + __dirname + '/views/' + opts.template + '.html');

  if (RS.debug) {
    RS.windows[name].webContents.openDevTools();
  }

  RS.windows[name].on('closed', function () {
    RS.windows[name] = null;
  });
}

/* Main window */
function createMainWindow () {
  createWindow('main', {template: 'main', windowOpts: {minWidth: 300, minHeight: 54, frame: false}});
}

/* Settings window */
function createSettingsWindow() {
  createWindow('settings', {template: 'settings', windowOpts: {width: 300, height: 300}});
}

/* background window */
function createPlayerWindow() {
  createWindow('player', {template: 'player', windowOpts: {width: 300, height: 120, show: false, frame: false,}});
}

function showPlayerWindow() {
  RS.windows.player.show();
}
function hidePlayerWindow() {
  RS.windows.player.hide();
}


function initialise () {
  createPlayerWindow();
  createMainWindow();
}

// This method will be called when Electron has finished
app.on('ready', initialise);
ipcMain.on('show-settings', createSettingsWindow);
ipcMain.on('show-player', showPlayerWindow);
ipcMain.on('hide-player', hidePlayerWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (RS.windows.main === null) {
    createMainWindow();
  }
});
