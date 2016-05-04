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
	var find = __webpack_require__(/*! lodash/find */ 10);

	var win = window;
	var doc = document;

	var id = 'ractive-select-dropdown-container';
	var Keys = __webpack_require__(/*! ractive-events-keys */ 105);

	module.exports = Ractive.extend({

	    template: __webpack_require__(/*! ractive!./template.html */ 106),

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
	        preventOverscroll: __webpack_require__(/*! ./decorators/prevent-overscroll */ 107)
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

	        // if the previously selected item is not in the new items,
	        // take the first index as the new value
	        var selected = find(newItems, {value: value}) || find(newItems, {label: value});
	        if(!selected && newItems.length > 0)
	            self.set('value', newItems[0].value || newItems[0].label)

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

	            var value = target.getAttribute('value');

	            if(typeof value === 'undefined')
	                value = target.textContent;

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
	exports.push([module.id, ".ractive-select {\n  display: inline-block;\n  position: relative;\n  cursor: default;\n  user-select: none;\n  padding: 0 0.3em;\n  overflow: hidden;\n  vertical-align: sub;\n  white-space: nowrap;\n}\n.ractive-select,\n.ractive-select *,\n.ractive-select *:before,\n.ractive-select *:after {\n  box-sizing: border-box;\n}\n.ractive-select label {\n  vertical-align: middle;\n  display: inline-block;\n}\n.ractive-select .arrows {\n  display: inline-block;\n  vertical-align: middle;\n  float: right;\n  margin-left: 0.5em;\n}\n.ractive-select .arrows:before,\n.ractive-select .arrows:after {\n  content: '';\n  display: block;\n  border: 0.25em solid transparent;\n}\n.ractive-select .arrows:before {\n  border-bottom-color: currentColor;\n  margin-bottom: 5px;\n}\n.ractive-select .arrows:after {\n  border-top-color: currentColor;\n}\n.ractive-select .dropdown {\n  margin: 2px 0 0 0;\n  background: #fff;\n  color: #333;\n  box-shadow: 0 3px 9px rgba(0,0,0,0.4);\n  border-radius: 3px;\n  padding: 2px 0;\n  cursor: default;\n  list-style: none;\n  z-index: 50;\n  max-height: 400px;\n  overflow-y: auto;\n}\n.ractive-select li {\n  padding: 0.3em 0.5em 0.3em 1.5em;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  white-space: nowrap;\n}\n.ractive-select li[selected] {\n  padding: 0.3em 0.5em;\n}\n.ractive-select li .checkmark {\n  margin-right: 0.2em;\n}\n.ractive-select li .checkmark:before {\n  content: '\\2713';\n}\n.ractive-select li:hover,\n.ractive-select li.selecting {\n  background: linear-gradient(#3d96f5, #0d7cf2);\n  color: #fff;\n  border-top-color: #0a63c2;\n  border-bottom-color: #004a99;\n}\n#ractive-select-dropdown-container {\n  position: absolute;\n}\n#ractive-select-dropdown-container .dropdown {\n  position: fixed;\n  left: -9999px;\n  z-index: 500;\n}\n", ""]);

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
/*!***********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/find.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(/*! ./_baseEach */ 11),
	    baseFind = __webpack_require__(/*! ./_baseFind */ 32),
	    baseFindIndex = __webpack_require__(/*! ./_baseFindIndex */ 33),
	    baseIteratee = __webpack_require__(/*! ./_baseIteratee */ 34),
	    isArray = __webpack_require__(/*! ./isArray */ 27);

	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is invoked with three arguments:
	 * (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @category Collection
	 * @param {Array|Object} collection The collection to search.
	 * @param {Function|Object|string} [predicate=_.identity] The function invoked per iteration.
	 * @returns {*} Returns the matched element, else `undefined`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'age': 36, 'active': true },
	 *   { 'user': 'fred',    'age': 40, 'active': false },
	 *   { 'user': 'pebbles', 'age': 1,  'active': true }
	 * ];
	 *
	 * _.find(users, function(o) { return o.age < 40; });
	 * // => object for 'barney'
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.find(users, { 'age': 1, 'active': true });
	 * // => object for 'pebbles'
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.find(users, ['active', false]);
	 * // => object for 'fred'
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.find(users, 'active');
	 * // => object for 'barney'
	 */
	function find(collection, predicate) {
	  predicate = baseIteratee(predicate, 3);
	  if (isArray(collection)) {
	    var index = baseFindIndex(collection, predicate);
	    return index > -1 ? collection[index] : undefined;
	  }
	  return baseFind(collection, predicate, baseEach);
	}

	module.exports = find;


