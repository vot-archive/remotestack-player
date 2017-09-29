'use strict';

const appendLeadZeroes = require('./str-appendLeadZeroes');

module.exports = function formatSecondsAsTime(sec) {
  const s = parseInt(sec, 10);

  const multipliers = {
    d: 60 * 60 * 24,
    h: 60 * 60,
    m: 60,
  };

  let remainder = s;

  const days = Math.floor(remainder / multipliers.d);
  if (days) remainder -= (days * multipliers.d);

  const hours = Math.floor(remainder / multipliers.h);
  if (hours) remainder -= (hours * multipliers.h);

  const minutes = Math.floor(remainder / multipliers.m);
  if (minutes) remainder -= (minutes * multipliers.m);

  const seconds = remainder;

  let rtn = '';
  if (days) rtn += appendLeadZeroes(days) + ':';
  if (hours) rtn += appendLeadZeroes(hours, 2) + ':';
  rtn += appendLeadZeroes(minutes, 2) + ':';
  rtn += appendLeadZeroes(seconds, 2) + '';

  return rtn;
};
