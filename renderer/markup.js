var _ = require('lodash');
var fse = require('fs-extra');

// Cache the template renderers
var renderers = {};

/**
 * Generic lodash renderer
 */
function render (template, data) {
  var renderer;

  if (!renderers[template]) {
    var filename = __dirname + '/../views/' + template + '.html';
    var templateMarkup = fse.readFileSync(filename);
    renderer = _.template(templateMarkup);
    // cache
    renderers[template] = renderer;
  } else {
    renderer = renderers[template];
  }

  return renderer(data);
}

module.exports.render = render;
