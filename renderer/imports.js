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

  var showFooter = PreferencesModel.get('ui.showFooter');
  console.log('showFooter', showFooter);
  if (typeof showFooter === 'undefined') {
    showFooter = true;
    PreferencesModel.set('ui.showFooter', true);
  }

  if (!showFooter) {
    $('#wFooter').addClass('hide');
  }
}

/**
 * Renders templates and partials and loads them into DOM
 */
function loadAppTemplates (data) {
  data = data || {};
  var templates = [
    'nowplaying', 'preferences', 'status', 'help'
  ];

  _.forEach(templates, function (item) {
    var markup = renderer.renderTemplate(item, data);
    $('#wBody').append(markup);
  })

  // var modalsMarkup = renderer.renderPartial('modals', {});
  // $('#modals').append(modalsMarkup);
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