/***/ },
/* 11 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseEach.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(/*! ./_baseForOwn */ 12),
	    createBaseEach = __webpack_require__(/*! ./_createBaseEach */ 31);

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	module.exports = baseEach;


/***/ },
/* 12 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseForOwn.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(/*! ./_baseFor */ 13),
	    keys = __webpack_require__(/*! ./keys */ 15);

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ },
/* 13 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseFor.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(/*! ./_createBaseFor */ 14);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ },
/* 14 */
/*!*********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_createBaseFor.js ***!
  \*********************************************************************/
/***/ function(module, exports) {

	/**
	 * Creates a base function for methods like `_.forIn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ },
/* 15 */
/*!***********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/keys.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(/*! ./_baseHas */ 16),
	    baseKeys = __webpack_require__(/*! ./_baseKeys */ 17),
	    indexKeys = __webpack_require__(/*! ./_indexKeys */ 18),
	    isArrayLike = __webpack_require__(/*! ./isArrayLike */ 22),
	    isIndex = __webpack_require__(/*! ./_isIndex */ 29),
	    isPrototype = __webpack_require__(/*! ./_isPrototype */ 30);

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;

	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keys;


/***/ },
/* 16 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseHas.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Built-in value references. */
	var getPrototypeOf = Object.getPrototypeOf;

	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
	}

	module.exports = baseHas;


/***/ },
/* 17 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseKeys.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = Object.keys;

	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}

	module.exports = baseKeys;


/***/ },
/* 18 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_indexKeys.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(/*! ./_baseTimes */ 19),
	    isArguments = __webpack_require__(/*! ./isArguments */ 20),
	    isArray = __webpack_require__(/*! ./isArray */ 27),
	    isLength = __webpack_require__(/*! ./isLength */ 25),
	    isString = __webpack_require__(/*! ./isString */ 28);

	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}

	module.exports = indexKeys;


/***/ },
/* 19 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseTimes.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	module.exports = baseTimes;


/***/ },
/* 20 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isArguments.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(/*! ./isArrayLikeObject */ 21);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	module.exports = isArguments;


/***/ },
/* 21 */
/*!************************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isArrayLikeObject.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(/*! ./isArrayLike */ 22),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	module.exports = isArrayLikeObject;


/***/ },
/* 22 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isArrayLike.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(/*! ./_getLength */ 23),
	    isFunction = __webpack_require__(/*! ./isFunction */ 9),
	    isLength = __webpack_require__(/*! ./isLength */ 25);

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null &&
	    !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
	}

	module.exports = isArrayLike;


/***/ },
/* 23 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_getLength.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(/*! ./_baseProperty */ 24);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ },
/* 24 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseProperty.js ***!
  \********************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 25 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isLength.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 26 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isObjectLike.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 27 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isArray.js ***!
  \**************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = isArray;


/***/ },
/* 28 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isString.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(/*! ./isArray */ 27),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}

	module.exports = isString;


/***/ },
/* 29 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isIndex.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ },
/* 30 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isPrototype.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	module.exports = isPrototype;


/***/ },
/* 31 */
/*!**********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_createBaseEach.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(/*! ./isArrayLike */ 22);

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	module.exports = createBaseEach;


