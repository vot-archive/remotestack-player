var Nav = {
  init: function () {
    $('#wBody .navContent').removeClass('active');
    $('#wBody .navContent:first').addClass('active');
  },
  goto: function (id) {
    console.log('Nav.goto:', id);
    $('#wBody .navContent').removeClass('active');
    $('#wBody .navContent#' + id).addClass('active');
  }
};

module.exports = Nav;
