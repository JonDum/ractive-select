(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RactiveSelect"] = factory();
	else
		root["RactiveSelect"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*******************************!*\
  !*** ./src/ractive-select.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./styles.styl */ 1);

	var debounce = __webpack_require__(/*! lodash/debounce */ 5);

	var win = window;
	var doc = document;

	var id = 'ractive-select-dropdown-container';
	var Keys = __webpack_require__(/*! ractive-events-keys */ 10);

	module.exports = Ractive.extend({

	    template: __webpack_require__(/*! ractive!./template.html */ 11),

	    isolated: true,

	    data: function() {
	        return {
	            selecting: -1,
	            open: false,
	            blockScrolling: true,
	        }
	    },

	    events: {
	        space: Keys.space,
	    },

	    decorators: {
	        preventOverscroll: __webpack_require__(/*! ./decorators/prevent-overscroll */ 12)
	    },

	    onrender: function() {

	        var self = this;

	        var select = self.find('select');

	        // set up a MutationObserve to watch for style changes that may affect layout
	        if(MutationObserver) {
	            var observer = new MutationObserver(function(mutations) {
	                self.updateItems();
	            });

	            observer.observe(select, {
	                childList: true,
	                attributes: true,
	                attributeFilter: ['style', 'class', 'id']
	            });
	        }

	        //hoist the dropdowns into a container on the body
	        var dropdown = self.find('.dropdown');

	        var container = doc.getElementById(id);

	        if (!container) {
	            container = doc.createElement('div');
	            container.id = id;
	            container.className = 'ractive-select';
	            doc.body.appendChild(container);
	        }

	        container.appendChild(dropdown);

	    },


	    oncomplete: function() {

	        var self = this;

	        var el = self.find('*');
	        var dropdown = self.find('.dropdown');

	        self.clickHandler = function(e) {

	            if(e.target.matches('.ractive-select *') || el.contains(e.target))
	                return;

	            self.set('open', false);

	        };

	        self.keyHandler = function(e) {

	            var selecting = self.get('selecting');
	            var _items = self.get('_items');

	            if(e.keyCode == 40) // down arrow
	                selecting++;
	            else
	            if(e.keyCode == 38) // up arrow
	                selecting--;

	            if(selecting > -1 && (e.keyCode == 13 || e.keyCode == 32)) { // enter/space
	                self.select();
	            }
	            else
	            if(e.keyCode == 40 || e.keyCode == 38) {
	                selecting = clamp(selecting, 0, _items.length - 1);
	                self.set('selecting', selecting);
	            }
	            else {
	                var letter = String.fromCharCode(e.keyCode);
	                if(letter) {


	                }
	            }

	        };

	        self.scrollHandler = function(e) {
	            requestAnimationFrame(function() {
	                updatePosition();
	            });
	        };

	        function updatePosition() {
	            if(!el) {
	                el = self.find('*');
	            }

	            var bounds = el.getBoundingClientRect();
	            var open = self.get('open');

	            if (open) {
	                dropdown.style.left = bounds.left + 'px';
	                dropdown.style.top = (bounds.bottom + 3) + 'px';
	            } else {
	                dropdown.style.left = '-9999px';;
	            }

	        }

	        self.observe('open', function(open) {

	            if (open) {

	                doc.addEventListener('mousedown', self.clickHandler);
	                doc.addEventListener('keyup', self.keyHandler);

	                win.addEventListener('scroll', self.scrollHandler, true);
	                //el.parentNode.addEventListener('scroll', self.scrollHandler, true);

	            } else {

	                doc.removeEventListener('mousedown', self.clickHandler);
	                doc.removeEventListener('keyup', self.keyHandler);

	                win.removeEventListener('scroll', self.scrollHandler);
	                //el.parentNode.removeEventListener('scroll', self.scrollHandler);

	                self.set('selecting', -1);
	            }

	            updatePosition();

	        }, {
	            defer: true
	        });

	        self.observe('value items', function(value) {

	            self.updateItems();

	        }, { defer: true });

	    },


	    onteardown: function() {

	        doc.removeEventListener('click', this.clickHandler);

	        // have to manually clean this up since we hoisted it from under ractive's nose
	        var dropdown = this.find('.dropdown');

	        if(dropdown) {
	            dropdown.parentNode.removeChild(dropdown);
	        }

	        var container = doc.getElementById(id);

	        if(container && container.childNodes.length == 0) {
	            container.parentNode.removeChild(container);
	        }

	        doc.removeEventListener('click', self.clickHandler);
	        doc.removeEventListener('keyup', self.keyHandler);

	    },

	    updateItems: function() {

	        var self = this;

	        var select = self.find('select');
	        var options = select.querySelectorAll('option');
	        var value = self.get('value');
	        var attr, label;

	        var items = self.get('items');

	        var newItems = [];

	        if (options && options.length > 0) {

	            for (var i = 0, len = options.length; i < len; i++) {
	                var opt = options[i];
	                attr = opt.getAttribute('value');
	                if (attr == value) {
	                    label = opt.textContent;
	                }
	                newItems.push({
	                    label: opt.textContent,
	                    value: attr,
	                    selected: opt.selected
	                });
	            }

	        }

	        self.set('label', label);
	        self.set('_items', newItems);

	        self.updateSize.call(self);

	    },

	    updateSize: function() {

	        var select = this.find('select');
	        var dropdown = this.find('.dropdown');
	        var el = this.find('div');
	        var label = this.find('label');

	        var computed = win.getComputedStyle(el);
	        dropdown.style.fontSize = computed.fontSize;

	        // we do this to push the arrows to the right,
	        // match the width of the dropdown and keep the
	        // focus circle from being all screwed up
	        el.style.minWidth = dropdown.style.minWidth =
	            Math.max(el.offsetWidth, dropdown.offsetWidth) + 'px';
	    },

	    open: function(details) {

	        if(details) {
	            var event = details.original;

	            if (event.target.matches('.ractive-select .dropdown *'))
	                return;
	        }

	        if (isTouchDevice())
	            return showDropdown(this.find('select'));

	        this.set('open', true);

	    },

	    close: function(details) {

	        this.set('open', false);

	    },

	    toggle: function(detials) {

	        var open = this.get('open');

	        if(open) {
	            if(this.get('selecting') > -1)
	                return;
	            this.set('open', false);
	        }
	        else
	            this.open();

	    },

	    select: function(details) {

	        var value, self = this;

	        if(details) {

	            var e = details.original;
	            var target = e.target;

	            if (target.nodeName !== 'LI')
	                target = target.parentNode;

	            if (target.nodeName !== 'LI')
	                return;

	            var valueAttribute = target.getAttribute('value');
	            var value = valueAttribute || target.textContent;

	        } else {

	            var selecting = self.get('selecting');
	            var _items = self.get('_items');
	            var item = _items[selecting];
	            value = item.value || item.label;

	        }

	        self.set('value', value);
	        self.fire('select', value);
	        self.fire('change', value);

	        self.close();

	    }



	});

	function showDropdown(element) {
	    var event = doc.createEvent('MouseEvents');
	    event.initMouseEvent('mousedown', true, true, win);
	    element.dispatchEvent(event);
	}

	function isTouchDevice() {
	    return ('ontouchstart' in win || 'onmsgesturechange' in win) && screen.width < 1200;
	}




/***/ },
/* 1 */
/*!*************************!*\
  !*** ./src/styles.styl ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(/*! !./../~/css-loader!./../~/stylus-loader!./styles.styl */ 2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../~/style-loader/addStyles.js */ 4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/*!**********************************************************!*\
  !*** ./~/css-loader!./~/stylus-loader!./src/styles.styl ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../~/css-loader/lib/css-base.js */ 3)();
	// imports


	// module
	exports.push([module.id, ".ractive-select {\n  display: inline-block;\n  position: relative;\n  cursor: default;\n  user-select: none;\n  padding: 0 0.3em;\n  overflow: hidden;\n  vertical-align: sub;\n  white-space: nowrap;\n}\n.ractive-select,\n.ractive-select *,\n.ractive-select *:before,\n.ractive-select *:after {\n  box-sizing: border-box;\n}\n.ractive-select label {\n  vertical-align: middle;\n  display: inline-block;\n}\n.ractive-select .arrows {\n  display: inline-block;\n  vertical-align: middle;\n  float: right;\n  margin-left: 0.5em;\n}\n.ractive-select .arrows:before,\n.ractive-select .arrows:after {\n  content: '';\n  display: block;\n  border: 0.25em solid transparent;\n}\n.ractive-select .arrows:before {\n  border-bottom-color: currentColor;\n  margin-bottom: 5px;\n}\n.ractive-select .arrows:after {\n  border-top-color: currentColor;\n}\n.ractive-select .dropdown {\n  margin: 2px 0 0 0;\n  background: #fff;\n  color: #333;\n  box-shadow: 0 3px 9px rgba(0,0,0,0.4);\n  border-radius: 3px;\n  padding: 2px 0;\n  cursor: default;\n  list-style: none;\n  z-index: 50;\n  max-height: 400px;\n  overflow-y: scroll;\n}\n.ractive-select li {\n  padding: 0.3em 0.5em 0.3em 1.5em;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  white-space: nowrap;\n}\n.ractive-select li[selected] {\n  padding: 0.3em 0.5em;\n}\n.ractive-select li .checkmark {\n  margin-right: 0.2em;\n}\n.ractive-select li .checkmark:before {\n  content: '\\2713';\n}\n.ractive-select li:hover,\n.ractive-select li.selecting {\n  background: linear-gradient(#3d96f5, #0d7cf2);\n  color: #fff;\n  border-top-color: #0a63c2;\n  border-bottom-color: #004a99;\n}\n#ractive-select-dropdown-container .dropdown {\n  position: fixed;\n  left: -9999px;\n}\n", ""]);

	// exports


