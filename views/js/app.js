'use strict';

(function (global) {
  const os = require('os');
  const fse = require('fs-extra');
  const UI = require('../renderer/ui');
  const Playback = require('../renderer/playback');
  const Playlist = require('../lib/playlist');
  const Utils = require('../lib/utils');
  const windowCtl = require('../lib/windowCtl');
  const electron = require('electron');
  const sendIpcMessage = electron.ipcRenderer.send;

  const packageObj = fse.readJsonSync(__dirname + '/../package.json');
  const appVersion = packageObj.version || '';

  const RS = {};

  RS.platform = os.type().toLowerCase();
  RS.version = appVersion;
  UI.mousewheelMultiplier = RS.platform === 'darwin' ? 0.5 : 1.5;

  RS.render = function (view, data) {
    console.log('RS.render called with', view, data);
    return UI.render(view, data);
  };

  RS.Playlist = Playlist;
  RS.Playback = Playback;
  RS.UI = UI;
  RS.Utils = Utils;
  RS.Window = windowCtl;
  RS.sendIpcMessage = sendIpcMessage;

  RS.showContextMenu = RS.UI.showContextMenu;

  global.RS = RS;

  UI.renderPartialTags({ appVersion });
  UI.handleExternalLinks();
  UI.preventDragRedirections();
}(window));
