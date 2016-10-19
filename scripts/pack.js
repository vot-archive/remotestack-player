const path = require('path');
const exec = require('child_process').exec;
const async = require('async');
const clarg = require('clarg')();
var rootdir = path.join(__dirname, '..');

var ignoreList = [
  'dist',
  'scripts',
  'builder.json',
  '.git',
  '.gitignore',
  'app.log',
  '.DS_Store',
  'playlist.json'
];

/**
 * Clean the dist folder
 */
function clean (callback) {
  var dir = rootdir + '/dist';

  console.log('Removing dist dir:', dir);
  exec('rm -rf ' + dir, function (e, stdout, stderr) {
    if (e instanceof Error) {
      console.error(e);
      throw e;
    }
    if (stdout) console.log('[remove-dist] stdout:', stdout);
    if (stderr) console.log('[remove-dist] stderr:', stderr);
    console.log('Dist folder clean');
    callback();
  });
}

/**
 * Pack the app for a single platform
 */
function packOne (platform, callback) {
  console.log('Packaging app for', platform);

  var platformCode, archCode, icon;

  if (platform === 'mac') {
    platformCode = 'darwin';
    archCode = 'x64';
    icon = 'views/assets/icons/player.icns';
  }
  if (platform === 'win') {
    platformCode = 'win32';
    archCode = 'ia32';
    icon = 'views/assets/icons/player.ico';
  }
  if (platform === 'linux') {
    platformCode = 'linux';
    archCode = 'x64';
    icon = 'views/assets/icons/player-256.png';
  }

  if (!platformCode) {
    return console.log('Provide correct platform (mac, win or linux)');
  }

  var args = [
    rootdir + '/node_modules/electron-packager/cli.js',
    rootdir,
    '"RemoteStack Player"',
    '--version=1.3.3',
    // '--out=dist/' + platform,
    '--out=dist',
    '--platform=' + platformCode,
    '--arch=' + archCode,
    '--icon=' + icon
  ];

  ignoreList.forEach(function (i) {
    args.push('--ignore=' + i)
  });

  var cmd = 'node ' + args.join(' ');
  exec(cmd, function (e, stdout, stderr) {
    if (e instanceof Error) {
      console.error(e);
      throw e;
    }

    if (stdout) console.log('[pack ' + platform + ']', stdout);
    if (stderr) console.log('[pack ' + platform + ']', stderr);

    callback();
  });
}


function pack(targets) {
  var allTargets = ['mac', 'win', 'linux'];
  var buildTargets = targets.split(',') || allTargets;
  buildTargets = buildTargets.filter(function (tg) {
    return allTargets.indexOf(tg) !== -1;
  });
  if (!buildTargets.length) {
    console.log('No valid target platforms specified.\nSupported platforms are "mac", "win" and "linux".')
    process.exit(1);
  }
  console.log('Target platforms:', buildTargets.join(', '), '\n');

  clean(function () {
    async.eachSeries(buildTargets, function (i, cb) {
      packOne(i, cb);
    }, function () {
      console.log('All done.');
      process.exit(0);
    });
  });
}


var targets = clarg.opts.t || clarg.opts.targets;
pack(targets);
