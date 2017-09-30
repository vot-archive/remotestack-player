'use strict';

(function () {
  const PreferencesModel = require('../models/preferences');

  const SettingsWindow = {
    handlePreferencesCheckboxChange: function handlePreferencesCheckboxChange(input) {
      const key = $(input).val();
      const isChecked = $(input).is(':checked');
      RS.sendIpcMessage('update-setting', { key, value: isChecked });
    },

    handlePreferencesInputChange: function handlePreferencesInputChange(input) {
      const key = $(input).attr('name');
      const value = $(input).val();
      // PreferencesModel.set(key, value);
      // window.location = window.location;
      RS.sendIpcMessage('update-setting', { key, value });
    },

    assignPreferencesCheckboxDefaults: function assignPreferencesCheckboxDefaults() {
      $('.settings-item input[type="checkbox"]').each(function () {
        const key = $(this).val();
        const isChecked = PreferencesModel.get(key) || false;
        $(this).prop('checked', isChecked);
      });
    },

    assignPreferencesInputDefaults: function assignPreferencesInputDefaults() {
      $('.settings-item input, .settings-item select').each(function () {
        if ($(this).attr('type') === 'checkbox') {
          return;
        }
        const key = $(this).attr('name');
        const value = PreferencesModel.get(key) || false;
        $(this).val(value);
      });
    },
  };

  $(document).ready(() => {
    RS.SettingsWindow = SettingsWindow;
    RS.SettingsWindow.assignPreferencesCheckboxDefaults();
    RS.SettingsWindow.assignPreferencesInputDefaults();
  });
}());
