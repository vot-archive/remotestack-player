var fse = require('fs-extra');

var packageObj = fse.readJsonSync(__dirname + '/../package.json');
var version = packageObj.version || '';

$(document).ready(function () {
  $('#versionTag').text(version);
});