/***/ },
/* 32 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseFind.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of methods like `_.find` and `_.findKey`, without
	 * support for iteratee shorthands, which iterates over `collection` using
	 * `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @param {boolean} [retKey] Specify returning the key of the found element instead of the element itself.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFind(collection, predicate, eachFunc, retKey) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = retKey ? key : value;
	      return false;
	    }
	  });
	  return result;
	}

	module.exports = baseFind;


/***/ },
/* 33 */
/*!*********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseFindIndex.js ***!
  \*********************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromRight) {
	  var length = array.length,
	      index = fromRight ? length : -1;

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = baseFindIndex;


/***/ },
/* 34 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseIteratee.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(/*! ./_baseMatches */ 35),
	    baseMatchesProperty = __webpack_require__(/*! ./_baseMatchesProperty */ 88),
	    identity = __webpack_require__(/*! ./identity */ 102),
	    isArray = __webpack_require__(/*! ./isArray */ 27),
	    property = __webpack_require__(/*! ./property */ 103);

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  var type = typeof value;
	  if (type == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (type == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	module.exports = baseIteratee;


/***/ },
/* 35 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseMatches.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(/*! ./_baseIsMatch */ 36),
	    getMatchData = __webpack_require__(/*! ./_getMatchData */ 83);

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    var key = matchData[0][0],
	        value = matchData[0][1];

	    return function(object) {
	      if (object == null) {
	        return false;
	      }
	      return object[key] === value &&
	        (value !== undefined || (key in Object(object)));
	    };
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	module.exports = baseMatches;


/***/ },
/* 36 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseIsMatch.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(/*! ./_Stack */ 37),
	    baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ 69);

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack,
	          result = customizer ? customizer(objValue, srcValue, key, object, source, stack) : undefined;

	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ },
/* 37 */
/*!*************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Stack.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var stackClear = __webpack_require__(/*! ./_stackClear */ 38),
	    stackDelete = __webpack_require__(/*! ./_stackDelete */ 39),
	    stackGet = __webpack_require__(/*! ./_stackGet */ 43),
	    stackHas = __webpack_require__(/*! ./_stackHas */ 45),
	    stackSet = __webpack_require__(/*! ./_stackSet */ 47);

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function Stack(values) {
	  var index = -1,
	      length = values ? values.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = values[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add functions to the `Stack` cache.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	module.exports = Stack;


/***/ },
/* 38 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stackClear.js ***!
  \******************************************************************/
/***/ function(module, exports) {

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = { 'array': [], 'map': null };
	}

	module.exports = stackClear;


/***/ },
/* 39 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stackDelete.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocDelete = __webpack_require__(/*! ./_assocDelete */ 40);

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocDelete(array, key) : data.map['delete'](key);
	}

	module.exports = stackDelete;


/***/ },
/* 40 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_assocDelete.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ 41);

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the associative array.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function assocDelete(array, key) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = array.length - 1;
	  if (index == lastIndex) {
	    array.pop();
	  } else {
	    splice.call(array, index, 1);
	  }
	  return true;
	}

	module.exports = assocDelete;


/***/ },
/* 41 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_assocIndexOf.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(/*! ./eq */ 42);

	/**
	 * Gets the index at which the first occurrence of `key` is found in `array`
	 * of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	module.exports = assocIndexOf;


/***/ },
/* 42 */
/*!*********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/eq.js ***!
  \*********************************************************/
/***/ function(module, exports) {

	/**
	 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	module.exports = eq;


/***/ },
/* 43 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stackGet.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocGet = __webpack_require__(/*! ./_assocGet */ 44);

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocGet(array, key) : data.map.get(key);
	}

	module.exports = stackGet;


/***/ },
/* 44 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_assocGet.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ 41);

	/**
	 * Gets the associative array value for `key`.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function assocGet(array, key) {
	  var index = assocIndexOf(array, key);
	  return index < 0 ? undefined : array[index][1];
	}

	module.exports = assocGet;


/***/ },
/* 45 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stackHas.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocHas = __webpack_require__(/*! ./_assocHas */ 46);

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocHas(array, key) : data.map.has(key);
	}

	module.exports = stackHas;


