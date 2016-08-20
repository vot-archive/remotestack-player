var Rs = {};


Rs.init = function RsInit () {
  $('.btnHideSidebar').click(function () {
    // $('.sidebar').toggleClass('col-sm-3')
    $('.sidebar').toggleClass('hide');
    $('.mainContent').toggleClass('col-sm-9 col-sm-12');
  });
};


$(document).ready(function () {
  Rs.init();
});
