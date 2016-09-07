const electron = require('electron');
const shell = electron.shell;

const Utils = require('../lib/utils');

var Nav = {
  init: function () {
    this.selectFirst();
    this.handleExternalLinks();
  },
  selectFirst: function () {
    Utils.log('Nav.selectFirst');
    var id = $('#wBody .navContent:first').attr('id');

    // Utils.log('Hijacking Nav.selectFirst - substituting "nowplaying"');
    id = 'nowplaying';
    this.goto(id);
  },
  goto: function (id) {
    Utils.log('Nav.goto:', id);
    $('#wBody .navContent').removeClass('active');
    $('#wBody .navContent#' + id).addClass('active');

    if (id === 'nowplaying') {
      $('.containerFooter .fa.fa-fw.fa-home').fadeOut(100);
      $(window).trigger('resize');
    } else {
      $('.containerFooter .fa.fa-fw.fa-home').fadeIn(100);
    }
  },
  handleExternalLinks: function () {
    const links = document.querySelectorAll('a[href]');

    Array.prototype.forEach.call(links, function (link) {
      const url = link.getAttribute('href');
      if (url.indexOf('http') === 0) {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          shell.openExternal(url);
        });
      }
    })
  }
};

module.exports = Nav;
