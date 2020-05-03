/*
 * jQuery.autopager v1.0.0
 *
 * Copyright (c) lagos
 * Dual licensed under the MIT and GPL licenses.
 */
(function($) {
	var window = this, options = {},
		content, currentUrl, nextUrl,
		active = false,
		defaults = {
			autoLoad: true,
			page: 1,
			content: '.content',
			link: 'a[rel=next]',
			insertBefore: null, 
			appendTo: null, 
			start: function() {},
			load: function() {},
			disabled: false
		};

	$.autopager = function(_options) {
		var autopager = this.autopager;

		if (typeof _options === 'string' && $.isFunction(autopager[_options])) {
			var args = Array.prototype.slice.call(arguments, 1),
				value = autopager[_options].apply(autopager, args);

			return value === autopager || value === undefined ? this : value;
		}

		_options = $.extend({}, defaults, _options);
		autopager.option(_options);

		content = $(_options.content).filter(':last');
		if (content.length) {
			if (!_options.insertBefore && !_options.appendTo) {
				var insertBefore = content.next();
				if (insertBefore.length) {
					set('insertBefore', insertBefore);
				} else {
					set('appendTo', content.parent());
				}
			}
		}

		setUrl();

		return this;
	};

	$.extend($.autopager, {
		option: function(key, value) {
			var _options = key;

			if (typeof key === "string") {
				if (value === undefined) {
					return options[key];
				}
				_options = {};
				_options[key] = value;
			}

			$.each(_options, function(key, value) {
				set(key, value);
			});
			return this;
		},

		enable: function() {
			set('disabled', false);
			return this;
		},

		disable: function() {
			set('disabled', true);
			return this;
		},

		destroy: function() {
			this.autoLoad(false);
			options = {};
			content = currentUrl = nextUrl = undefined;
			return this;
		},

		autoLoad: function(value) {
			return this.option('autoLoad', value);
		},

		load: function() {
			if (active || !nextUrl || options.disabled) {
				return;
			}

			active = true;
			options.start(currentHash(), nextHash());
			$.get(nextUrl, insertContent);
			return this;
		}

	});

	function set(key, value) {
		switch (key) {
			case 'autoLoad':
				if (value && !options.autoLoad) {
					$(window).scroll(loadOnScroll);
				} else if (!value && options.autoLoad) {
					$(window).unbind('scroll', loadOnScroll);
				}
				break;
			case 'insertBefore':
				if (value) {
					options.appendTo = null;
				}
				break
			case 'appendTo':
				if (value) {
					options.insertBefore = null;
				}
				break
		}
		options[key] = value;
	}

	function setUrl(context) {
		currentUrl = nextUrl || window.location.href;
		nextUrl = $(options.link, context).attr('href');
	}

	function loadOnScroll() {
		if (content.offset().top + content.height() < $(document).scrollTop() + $(window).height()) {
			$.autopager.load();
		}
	}

	function insertContent(res) {
		var _options = options,
			nextPage = $('<div/>').append(res.replace(/<script(.|\s)*?\/script>/g, "")),
			nextContent = nextPage.find(_options.content); 

		set('page', _options.page + 1);
		setUrl(nextPage);
		if (nextContent.length) {
			if (_options.insertBefore) {
				nextContent.insertBefore(_options.insertBefore);
			} else {
				nextContent.appendTo(_options.appendTo);
			}
			_options.load.call(nextContent.get(), currentHash(), nextHash());
			content = nextContent.filter(':last');
		}
		active = false;
	}

	function currentHash() {
		return {
			page: options.page,
			url: currentUrl
		};
	}

	function nextHash() {
		return {
			page: options.page + 1,
			url: nextUrl
		};
	}
})(jQuery);
;
// $Id:

(function ($) {
var views_infinite_scroll_was_initialised = false;
Drupal.behaviors.views_infinite_scroll = {
  attach:function() {
    // Make sure that autopager plugin is loaded
    if($.autopager) {
      if(!views_infinite_scroll_was_initialised) {
        views_infinite_scroll_was_initialised = true;
        // There should not be multiple Infinite Scroll Views on the same page
        if(Drupal.settings.views_infinite_scroll.length == 1) { 
          var settings = Drupal.settings.views_infinite_scroll[0];
          var use_ajax = false;
          // Make sure that views ajax is disabled
          if(Drupal.settings.views && Drupal.settings.views.ajaxViews) {
            $.each(Drupal.settings.views.ajaxViews, function(key, value) {
              if((value.view_name == settings.view_name) && (value.view_display_id == settings.display)) {
                use_ajax = true;
              }
            });
          }
          if(!use_ajax) {
            var view_selector    = 'div.view-id-' + settings.view_name + '.view-display-id-' + settings.display;
            var content_selector = view_selector + ' > ' + settings.content_selector;
            var items_selector   = content_selector + ' ' + settings.items_selector;
            var pager_selector   = view_selector + ' > div.item-list ' + settings.pager_selector;
            var next_selector    = view_selector + ' ' + settings.next_selector;
            var img_location     = view_selector + ' > div.view-content';
            var img_path         = settings.img_path;
            var img              = '<div id="views_infinite_scroll-ajax-loader"><img src="' + img_path + '" alt="loading..."/></div>';
            $(pager_selector).hide();
            var handle = $.autopager({
              appendTo: content_selector,
              content: items_selector,
              link: next_selector,
              page: 0,
              start: function() {
                $(img_location).after(img);
              },
              load: function() {
                $('div#views_infinite_scroll-ajax-loader').remove();
                Drupal.attachBehaviors(this);
              }
            });

            // Trigger autoload if content height is less than doc height already
            var prev_content_height = $(content_selector).height();
            do {
              var last = $(items_selector).filter(':last');
              if(last.offset().top + last.height() < $(document).scrollTop() + $(window).height()) {
                last = $(items_selector).filter(':last');
                handle.autopager('load');
              }
              else {
                break;
              }
            }
            while ($(content_selector).height() > prev_content_height);

          }
          else {  
            alert(Drupal.t('Views infinite scroll pager is not compatible with Ajax Views. Please disable "Use Ajax" option.'));
          }
        }
        else if(Drupal.settings.views_infinite_scroll.length > 1) {
          alert(Drupal.t('Views Infinite Scroll module can\'t handle more than one infinite view in the same page.'));
        }
      }
    }
    else {
      alert(Drupal.t('Autopager jquery plugin in not loaded.'));
    }
  }
}

})(jQuery);
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Downloads",
            "eventAction": Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(),
            "eventLabel": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", {
            "hitType": "pageview",
            "page": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Mails",
            "eventAction": "Click",
            "eventLabel": this.href.substring(7),
            "transport": "beacon"
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", {
              "hitType": "event",
              "eventCategory": "Outbound links",
              "eventAction": "Click",
              "eventLabel": this.href,
              "transport": "beacon"
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga("send", {
        "hitType": "pageview",
        "page": location.pathname + location.search + location.hash
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        ga("send", {
          "hitType": "pageview",
          "page": Drupal.googleanalytics.getPageUrl(href)
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
