'use strict';

(function () {
  const _ = require('lodash');

  function processInputAndAdd(inputEl) {
    const urls = inputEl.val().split('\n');
    // if (urls && urls.length) {
    const mappedUrls = _.filter(_.map(urls, (url) => {
      url = url.trim();
      if (url.length) {
        return { url, source: 'youtube', type: 'audio' };
      }
      return null;
    }));
    inputEl.val('');
    // }

    RS.sendIpcMessage('add-to-playlist', mappedUrls);
  }

  function bindURLInput() {
    $('*[data-toggle=addurl]').click(function () {
      console.log('clicked on addurl toggle');
      const inputEl = $('#' + $(this).data('addurlInput'));
      processInputAndAdd(inputEl);
    });

    $('*[data-addurl-input]').each(function () {
      const inputId = $(this).data('addurlInput');
      const inputEl = $('#' + inputId);

      inputEl.on('keydown', function (e) {
        if (e.which === 13) {
          if (!e.shiftKey) {
            e.preventDefault();
            processInputAndAdd(inputEl);
          }
        }
      });
    });
  }

  $(document).ready(function () {
    bindURLInput();
    $('#urlinput').focus();
  });
}());