/***/ },
/* 3 */
/*!**************************************!*\
  !*** ./~/css-loader/lib/css-base.js ***!
  \**************************************/
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/*!*************************************!*\
  !*** ./~/style-loader/addStyles.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/debounce.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(/*! ./isObject */ 6),
	    now = __webpack_require__(/*! ./now */ 7),
	    toNumber = __webpack_require__(/*! ./toNumber */ 8);

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide an options object to indicate whether `func` should be invoked on
	 * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent calls
	 * to the debounced function return the result of the last `func` invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
	 * on the trailing edge of the timeout only if the debounced function is
	 * invoked more than once during the `wait` timeout.
	 *
	 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
	 * for details over the differences between `_.debounce` and `_.throttle`.
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to debounce.
	 * @param {number} [wait=0] The number of milliseconds to delay.
	 * @param {Object} [options] The options object.
	 * @param {boolean} [options.leading=false] Specify invoking on the leading
	 *  edge of the timeout.
	 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
	 *  delayed before it's invoked.
	 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
	 *  edge of the timeout.
	 * @returns {Function} Returns the new debounced function.
	 * @example
	 *
	 * // Avoid costly calculations while the window size is in flux.
	 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	 *
	 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	 * jQuery(element).on('click', _.debounce(sendMail, 300, {
	 *   'leading': true,
	 *   'trailing': false
	 * }));
	 *
	 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	 * var source = new EventSource('/stream');
	 * jQuery(source).on('message', debounced);
	 *
	 * // Cancel the trailing debounced invocation.
	 * jQuery(window).on('popstate', debounced.cancel);
	 */
	function debounce(func, wait, options) {
	  var args,
	      maxTimeoutId,
	      result,
	      stamp,
	      thisArg,
	      timeoutId,
	      trailingCall,
	      lastCalled = 0,
	      leading = false,
	      maxWait = false,
	      trailing = true;

	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  wait = toNumber(wait) || 0;
	  if (isObject(options)) {
	    leading = !!options.leading;
	    maxWait = 'maxWait' in options && nativeMax(toNumber(options.maxWait) || 0, wait);
	    trailing = 'trailing' in options ? !!options.trailing : trailing;
	  }

	  function cancel() {
	    if (timeoutId) {
	      clearTimeout(timeoutId);
	    }
	    if (maxTimeoutId) {
	      clearTimeout(maxTimeoutId);
	    }
	    lastCalled = 0;
	    args = maxTimeoutId = thisArg = timeoutId = trailingCall = undefined;
	  }

	  function complete(isCalled, id) {
	    if (id) {
	      clearTimeout(id);
	    }
	    maxTimeoutId = timeoutId = trailingCall = undefined;
	    if (isCalled) {
	      lastCalled = now();
	      result = func.apply(thisArg, args);
	      if (!timeoutId && !maxTimeoutId) {
	        args = thisArg = undefined;
	      }
	    }
	  }

	  function delayed() {
	    var remaining = wait - (now() - stamp);
	    if (remaining <= 0 || remaining > wait) {
	      complete(trailingCall, maxTimeoutId);
	    } else {
	      timeoutId = setTimeout(delayed, remaining);
	    }
	  }

	  function flush() {
	    if ((timeoutId && trailingCall) || (maxTimeoutId && trailing)) {
	      result = func.apply(thisArg, args);
	    }
	    cancel();
	    return result;
	  }

	  function maxDelayed() {
	    complete(trailing, timeoutId);
	  }

	  function debounced() {
	    args = arguments;
	    stamp = now();
	    thisArg = this;
	    trailingCall = trailing && (timeoutId || !leading);

	    if (maxWait === false) {
	      var leadingCall = leading && !timeoutId;
	    } else {
	      if (!lastCalled && !maxTimeoutId && !leading) {
	        lastCalled = stamp;
	      }
	      var remaining = maxWait - (stamp - lastCalled);

	      var isCalled = (remaining <= 0 || remaining > maxWait) &&
	        (leading || maxTimeoutId);

	      if (isCalled) {
	        if (maxTimeoutId) {
	          maxTimeoutId = clearTimeout(maxTimeoutId);
	        }
	        lastCalled = stamp;
	        result = func.apply(thisArg, args);
	      }
	      else if (!maxTimeoutId) {
	        maxTimeoutId = setTimeout(maxDelayed, remaining);
	      }
	    }
	    if (isCalled && timeoutId) {
	      timeoutId = clearTimeout(timeoutId);
	    }
	    else if (!timeoutId && wait !== maxWait) {
	      timeoutId = setTimeout(delayed, wait);
	    }
	    if (leadingCall) {
	      isCalled = true;
	      result = func.apply(thisArg, args);
	    }
	    if (isCalled && !timeoutId && !maxTimeoutId) {
	      args = thisArg = undefined;
	    }
	    return result;
	  }
	  debounced.cancel = cancel;
	  debounced.flush = flush;
	  return debounced;
	}

	module.exports = debounce;


