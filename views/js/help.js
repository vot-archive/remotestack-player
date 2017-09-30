'use strict';

(function () {
  const UI = require('../renderer/ui');
  const checkForUpdates = require('./js/checkForUpdates');

  $(document).ready(function () {
    checkForUpdates(function (err, data) {
      if (err) {
        console.log(err);
      }
      if (!err && data) {
        if (data.needsUpdate) {
          $('#updateNotice').show().html('Version ' + data.newest + ' available. <a href="' + data.url + '" class="btn btn-xs btn-default">Update</a>');

          UI.handleExternalLinks($('#updateNotice a'));
        }
      }
    });
  });
}());
