(function () {
  'use strict';

  var mdHtml, mdSrc, permalink;

  var defaults = {
    html: true,
    xhtmlOut: true,
    breaks: false,
    langPrefix: 'language-',

    // options below are for demo only
    _highlight: false,
    _src: false
  };

  defaults.highlight = function (str, lang) {
    if (!defaults._highlight) { return ''; }

    var hljs = window.hljs;
    if (lang && hljs.getLanguage(lang)) {
      try {
        //console.log(lang, hljs.highlight(lang, str));
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    try { return hljs.highlightAuto(str).value; } catch (__) {}

    return '';
  };

  function mdInit() {
    mdHtml = new window.Remarkable(defaults);
    mdSrc = new window.Remarkable(defaults);

    // Beautify output of parser for html content
    mdHtml.renderer.rules.table_open = function () {
      return '<table class="table table-striped">\n';
    };
  }

  function updateResult() {
    var source = $('.source').val();
    $('.result').html(mdHtml.render(source));
    $('.result-src-content').text(mdSrc.render(source));
    try {
      if (source) {
        // serialize state - source and options
        permalink.href = '#md=' + encodeURIComponent(JSON.stringify({
          defaults: _.omit(defaults, 'highlight'),
          source: source
        }));
      } else {
        permalink.href = '';
      }
    } catch (__) {
      permalink.href = '';
    }
  }


  $(function() {
    // highlight snippet
    $('pre.code-sample code').each(function(i, block) {
      window.hljs.highlightBlock(block);
    });

    // Restore content if opened by permalink
    if (location.hash && location.hash.toString().slice(0,4) === '#md=') {
      try {
        var cfg = JSON.parse(decodeURIComponent(location.hash.slice(4)));

        if (_.isString(cfg.source)) {
          $('.source').val(cfg.source);
        }

        var opts = _.isObject(cfg.defaults) ? cfg.defaults : {};

        // copy config to defaults, but only if key exists
        // and value has the same type
        _.forOwn(opts, function (val, key) {
          if (!defaults.hasOwnProperty(key)) { return; }

          if ((_.isBoolean(defaults[key]) && _.isBoolean(val)) ||
              (_.isString(defaults[key]) && _.isString(val))) {
            defaults[key] = val;
          }
        });
      } catch (__) {}
    }

    // Activate tooltips
    $('._tip').tooltip({ container: 'body' });

    // Set default option values and option listeners
    _.forOwn(defaults, function (val, key) {
      if (key === 'highlight') { return; }

      var el = document.getElementById(key);

      if (!el) { return; }

      var $el = $(el);

      if (_.isBoolean(val)) {
        $el.prop('checked', val);
        $el.on('change', function () {
          defaults[key] = Boolean($el.prop('checked'));
          mdInit();
          updateResult();
        });

      } else {
        $(el).val(val);
        $el.on('change update keyup', function () {
          defaults[key] = String($(el).val());
          mdInit();
          updateResult();
        });
      }
    });

    // Set display mode for result
    if (defaults._src) {
      $('body').addClass('result-as-text');
    }


    mdInit();
    permalink = document.getElementById('permalink');

    // Setup listeners
    $('.source').on('keyup paste cut mouseup', updateResult);

    $('.source-clear').on('click', function (event) {
      $('.source').val('');
      updateResult();
      event.preventDefault();
    });

    $('.result-mode').on('click', function (event) {
      defaults._src = !defaults._src;
      $('body').toggleClass('result-as-text');
      // only to update permalink
      updateResult();
      event.preventDefault();
    });

    updateResult();
  });
})();
