var appendLeadZeroes = require('./str-appendLeadZeroes');

module.exports = function formatSecondsAsTime (sec) {
  var s = parseInt(sec);

  var multipliers = {
    d: 60 * 60 * 24,
    h: 60 * 60,
    m: 60
  };

  var remainder = s;

  var days = Math.floor(remainder / multipliers.d);
  if (days) remainder -= (days * multipliers.d);

  var hours = Math.floor(remainder / multipliers.h)
  if (hours) remainder -= (hours * multipliers.h);

  var minutes = Math.floor(remainder / multipliers.m)
  if (minutes) remainder -= (minutes * multipliers.m);

  var seconds = remainder;

  var rtn = '';
  if (days) rtn += appendLeadZeroes(days) + ':';
  if (hours) rtn += appendLeadZeroes(hours, 2) + ':';
  rtn += appendLeadZeroes(minutes, 2) + ':';
  rtn += appendLeadZeroes(seconds, 2) + '';

  return rtn;
};
