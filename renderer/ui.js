const _ = require('lodash');
var PreferencesModel = require('../models/preferences');
const Utils = require('../lib/utils');
const Nav = require('../renderer/nav');

Utils.log('settingsPath: ', PreferencesModel.getLocation());
Utils.log('settings:     ', JSON.stringify(_.omit(PreferencesModel.get(), 'streams'), null, 2));

var UI = {
  isInitialised: false,

  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }

      // Ctrl/Cmd + ,
      if ((e.ctrlKey || e.metaKey) && e.which === 188) {
        Utils.log('Cmd+, hit');
        Nav.goto('preferences');
        return e.preventDefault();
      }
      // Ctrl/Cmd + .
      if ((e.ctrlKey || e.metaKey) && e.which === 190) {
        Utils.log('Cmd+. hit');
        Nav.goto('nowplaying');
        return e.preventDefault();
      }
      // F1 [112]
      if (e.which === 112) {
        Utils.log('F1 hit');
        Nav.goto('help');
        return e.preventDefault();
      }
    });
  },

  preventDragRedirections: function preventDragRedirections() {
    document.addEventListener('dragover',function(event){
      event.preventDefault();
      return false;
    },false);

    document.addEventListener('drop',function(event){
      event.preventDefault();
      return false;
    },false);
  }
};

module.exports = UI;
