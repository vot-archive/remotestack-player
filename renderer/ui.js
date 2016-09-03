const settings = require('electron-settings');
const Utils = require('../lib/utils');
// settings.defaults({
//   'ui': {
//     'sidebar': {
//       'show': true
//     }
//   }
// });
// settings.applyDefaultsSync();
// settings.clearSync();
Utils.log('settingsPath: ', settings.getSettingsFilePath());
Utils.log('settings:     ', JSON.stringify(settings.getSync()));

var UI = {
  isInitialised: false,
  applySidebarSetting: function (shouldShowNow) {
    var _self = UI;

    if (typeof shouldShowNow !== 'boolean') {
      var showSetting = settings.getSync('ui.sidebar.show');
      shouldShowNow = showSetting;
    }

    var immediate = !_self.isInitialised;

    if (shouldShowNow) {
      _self.showSidebar(immediate);
    } else {
      _self.hideSidebar(immediate);
    }
    _self.isInitialised = true;
  },
  toggleSidebar: function () {
    var _self = this;
    var showSetting = settings.getSync('ui.sidebar.show');
    _self.applySidebarSetting(!showSetting);
  },
  showSidebar: function (immediate) {
    // Utils.log('immediate', immediate);
    settings.setSync('ui.sidebar.show', true);
    var newval = settings.getSync('ui.sidebar.show');

    var time = immediate ? 200 : 350;
    // Utils.log('time', time);
    $('.sidebar').animate({'left': 0, opacity: 1}, time);
    $('.mainContent').animate({'left': 140}, time);
  },
  hideSidebar: function (immediate) {
    // Utils.log('immediate', immediate);
    settings.setSync('ui.sidebar.show', false);
    var newval = settings.getSync('ui.sidebar.show');

    var time = immediate ? 200 : 350;
    // Utils.log('time', time);
    $('.sidebar').animate({'left': -140, opacity: 0}, time);
    $('.mainContent').animate({'left': 0}, time);
  },
  bindShortcuts: function bindShortcuts () {
    var _self = this;
    Utils.log('bindShortcuts called');
    $(document).on('keydown', function(e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        return;
      }
      // Ctrl/Cmd + Alt + S
      if (e.altKey && (e.ctrlKey || e.metaKey) && (e.which === 83)) {
        Utils.log('Cmd+Alt+S hit');
        _self.toggleSidebar();
        return e.preventDefault();
      }
    });
  }
};

module.exports = UI;
