(function() {
  const UI = require('../renderer/ui');
  $(document).ready(function () {
    UI.resolveUIPreferences();
    UI.preventDragRedirections();
    UI.handleExternalLinks();
    UI.assignPreferencesCheckboxDefaults();
    UI.assignPreferencesInputDefaults();
  });
}());