/***/ },
/* 46 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_assocHas.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ 41);

	/**
	 * Checks if an associative array value for `key` exists.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function assocHas(array, key) {
	  return assocIndexOf(array, key) > -1;
	}

	module.exports = assocHas;


/***/ },
/* 47 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stackSet.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(/*! ./_MapCache */ 48),
	    assocSet = __webpack_require__(/*! ./_assocSet */ 67);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache object.
	 */
	function stackSet(key, value) {
	  var data = this.__data__,
	      array = data.array;

	  if (array) {
	    if (array.length < (LARGE_ARRAY_SIZE - 1)) {
	      assocSet(array, key, value);
	    } else {
	      data.array = null;
	      data.map = new MapCache(array);
	    }
	  }
	  var map = data.map;
	  if (map) {
	    map.set(key, value);
	  }
	  return this;
	}

	module.exports = stackSet;


/***/ },
/* 48 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_MapCache.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var mapClear = __webpack_require__(/*! ./_mapClear */ 49),
	    mapDelete = __webpack_require__(/*! ./_mapDelete */ 59),
	    mapGet = __webpack_require__(/*! ./_mapGet */ 63),
	    mapHas = __webpack_require__(/*! ./_mapHas */ 65),
	    mapSet = __webpack_require__(/*! ./_mapSet */ 66);

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function MapCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = values[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add functions to the `MapCache`.
	MapCache.prototype.clear = mapClear;
	MapCache.prototype['delete'] = mapDelete;
	MapCache.prototype.get = mapGet;
	MapCache.prototype.has = mapHas;
	MapCache.prototype.set = mapSet;

	module.exports = MapCache;


/***/ },
/* 49 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapClear.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(/*! ./_Hash */ 50),
	    Map = __webpack_require__(/*! ./_Map */ 55);

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': Map ? new Map : [],
	    'string': new Hash
	  };
	}

	module.exports = mapClear;


/***/ },
/* 50 */
/*!************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Hash.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ 51);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Creates an hash object.
	 *
	 * @private
	 * @constructor
	 * @returns {Object} Returns the new hash object.
	 */
	function Hash() {}

	// Avoid inheriting from `Object.prototype` when possible.
	Hash.prototype = nativeCreate ? nativeCreate(null) : objectProto;

	module.exports = Hash;


/***/ },
/* 51 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_nativeCreate.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ./_getNative */ 52);

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

	module.exports = nativeCreate;


/***/ },
/* 52 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_getNative.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(/*! ./isNative */ 53);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ },
/* 53 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isNative.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(/*! ./isFunction */ 9),
	    isHostObject = __webpack_require__(/*! ./_isHostObject */ 54),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(funcToString.call(value));
	  }
	  return isObjectLike(value) &&
	    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	module.exports = isNative;


/***/ },
/* 54 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isHostObject.js ***!
  \********************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	module.exports = isHostObject;


/***/ },
/* 55 */
/*!***********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Map.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ./_getNative */ 52),
	    root = __webpack_require__(/*! ./_root */ 56);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;


/***/ },
/* 56 */
/*!************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_root.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {var checkGlobal = __webpack_require__(/*! ./_checkGlobal */ 58);

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();

	module.exports = root;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../../../../Creative/Projects/ractive-select/~/webpack/buildin/module.js */ 57)(module), (function() { return this; }())))

/***/ },
/* 57 */
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 58 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_checkGlobal.js ***!
  \*******************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	module.exports = checkGlobal;


/***/ },
/* 59 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapDelete.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(/*! ./_Map */ 55),
	    assocDelete = __webpack_require__(/*! ./_assocDelete */ 40),
	    hashDelete = __webpack_require__(/*! ./_hashDelete */ 60),
	    isKeyable = __webpack_require__(/*! ./_isKeyable */ 62);

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapDelete(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashDelete(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map['delete'](key) : assocDelete(data.map, key);
	}

	module.exports = mapDelete;


/***/ },
/* 60 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_hashDelete.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var hashHas = __webpack_require__(/*! ./_hashHas */ 61);

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(hash, key) {
	  return hashHas(hash, key) && delete hash[key];
	}

	module.exports = hashDelete;


