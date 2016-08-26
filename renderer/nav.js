const Utils = require('../lib/utils');

var Nav = {
  init: function () {
    this.selectFirst();
  },
  selectFirst: function () {
    Utils.log('Nav.selectFirst');
    var id = $('#wBody .navContent:first').attr('id');
    this.goto(id);
  },
  goto: function (id) {
    Utils.log('Nav.goto:', id);
    $('#wBody .navContent').removeClass('active');
    $('#wBody .navContent#' + id).addClass('active');

    if (id === 'home') {
      $('.containerFooter .fa.fa-fw.fa-home').fadeOut(100);
    } else {
      $('.containerFooter .fa.fa-fw.fa-home').fadeIn(100);
    }
  }
};

module.exports = Nav;
