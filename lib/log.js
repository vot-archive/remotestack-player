const path = require('path');
const fse = require('fs-extra');

const logpath = path.join(__dirname, '../app.log');

function concatToString (args) {
  var rtn = '';
  args.map(function (el, i) {
    rtn += (typeof el === 'string' ? el : JSON.stringify(el));
    if (i < args.length - 1) {
      rtn += ' ';
    }
  })
  return rtn;
}

function currentTime () {
  var now = new Date();

  var date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/');
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()].join(':');
  // return '[' + date + ' ' + time + ']'+ '\n';
  return '';
}

function log () {
  fse.ensureFileSync(logpath);
  var fnArgs = Array.prototype.slice.call(arguments);
  fse.appendFileSync(logpath, currentTime() + concatToString(fnArgs) + '\n', {encoding: 'utf8'});
}

function nativeLog () {
  return console.log(arguments);
}

module.exports = log;