/***/ },
/* 61 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_hashHas.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ 51);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @param {Object} hash The hash to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(hash, key) {
	  return nativeCreate ? hash[key] !== undefined : hasOwnProperty.call(hash, key);
	}

	module.exports = hashHas;


/***/ },
/* 62 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isKeyable.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return type == 'number' || type == 'boolean' ||
	    (type == 'string' && value != '__proto__') || value == null;
	}

	module.exports = isKeyable;


/***/ },
/* 63 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapGet.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(/*! ./_Map */ 55),
	    assocGet = __webpack_require__(/*! ./_assocGet */ 44),
	    hashGet = __webpack_require__(/*! ./_hashGet */ 64),
	    isKeyable = __webpack_require__(/*! ./_isKeyable */ 62);

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapGet(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashGet(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map.get(key) : assocGet(data.map, key);
	}

	module.exports = mapGet;


/***/ },
/* 64 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_hashGet.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ 51);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @param {Object} hash The hash to query.
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(hash, key) {
	  if (nativeCreate) {
	    var result = hash[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(hash, key) ? hash[key] : undefined;
	}

	module.exports = hashGet;


/***/ },
/* 65 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapHas.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(/*! ./_Map */ 55),
	    assocHas = __webpack_require__(/*! ./_assocHas */ 46),
	    hashHas = __webpack_require__(/*! ./_hashHas */ 61),
	    isKeyable = __webpack_require__(/*! ./_isKeyable */ 62);

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapHas(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashHas(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map.has(key) : assocHas(data.map, key);
	}

	module.exports = mapHas;


/***/ },
/* 66 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapSet.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(/*! ./_Map */ 55),
	    assocSet = __webpack_require__(/*! ./_assocSet */ 67),
	    hashSet = __webpack_require__(/*! ./_hashSet */ 68),
	    isKeyable = __webpack_require__(/*! ./_isKeyable */ 62);

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache object.
	 */
	function mapSet(key, value) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    hashSet(typeof key == 'string' ? data.string : data.hash, key, value);
	  } else if (Map) {
	    data.map.set(key, value);
	  } else {
	    assocSet(data.map, key, value);
	  }
	  return this;
	}

	module.exports = mapSet;


/***/ },
/* 67 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_assocSet.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ 41);

	/**
	 * Sets the associative array `key` to `value`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 */
	function assocSet(array, key, value) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    array.push([key, value]);
	  } else {
	    array[index][1] = value;
	  }
	}

	module.exports = assocSet;


/***/ },
/* 68 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_hashSet.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ 51);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 */
	function hashSet(hash, key, value) {
	  hash[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	}

	module.exports = hashSet;


/***/ },
/* 69 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseIsEqual.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ 70),
	    isObject = __webpack_require__(/*! ./isObject */ 6),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}

	module.exports = baseIsEqual;


/***/ },
/* 70 */
/*!***********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseIsEqualDeep.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(/*! ./_Stack */ 37),
	    equalArrays = __webpack_require__(/*! ./_equalArrays */ 71),
	    equalByTag = __webpack_require__(/*! ./_equalByTag */ 73),
	    equalObjects = __webpack_require__(/*! ./_equalObjects */ 78),
	    getTag = __webpack_require__(/*! ./_getTag */ 79),
	    isArray = __webpack_require__(/*! ./isArray */ 27),
	    isHostObject = __webpack_require__(/*! ./_isHostObject */ 54),
	    isTypedArray = __webpack_require__(/*! ./isTypedArray */ 82);

	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = getTag(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;

	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag, equalFunc, customizer, bitmask);
	  }
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	  if (!isPartial) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, bitmask, stack);
	}

	module.exports = baseIsEqualDeep;


