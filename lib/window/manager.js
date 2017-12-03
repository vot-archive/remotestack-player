'use strict';

const create = require('./create');
const definitions = require('./definitions');

const instances = {};

function show(name) {
  if (!instances[name] && definitions[name]) {
    instances[name] = create(name, definitions[name]);
    instances[name].on('closed', () => {
      instances[name].destroy();
      instances[name] = null;
    });
  }

  if (instances[name]) {
    instances[name].focus();
  }
}

module.exports = {
  instances,
  show,
};
