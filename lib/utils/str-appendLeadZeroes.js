'use strict';

module.exports = function appendLeadZeroes(num, positions) {
  if (!num) {
    num = 0;
  }
  num = num.toString();
  let rtn = num;
  const iterations = positions - num.length;

  if (iterations > 0) {
    for (let i = 0; i < iterations; i++) {
      rtn = '0' + rtn;
    }
  }

  return rtn;
};
