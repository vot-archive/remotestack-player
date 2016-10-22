const electron = require('electron');
var PreferencesModel = require('../models/preferences');
const shell = electron.shell;
const path = require('path');
const os = require('os');

const Utils = require('../lib/utils');

var Nav = {
  init: function () {
    this.selectFirst();
    this.handleExternalLinks();
    this.handleGotoDataLinks();
  },
  selectFirst: function () {
    Utils.log('Nav.selectFirst');
    // var id = $('#wBody .navContent:first').attr('id');
    // Utils.log('Hijacking Nav.selectFirst - substituting "nowplaying"');
    var id = 'nowplaying';
    this.goto(id);
  },
  goto: function (id) {
    Utils.log('Nav.goto:', id);
    $('#wBody .navContent').removeClass('active');
    $('#wBody .navContent#' + id).addClass('active');

    $('*[data-nav-goto]').parents('li').removeClass('active');
    $('*[data-nav-goto='+ id+ ']').parents('li').addClass('active');
  },
  handleExternalLinks: function () {
    const links = document.querySelectorAll('a[href]');

    Array.prototype.forEach.call(links, function (link) {
      var url = link.getAttribute('href');
      Utils.log('Caught a click to' + url);

      if (url.indexOf('http') === 0) {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          shell.openExternal(url);
        });
      }

      if (url.indexOf('file') === 0) {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          url = url.replace('file://', '');


          const app = electron.app || electron.remote.app;
          const tmpdir = os.tmpdir();
          const userData = app.getPath('userData');


          url = url.replace('$$TMPDIR', tmpdir);
          url = url.replace('$$USERDATA', userData);


          // shell.showItemInFolder(url);
          shell.openItem(url);
        });
      }
    })
  },
  handleGotoDataLinks: function handleGotoDataLinks () {
    $('*[data-nav-goto]').click(function () {
      var destination = $(this).data('navGoto');
      Nav.goto(destination);
    })
  }

};

module.exports = Nav;