/***/ },
/* 71 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_equalArrays.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var arraySome = __webpack_require__(/*! ./_arraySome */ 72);

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var index = -1,
	      isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      isUnordered = bitmask & UNORDERED_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(array, other);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (isUnordered) {
	      if (!arraySome(other, function(othValue) {
	            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack);
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  return result;
	}

	module.exports = equalArrays;


/***/ },
/* 72 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_arraySome.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check, else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arraySome;


/***/ },
/* 73 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_equalByTag.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(/*! ./_Symbol */ 74),
	    Uint8Array = __webpack_require__(/*! ./_Uint8Array */ 75),
	    mapToArray = __webpack_require__(/*! ./_mapToArray */ 76),
	    setToArray = __webpack_require__(/*! ./_setToArray */ 77);

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = Symbol ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask) {
	  switch (tag) {
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object) ? other != +other : object == +other;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);

	      // Recursively compare objects (susceptible to call stack limits).
	      return (isPartial || object.size == other.size) &&
	        equalFunc(convert(object), convert(other), customizer, bitmask | UNORDERED_COMPARE_FLAG);

	    case symbolTag:
	      return !!Symbol && (symbolValueOf.call(object) == symbolValueOf.call(other));
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ },
/* 74 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Symbol.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(/*! ./_root */ 56);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ },
/* 75 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Uint8Array.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(/*! ./_root */ 56);

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

	module.exports = Uint8Array;


/***/ },
/* 76 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_mapToArray.js ***!
  \******************************************************************/
/***/ function(module, exports) {

	/**
	 * Converts `map` to an array.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	module.exports = mapToArray;


/***/ },
/* 77 */
/*!******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_setToArray.js ***!
  \******************************************************************/
/***/ function(module, exports) {

	/**
	 * Converts `set` to an array.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	module.exports = setToArray;


/***/ },
/* 78 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_equalObjects.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(/*! ./_baseHas */ 16),
	    keys = __webpack_require__(/*! ./keys */ 15);

	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : baseHas(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  return result;
	}

	module.exports = equalObjects;


/***/ },
/* 79 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_getTag.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(/*! ./_Map */ 55),
	    Set = __webpack_require__(/*! ./_Set */ 80),
	    WeakMap = __webpack_require__(/*! ./_WeakMap */ 81);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect maps, sets, and weakmaps. */
	var mapCtorString = Map ? funcToString.call(Map) : '',
	    setCtorString = Set ? funcToString.call(Set) : '',
	    weakMapCtorString = WeakMap ? funcToString.call(WeakMap) : '';

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}

	// Fallback for IE 11 providing `toStringTag` values for maps, sets, and weakmaps.
	if ((Map && getTag(new Map) != mapTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : null,
	        ctorString = typeof Ctor == 'function' ? funcToString.call(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case mapCtorString: return mapTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	module.exports = getTag;


/***/ },
/* 80 */
/*!***********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_Set.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ./_getNative */ 52),
	    root = __webpack_require__(/*! ./_root */ 56);

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	module.exports = Set;


/***/ },
/* 81 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_WeakMap.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ./_getNative */ 52),
	    root = __webpack_require__(/*! ./_root */ 56);

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	module.exports = WeakMap;


/***/ },
/* 82 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isTypedArray.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(/*! ./isLength */ 25),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}

	module.exports = isTypedArray;


/***/ },
/* 83 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_getMatchData.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(/*! ./_isStrictComparable */ 84),
	    toPairs = __webpack_require__(/*! ./toPairs */ 85);

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = toPairs(object),
	      length = result.length;

	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}

	module.exports = getMatchData;


/***/ },
/* 84 */
/*!**************************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isStrictComparable.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(/*! ./isObject */ 6);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	module.exports = isStrictComparable;


/***/ },
/* 85 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/toPairs.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseToPairs = __webpack_require__(/*! ./_baseToPairs */ 86),
	    keys = __webpack_require__(/*! ./keys */ 15);

	/**
	 * Creates an array of own enumerable key-value pairs for `object` which
	 * can be consumed by `_.fromPairs`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the new array of key-value pairs.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.toPairs(new Foo);
	 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
	 */
	function toPairs(object) {
	  return baseToPairs(object, keys(object));
	}

	module.exports = toPairs;