/***/ },
/* 6 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isObject.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 7 */
/*!**********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/now.js ***!
  \**********************************************************/
/***/ function(module, exports) {

	/**
	 * Gets the timestamp of the number of milliseconds that have elapsed since
	 * the Unix epoch (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @type {Function}
	 * @category Date
	 * @returns {number} Returns the timestamp.
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => logs the number of milliseconds it took for the deferred function to be invoked
	 */
	var now = Date.now;

	module.exports = now;


/***/ },
/* 8 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/toNumber.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(/*! ./isFunction */ 9),
	    isObject = __webpack_require__(/*! ./isObject */ 6);

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3);
	 * // => 3
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3');
	 * // => 3
	 */
	function toNumber(value) {
	  if (isObject(value)) {
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = toNumber;


/***/ },
/* 9 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isFunction.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(/*! ./isObject */ 6);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	module.exports = isFunction;


/***/ },
/* 10 */
/*!********************************************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/ractive-events-keys/dist/ractive-events-keys.js ***!
  \********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	(function (global, factory) {
		 true ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
		factory(global.Ractive.events)
	}(this, function (exports) { 'use strict';

		// TODO can we just declare the keydowhHandler once? using `this`?
		function makeKeyDefinition(code) {
			return function (node, fire) {
				function keydownHandler(event) {
					var which = event.which || event.keyCode;

					if (which === code) {
						event.preventDefault();

						fire({
							node: node,
							original: event
						});
					}
				}

				node.addEventListener('keydown', keydownHandler, false);

				return {
					teardown: function teardown() {
						node.removeEventListener('keydown', keydownHandler, false);
					}
				};
			};
		}

		var enter = makeKeyDefinition(13);
		var tab = makeKeyDefinition(9);
		var ractive_events_keys__escape = makeKeyDefinition(27);
		var space = makeKeyDefinition(32);

		var leftarrow = makeKeyDefinition(37);
		var rightarrow = makeKeyDefinition(39);
		var downarrow = makeKeyDefinition(40);
		var uparrow = makeKeyDefinition(38);

		exports.enter = enter;
		exports.tab = tab;
		exports.escape = ractive_events_keys__escape;
		exports.space = space;
		exports.leftarrow = leftarrow;
		exports.rightarrow = rightarrow;
		exports.downarrow = downarrow;
		exports.uparrow = uparrow;

	}));

/***/ },
/* 11 */
/*!**********************************************!*\
  !*** ./~/ractive-loader!./src/template.html ***!
  \**********************************************/
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":["ractive-select ",{"t":2,"r":"class"}],"style":[{"t":2,"r":"style"}],"tabindex":[{"t":2,"x":{"r":["tabindex"],"s":"_0||0"}}]},"v":{"click":{"m":"open","a":{"r":["event"],"s":"[_0]"}},"space":{"m":"toggle","a":{"r":[],"s":"[]"}}},"f":[{"t":7,"e":"label","f":[{"t":2,"x":{"r":["label","value","placeholder"],"s":"_0||_1||_2||\"Select...\""}}]}," ",{"t":7,"e":"div","a":{"class":"arrows"}}," ",{"t":7,"e":"select","a":{"style":"position: fixed; left: -9999px","value":[{"t":2,"r":".value"}],"tabindex":"-1"},"f":[{"t":4,"f":[{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"option","a":{"value":[{"t":2,"r":".value"}]},"f":[{"t":2,"r":".label"}]}],"n":50,"r":"./value"},{"t":4,"n":51,"f":[{"t":7,"e":"option","f":[{"t":2,"r":"."}]}],"r":"./value"}],"n":52,"r":"_items"}],"n":50,"r":"items"},{"t":4,"n":51,"f":[{"t":16}],"r":"items"}]}," ",{"t":7,"e":"ul","a":{"class":["dropdown",{"t":4,"f":[" open"],"n":50,"r":"open"}," ",{"t":2,"r":"class"}]},"v":{"click":{"m":"select","a":{"r":["event"],"s":"[_0]"}}},"f":[{"t":4,"f":[{"t":7,"e":"li","a":{"value":[{"t":2,"r":".value"}]},"m":[{"t":4,"f":["class='selecting'"],"n":50,"x":{"r":["selecting","@index"],"s":"_0==_1"}},{"t":4,"f":["selected"],"n":50,"r":"selected"}],"f":[{"t":4,"f":[{"t":7,"e":"span","a":{"class":"checkmark"}}],"n":50,"r":"selected"},{"t":2,"r":".label"}]}],"n":52,"r":"_items"}]}]}]};

