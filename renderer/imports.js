var _ = require('lodash');
const Utils = require('rs-base/utils');
var PreferencesModel = require('../models/preferences');
var renderer = require('../renderer/render');

/**
 * Resolves theme and user preferences - i.e. show footer, sidebar
 */
function resolveUIPreferences () {
  var theme = PreferencesModel.get('ui.theme');
  if (!theme) {
    theme = 'light';
  }
  Utils.log('adding syle class class:', theme);
  $('#wContainer').addClass(theme);



  var showFullPath = PreferencesModel.get('ui.showFullPath');
  console.log('showFullPath', showFullPath);
  if (typeof showFullPath === 'undefined') {
    showFullPath = false;
    PreferencesModel.set('ui.showFullPath', false);
  }

  if (showFullPath) {
    $('#wContainer').addClass('showFullPath');
  }
}

/**
 * Renders templates and partials and loads them into DOM
 */
function loadAppTemplates (data) {
  data = data || {};
  var templates = [
    'nowplaying', 'status', /*'preferences', 'help'*/
  ];

  _.forEach(templates, function (item) {
    var markup = renderer.renderTemplate(item, data);
    $('#wBody').append(markup);
  })

  // var modalsMarkup = renderer.renderPartial('modals', {});
  // $('#modals').append(modalsMarkup);
}


function renderPartial (partial, data) {
  return renderer.renderPartial(partial, data);
}

/**
 * Executes all of the above
 */
// $(document).ready(function () {
//   resolveThemeAndPreferences();
//   loadAppTemplates();
// });

module.exports.resolveUIPreferences = resolveUIPreferences;
module.exports.loadAppTemplates = loadAppTemplates;
module.exports.renderPartial = renderPartial;
