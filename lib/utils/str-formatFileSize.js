'use strict';

module.exports = function formatFileSize(bytes) {
  const kb = parseInt(bytes, 10) / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  function format(size) {
    return (Math.ceil(size * 100) / 100).toString();
  }

  if (kb < 1024) {
    return format(kb) + 'KB';
  }

  if (mb < 1024) {
    return format(mb) + 'MB';
  }

  return format(gb) + 'GB';
};
