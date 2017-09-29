'use strict';

(function () {
  const UI = require('../renderer/ui');
  const _ = require('lodash');

  function processInputAndAdd(inputEl) {
    const urls = inputEl.val().split('\n');
    if (urls && urls.length) {
      _.each(urls, function (url) {
        url = url.trim();
        if (url.length) {
          const dataToAdd = { url, source: 'youtube', type: 'audio' };
          RS.IPCEmitter('add-to-playlist', dataToAdd);
          inputEl.val('');
        }
      });
    }
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
        if ((e.ctrlKey || e.metaKey) && e.which === 13) {
          e.preventDefault();
          processInputAndAdd(inputEl);
        }
      });
    });
  }

  $(document).ready(function () {
    UI.bindShortcuts();
    UI.preventDragRedirections();
    bindURLInput();
  });
}());
