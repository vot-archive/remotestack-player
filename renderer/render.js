var _ = require('lodash');
var fse = require('fs-extra');

// Cache the template renderers
var renderers = {};

/**
 * Generic lodash renderer
 */
function render (template, data) {
  if (!renderers[template]) {
    var templateMarkup = fse.readFileSync(template);
    var renderer = _.template(templateMarkup);
    // cache
    renderers[template] = renderer;
  } else {
    var renderer = renderers[template];
  }

  return renderer(data);
}

/**
 * Renders partials
 */
function renderPartial (template, data) {
  // console.log('rendering partial:', template, 'with data:', data);
  return render(__dirname + '/../views/partials/' + template + '.html', data);
}

/**
 * Renders templates
 */
function renderTemplate (template, data) {
  // console.log('rendering template:', template, 'with data:', data);
  return render(__dirname + '/../views/templates/' + template + '.html', data);
}

module.exports.render = render;
module.exports.renderPartial = renderPartial;
module.exports.renderTemplate = renderTemplate;
