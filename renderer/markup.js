'use strict';

const _ = require('lodash');
const fse = require('fs-extra');
const path = require('path');

// Cache the template renderers
const renderers = {};

/**
 * Generic lodash renderer
 */
function render(template, data) {
  let renderer;

  if (!renderers[template]) {
    const filename = path.join(__dirname, '/../views/' + template + '.html');
    const templateMarkup = fse.readFileSync(filename);
    renderer = _.template(templateMarkup);
    // cache
    renderers[template] = renderer;
  } else {
    renderer = renderers[template];
  }

  return renderer(data);
}

module.exports.render = render;
