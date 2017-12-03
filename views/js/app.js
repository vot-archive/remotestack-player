'use strict';

(function (global) {
  const electron = require('electron');
  const UI = require('./js/ui');
  const Playback = require('../renderer/playback');
  const Playlist = require('../lib/playlist');
  const Utils = require('../lib/utils');
  const WindowCtl = require('../lib/window/ctl');
  const packageJson = require('../package.json');

  const sendIpcMessage = electron.ipcRenderer.send;
  const appVersion = packageJson.version || '';

  const RS = {
    version: appVersion,
    Playlist,
    Playback,
    UI,
    Utils,
    WindowCtl,
    sendIpcMessage,
  };

  global.RS = RS;

  RS.UI.renderPartialTags({ appVersion });
  RS.UI.handleExternalLinks();
  RS.UI.preventDragRedirections();
}(window));