/***/ },
/* 86 */
/*!*******************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseToPairs.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(/*! ./_arrayMap */ 87);

	/**
	 * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
	 * of key-value pairs for `object` corresponding to the property names of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the new array of key-value pairs.
	 */
	function baseToPairs(object, props) {
	  return arrayMap(props, function(key) {
	    return [key, object[key]];
	  });
	}

	module.exports = baseToPairs;


/***/ },
/* 87 */
/*!****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_arrayMap.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;


/***/ },
/* 88 */
/*!***************************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseMatchesProperty.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ 69),
	    get = __webpack_require__(/*! ./get */ 89),
	    hasIn = __webpack_require__(/*! ./hasIn */ 96);

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ },
/* 89 */
/*!**********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/get.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(/*! ./_baseGet */ 90);

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined` the `defaultValue` is used in its place.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	module.exports = get;


/***/ },
/* 90 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseGet.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseCastPath = __webpack_require__(/*! ./_baseCastPath */ 91),
	    isKey = __webpack_require__(/*! ./_isKey */ 95);

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path + ''] : baseCastPath(path);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[path[index++]];
	  }
	  return (index && index == length) ? object : undefined;
	}

	module.exports = baseGet;


/***/ },
/* 91 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseCastPath.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(/*! ./isArray */ 27),
	    stringToPath = __webpack_require__(/*! ./_stringToPath */ 92);

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function baseCastPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}

	module.exports = baseCastPath;


/***/ },
/* 92 */
/*!********************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_stringToPath.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(/*! ./toString */ 93);

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	function stringToPath(string) {
	  var result = [];
	  toString(string).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	}

	module.exports = stringToPath;


/***/ },
/* 93 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/toString.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(/*! ./_Symbol */ 74),
	    isSymbol = __webpack_require__(/*! ./isSymbol */ 94);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = Symbol ? symbolProto.toString : undefined;

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (value == null) {
	    return '';
	  }
	  if (isSymbol(value)) {
	    return Symbol ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = toString;


/***/ },
/* 94 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isSymbol.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(/*! ./isObjectLike */ 26);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	module.exports = isSymbol;


/***/ },
/* 95 */
/*!*************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_isKey.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(/*! ./isArray */ 27);

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (typeof value == 'number') {
	    return true;
	  }
	  return !isArray(value) &&
	    (reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	      (object != null && value in Object(object)));
	}

	module.exports = isKey;


/***/ },
/* 96 */
/*!************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/hasIn.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(/*! ./_baseHasIn */ 97),
	    hasPath = __webpack_require__(/*! ./_hasPath */ 98);

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': _.create({ 'c': 3 }) }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b.c');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b', 'c']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return hasPath(object, path, baseHasIn);
	}

	module.exports = hasIn;


/***/ },
/* 97 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseHasIn.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return key in Object(object);
	}

	module.exports = baseHasIn;


/***/ },
/* 98 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_hasPath.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseCastPath = __webpack_require__(/*! ./_baseCastPath */ 91),
	    isArguments = __webpack_require__(/*! ./isArguments */ 20),
	    isArray = __webpack_require__(/*! ./isArray */ 27),
	    isIndex = __webpack_require__(/*! ./_isIndex */ 29),
	    isKey = __webpack_require__(/*! ./_isKey */ 95),
	    isLength = __webpack_require__(/*! ./isLength */ 25),
	    isString = __webpack_require__(/*! ./isString */ 28),
	    last = __webpack_require__(/*! ./last */ 99),
	    parent = __webpack_require__(/*! ./_parent */ 100);

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  if (object == null) {
	    return false;
	  }
	  var result = hasFunc(object, path);
	  if (!result && !isKey(path)) {
	    path = baseCastPath(path);
	    object = parent(object, path);
	    if (object != null) {
	      path = last(path);
	      result = hasFunc(object, path);
	    }
	  }
	  var length = object ? object.length : undefined;
	  return result || (
	    !!length && isLength(length) && isIndex(path, length) &&
	    (isArray(object) || isString(object) || isArguments(object))
	  );
	}

	module.exports = hasPath;


/***/ },
/* 99 */
/*!***********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/last.js ***!
  \***********************************************************/
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}

	module.exports = last;


/***/ },
/* 100 */
/*!**************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_parent.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseSlice = __webpack_require__(/*! ./_baseSlice */ 101),
	    get = __webpack_require__(/*! ./get */ 89);

	/**
	 * Gets the parent value at `path` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path to get the parent value of.
	 * @returns {*} Returns the parent value.
	 */
	function parent(object, path) {
	  return path.length == 1 ? object : get(object, baseSlice(path, 0, -1));
	}

	module.exports = parent;


/***/ },
/* 101 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_baseSlice.js ***!
  \*****************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;

	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}

	module.exports = baseSlice;


/***/ },
/* 102 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/identity.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	/**
	 * This method returns the first argument given to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ },
/* 103 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/property.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(/*! ./_baseProperty */ 24),
	    basePropertyDeep = __webpack_require__(/*! ./_basePropertyDeep */ 104),
	    isKey = __webpack_require__(/*! ./_isKey */ 95);

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': { 'c': 2 } } },
	 *   { 'a': { 'b': { 'c': 1 } } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b.c'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	}

	module.exports = property;


/***/ },
/* 104 */
/*!************************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/_basePropertyDeep.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(/*! ./_baseGet */ 90);

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	module.exports = basePropertyDeep;


/***/ },
/* 105 */
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
/* 106 */
/*!**********************************************!*\
  !*** ./~/ractive-loader!./src/template.html ***!
  \**********************************************/
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":["ractive-select ",{"t":2,"r":"class"}],"style":[{"t":2,"r":"style"}],"tabindex":[{"t":2,"x":{"r":["tabindex"],"s":"_0||0"}}]},"v":{"click":{"m":"open","a":{"r":["event"],"s":"[_0]"}},"space":{"m":"toggle","a":{"r":[],"s":"[]"}}},"f":[{"t":7,"e":"label","f":[{"t":2,"x":{"r":["label","value","placeholder"],"s":"_0||_1||_2||\"Select...\""}}]}," ",{"t":7,"e":"div","a":{"class":"arrows"}}," ",{"t":7,"e":"select","a":{"style":"position: fixed; left: -9999px","value":[{"t":2,"r":".value"}],"tabindex":"-1"},"f":[{"t":4,"f":[{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"option","a":{"value":[{"t":2,"r":".value"}]},"f":[{"t":2,"r":".label"}]}],"n":50,"r":"./value"},{"t":4,"n":51,"f":[{"t":7,"e":"option","f":[{"t":2,"r":"."}]}],"r":"./value"}],"n":52,"r":"_items"}],"n":50,"r":"items"},{"t":4,"n":51,"f":[{"t":16}],"r":"items"}]}," ",{"t":7,"e":"ul","a":{"class":["dropdown",{"t":4,"f":[" open"],"n":50,"r":"open"}," ",{"t":2,"r":"class"}]},"v":{"click":{"m":"select","a":{"r":["event"],"s":"[_0]"}}},"f":[{"t":4,"f":[{"t":7,"e":"li","a":{"value":[{"t":2,"r":".value"}]},"m":[{"t":4,"f":["class='selecting'"],"n":50,"x":{"r":["selecting","@index"],"s":"_0==_1"}},{"t":4,"f":["selected"],"n":50,"r":"selected"}],"f":[{"t":4,"f":[{"t":7,"e":"span","a":{"class":"checkmark"}}],"n":50,"r":"selected"},{"t":2,"r":".label"}]}],"n":52,"r":"_items"}]}]}]};

/***/ },
/* 107 */
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