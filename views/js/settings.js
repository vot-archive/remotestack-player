'use strict';

(function () {
  const UI = require('../renderer/ui');
  $(document).ready(() => {
    UI.resolveUIPreferences();
    UI.preventDragRedirections();
    UI.handleExternalLinks();
    UI.assignPreferencesCheckboxDefaults();
    UI.assignPreferencesInputDefaults();
  });
}());