/***/ },
/* 12 */
/*!**********************************************!*\
  !*** ./src/decorators/prevent-overscroll.js ***!
  \**********************************************/
/***/ function(module, exports) {

	
	var win = window;
	var doc = document;

	module.exports = function(node, instance) {

	    node.addEventListener('mouseenter', disableScroll);
	    node.addEventListener('mouseleave', enableScroll);

	    var contentHeight;

	    function preventDefault(e) {

	        e = e || win.event;
	        if( (node.scrollTop <= 1 && e.deltaY < 0) ||
	           (node.scrollTop >= contentHeight && e.deltaY > 0) ) {

	            if (e.preventDefault)
	                e.preventDefault();
	            e.returnValue = false;
	            return false;
	        }
	    }

	    function disableScroll() {
	        // cache height for perf and avoiding reflow/repaint
	        contentHeight = node.scrollHeight - node.offsetHeight - 1;

	        win.addEventListener('DOMMouseScroll', preventDefault, false);
	        win.addEventListener('wheel', preventDefault); // modern standard
	        win.addEventListener('mousewheel', preventDefault); // older browsers, IE
	        doc.addEventListener('mousewheel', preventDefault);
	        win.addEventListener('touchmove', preventDefault); // mobile
	    }

	    function enableScroll() {

	        win.removeEventListener('DOMMouseScroll', preventDefault, false);

	        win.removeEventListener('wheel', preventDefault); // modern standard
	        win.removeEventListener('mousewheel', preventDefault); // older browsers, IE
	        doc.removeEventListener('mousewheel', preventDefault);
	        win.removeEventListener('touchmove', preventDefault); // mobile
	    }

	    return {
	        teardown: function() {
	            node.removeEventListener('mouseenter', disableScroll);
	            node.removeEventListener('mouseleave', enableScroll);
	        }
	    }

	}


/***/ }
/******/ ])
});
;