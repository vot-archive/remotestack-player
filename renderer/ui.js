const settings = require('electron-settings');
// settings.defaults({
//   'ui': {
//     'sidebar': {
//       'show': true
//     }
//   }
// });
// settings.applyDefaultsSync();
// settings.clearSync();
console.log('settings:', JSON.stringify(settings.getSync()));

var UI = {
  isInitialised: false,
  applySidebarSetting: function (shouldShowNow) {
    var _self = UI;

    if (typeof shouldShowNow !== 'boolean') {
      var showSetting = settings.getSync('ui.sidebar.show');
      shouldShowNow = showSetting;
    }

    if (shouldShowNow) {
      _self.showSidebar();
    } else {
      _self.hideSidebar();
    }
  },
  toggleSidebar: function () {
    var _self = this;
    var showSetting = settings.getSync('ui.sidebar.show');
    _self.applySidebarSetting(!showSetting);
  },
  showSidebar: function () {
    // console.log();
    settings.setSync('ui.sidebar.show', true);
    var newval = settings.getSync('ui.sidebar.show');
    console.log('Calling show sidebar', 'newval', newval, 'should be true');
    $('.sidebar').animate({'left': 0});
    $('.mainContent').animate({'left': 140});
  },
  hideSidebar: function () {
    // console.log();
    settings.setSync('ui.sidebar.show', false);
    var newval = settings.getSync('ui.sidebar.show');
    console.log('Calling hide sidebar', 'newval', newval, 'should be false');
    $('.sidebar').animate({'left': -140});
    $('.mainContent').animate({'left': 0});
  }
};

module.exports = UI;
