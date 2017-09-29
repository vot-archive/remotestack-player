'use strict';

const request = require('request');
const fse = require('fs-extra');
const _ = require('lodash');
const packageObj = fse.readJsonSync(__dirname + '/../../package.json');
const appVersion = packageObj.version || '';


function isNewer(newest) {
  let va = appVersion.split('.');
  let vb = newest.split('.');

  if (va[0] < vb[0]) {
    return true;
  } else if (va[0] == vb[0] && va[1] < vb[1]) {
    return true;
  } else if (va[1] == vb[1] && va[2] < vb[2]) {
    return true;
  }

  return false;
}

function checkForUpdates (callback) {
  if (!callback) {
    console.log('No callback provided to checkForUpdates');
    return;
  }

  const uri = 'http://remotestack.com/versions.json';
  request.get({uri: uri}, function (err, response, body) {

    let newest;
    let url;

    try {
      body = JSON.parse(body);
      newest = _.get(body, 'player.version');
      url = _.get(body, 'player.url');
    } catch (e) {
      console.log(e);
    }

    if (!newest) {
      return callback('Could not resolve newest version from the server.');
    }

    const needsUpdate = isNewer(newest);

    return callback(null, {newest, url, needsUpdate});
  });
}

module.exports = checkForUpdates;
