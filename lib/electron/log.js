const path = require('path');
const fse = require('fs-extra');
const glob = require('glob');
const electron = require('electron');
const app = electron.app || electron.remote.app;
const dataRoot = app.getPath('userData');

const filename = 'app.log';
const logpath = path.join(dataRoot, filename);

// const runningFromCLI = process.env.PWD && process.env._ && process.env._.endsWith('/electron');

const ARCHIVE_LOGS = 3;
const WRITE_TO_STDOUT = false;
const WRITE_TO_FILE = true;

if (WRITE_TO_FILE) {
  fse.ensureFileSync(logpath);
  console.log('Logging to:', logpath);
}


function concatToString (args) {
  var rtn = '';
  args.map(function (el, i) {
    rtn += (typeof el === 'string' ? el : JSON.stringify(el));
    if (i < args.length - 1) {
      rtn += ' ';
    }
  });
  return rtn;
}

function appendLeadZeroes (num) {
  if (!num) {
    num = 0;
  }
  num = num.toString();
  var rtn = num;
  var iterations = 2 - num.length;

  if (iterations > 0) {
    for (var i = 0; i < iterations; i++) {
      rtn = '0' + rtn;
    }
  }

  return rtn;
}

function currentTime () {
  var now = new Date();

  var date = [now.getFullYear(), appendLeadZeroes(now.getMonth() + 1), appendLeadZeroes(now.getDate())].join('/');
  var time = [appendLeadZeroes(now.getHours()), appendLeadZeroes(now.getMinutes()), appendLeadZeroes(now.getSeconds())].join(':');
  return date + ' ' + time + ' ';
}

function getFnCallers (a) {
  var limit = 10;
  var i = 0;
  function getCallerName (fnContext, rtn) {
    rtn = rtn || [];
    if (fnContext && fnContext.caller && fnContext.caller.name) {
      rtn.push(fnContext.caller.name.toString());
      i++;
      if (fnContext.caller.caller) {
        if (i >= limit) {
          return rtn;
        }
        return getCallerName(fnContext.caller, rtn);
      }
    }
    return rtn;
  }
  return getCallerName(a.callee);
}

// TODO Add a check if there's anything in the log file before moving it
function rotatelog() {
  var exists = fse.existsSync(logpath);
  if (exists) {
    glob(logpath + '.**', function (err, files) {
      files = Array.isArray(files) ? files : [];
      var logfiles = files.reverse();

      logfiles.forEach(function (filename) {
        var id = parseInt(filename.replace(logpath + '.', ''));
        if (id >= ARCHIVE_LOGS) {
          try {
            fse.unlinkSync(filename);
          } catch (e) {
            console.log(e);
          }
        } else {
          fse.renameSync(logpath + '.' + id, logpath + '.' + (id + 1));
        }
      });

      fse.renameSync(logpath, logpath + '.1');
    });
  }
}

function log () {
  var fnArgs = Array.prototype.slice.call(arguments);
  var caller = getFnCallers(arguments).reverse().join(' > ');

  var msgSegments = [];
  msgSegments.push('\x1b[2m'/*'\x1b[47m'*/);
  msgSegments.push(currentTime());
  if (caller) msgSegments.push('\x1b[36m' + caller + ' ');
  msgSegments.push('\x1b[0m');

  msgSegments.push(concatToString(fnArgs));

  var msg = msgSegments.join('');

  if (WRITE_TO_FILE) {
    fse.appendFileSync(logpath, msg + '\n', {encoding: 'utf8'});
  }

  if (WRITE_TO_STDOUT) {
    console.log(msg);
  }
}

module.exports = log;
module.exports.rotatelog = rotatelog;