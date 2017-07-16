module.exports = function formatFileSize (bytes) {
  var kb = parseInt(bytes)/1024;
  var mb = kb/1024;
  var gb = mb/1024;

  var _format = function (size) {
    return (Math.ceil(size*100)/100).toString();
  }

  if (kb < 1024) {
    return _format(kb) + 'KB'
  }
  if (mb < 1024) {
    return _format(mb) + 'MB'
  }

  return _format(gb) + 'GB'
};
