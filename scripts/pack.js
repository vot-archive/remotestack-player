'use strict';

const path = require('path');
const fse = require('fs-extra');
const exec = require('child_process').exec;
const async = require('async');
const clarg = require('clarg')();
const rootdir = path.join(__dirname, '..');

const ignoreList = [
  'dist',
  'scripts',
  '.git',
  '.gitignore',
  'app.log',
  '.DS_Store',
];

/**
 * Clean the dist folder
 */
function clean(callback) {
  const dir = rootdir + '/dist';

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
function packOne(platform, callback) {
  console.log('Packaging app for', platform);

  let platformCode,
    archCode,
    icon;

  if (platform === 'mac') {
    platformCode = 'darwin';
    archCode = 'x64';
    icon = rootdir + '/views/icons/player.icns';
  }
  if (platform === 'win') {
    platformCode = 'win32';
    archCode = 'ia32';
    icon = rootdir + '/views/icons/player.ico';
  }
  if (platform === 'linux') {
    platformCode = 'linux';
    archCode = 'x64';
    icon = rootdir + '/views/icons/player-256.png';
  }
  if (platform === 'linux-arm') {
    platformCode = 'linux';
    archCode = 'armv7l';
    icon = rootdir + '/views/icons/player-256.png';
  }

  if (!platformCode) {
    return console.log('Provide correct platform (mac, win or linux)');
  }

  const args = [
    rootdir + '/node_modules/electron-packager/cli.js',
    rootdir,
    '"RemoteStack Player"',
    '--version=1.6.11',
    // '--out=dist/' + platform,
    '--out=dist',
    '--platform=' + platformCode,
    '--asar=true',
    '--arch=' + archCode,
    '--icon=' + icon,
  ];

  ignoreList.forEach(function (i) {
    args.push('--ignore=' + i);
  });

  const cmd = 'node ' + args.join(' ');
  exec(cmd, function (e, stdout, stderr) {
    if (e instanceof Error) {
      console.error(e);
      throw e;
    }

    if (stdout) console.log('[pack ' + platform + ']', stdout);
    if (stderr) console.log('[pack ' + platform + ']', stderr);

    postPackOne(platform, callback);
  });
}

function postPackOne(platform, callback) {
  // todo: rename dirs here
  let nameIn;
  let nameOut;

  if (platform === 'mac') {
    nameIn = 'RemoteStack Player-darwin-x64';
    nameOut = 'RemoteStack-Player-mac';
  }
  if (platform === 'win') {
    nameIn = 'RemoteStack Player-win32-ia32';
    nameOut = 'RemoteStack-Player-win';
  }
  if (platform === 'linux') {
    nameIn = 'RemoteStack Player-linux-x64';
    nameOut = 'RemoteStack-Player-linux';
  }
  if (platform === 'linux-arm') {
    nameIn = 'RemoteStack Player-linux-armv7l';
    nameOut = 'RemoteStack-Player-linux-arm';
  }

  if (nameIn && nameOut) {
    console.log('Renaming:', nameIn, '->', nameOut);
    nameIn = path.join(rootdir, 'dist', nameIn);
    nameOut = path.join(rootdir, 'dist', nameOut);
    fse.renameSync(nameIn, nameOut);

    callback();
  }
}


function pack(targets) {
  const allTargets = ['mac', 'win', 'linux', 'linux-arm'];
  let buildTargets = targets ? targets.split(',') : allTargets;
  buildTargets = buildTargets.filter(function (tg) {
    return allTargets.indexOf(tg) !== -1;
  });
  if (!buildTargets.length) {
    console.log('No valid target platforms specified.\nSupported platforms are "mac", "win" and "linux".');
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


const targets = clarg.opts.t || clarg.opts.targets;
pack(targets);
