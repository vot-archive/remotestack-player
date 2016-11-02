var _ = require('lodash');
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
  RS.Utils.log('adding syle class class:', theme);
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

  var templateTags = $('rsTemplate');
  _.forEach(templateTags, function (tag) {
    var template = $(tag).data('name');

    console.log('processing template tag:', template);
    var markup = renderer.renderTemplate(template, data);
    $(tag).after(markup);
    $(tag).remove();
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
