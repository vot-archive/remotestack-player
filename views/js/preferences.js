const remote = require('electron').remote;
var PreferencesModel = remote.require('./models/preferences');

var PreferencesUI = {
  handleCheckboxChange: function handleCheckboxChange(input) {
    var key = $(input).val();
    var isChecked = $(input).is(':checked');
    console.log('setting', key, 'to', isChecked);
    PreferencesModel.set(key, !!isChecked);
    window.location = window.location;
  },

  handleInputChange: function handleInputChange(input) {
    var key = $(input).attr('name');
    var value = $(input).val();
    PreferencesModel.set(key, value);
    window.location = window.location;
  },

  assignCheckboxDefaults: function assignCheckboxDefaults() {
    $('.settings-item input[type="checkbox"]').each(function () {
      var key = $(this).val();
      var isChecked = PreferencesModel.get(key) || false;
      $(this).prop('checked', isChecked);
    });
  },

  assignInputDefaults: function assignInputDefaults() {
    $('.settings-item input, .settings-item select').each(function () {
      if ($(this).attr('type') === 'checkbox') {
        return;
      }
      var key = $(this).attr('name');
      var value = PreferencesModel.get(key) || false;
      $(this).val(value);
    });
  }

}

module.exports = PreferencesUI;
