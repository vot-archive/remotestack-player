module.exports = function appendLeadZeroes (num, positions) {
  if (!num) {
    num = 0;
  }
  num = num.toString();
  var rtn = num;
  var iterations = positions - num.length;

  if (iterations > 0) {
    for (var i = 0; i < iterations; i++) {
      rtn = '0' + rtn;
    }
  }

  return rtn;
};
