'use strict';

const _ = require('lodash');
const cache = {};
const cacheTTL = 360 * 60 * 1000; // 6 hours

function shouldUseCache(store, key) {
  const cacheObj = _.get(cache, [store, key].join('.'));
  if (!cacheObj) {
    console.log('No cache found for', store, key);
    return false;
  }

  const stamp = cacheObj.cachetimestamp || 0;

  return (stamp + cacheTTL > Date.now());
}

function save(store, key, value) {
  if (!value) {
    return;
  }
  // console.log('Storing cache for', store, key);
  // value.cachetimestamp = Date.now();
  _.set(cache, [store, key].join('.'), value);
}

function get(store, key) {
  // console.log('Getting cache for', store, key);
  return _.get(cache, [store, key].join('.'));
}

module.exports = {
  get,
  save,
  shouldUseCache,
};
