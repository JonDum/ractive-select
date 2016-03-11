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

	eval("__webpack_require__(/*! ./styles.styl */ 1);\n\nvar debounce = __webpack_require__(/*! lodash/debounce */ 5);\n\nvar win = window;\nvar doc = document;\n\nvar id = 'ractive-select-dropdown-container';\n\nmodule.exports = Ractive.extend({\n\n    template: __webpack_require__(/*! ./template.html */ 10),\n\n    isolated: true,\n\n    data: function() {\n        return {\n\n            open: false,\n\n            blockScrolling: true,\n\n        }\n    },\n\n    onrender: function() {\n\n        var self = this;\n\n        var select = self.find('select');\n\n        // set up a MutationObserve to watch for style changes that may affect layout\n        if(MutationObserver) {\n            var observer = new MutationObserver(function(mutations) {\n                self.updateItems();\n            });\n\n            observer.observe(select, {\n                childList: true,\n                attributes: true,\n                attributeFilter: ['style', 'class', 'id']\n            });\n        }\n\n        //hoist the dropdowns into a container on the body\n        var dropdown = self.find('.dropdown');\n\n        var container = doc.getElementById(id);\n\n        if (!container) {\n            container = doc.createElement('div');\n            container.id = id;\n            container.className = 'ractive-select';\n            doc.body.appendChild(container);\n        }\n\n        container.appendChild(dropdown);\n\n    },\n\n\n    oncomplete: function() {\n\n        var self = this;\n\n        var el = self.find('*');\n        var dropdown = self.find('.dropdown');\n\n        self.clickHandler = function(e) {\n\n            if (el.contains(e.target))\n                return;\n\n            self.set('open', false);\n\n        };\n\n        function updatePosition() {\n\n            var bounds = el.getBoundingClientRect();\n            var open = self.get('open');\n\n            if (open) {\n                dropdown.style.left = bounds.left + 'px';\n                dropdown.style.top = (bounds.bottom + 3) + 'px';\n            } else {\n                dropdown.style.left = '-9999px';;\n            }\n\n        }\n\n        self.observe('open', function(open) {\n\n            var blockScrolling = self.get('blockScrolling');\n\n            if (open) {\n\n                doc.addEventListener('click', self.clickHandler);\n\n                if(blockScrolling)\n                    disableScroll();\n\n            } else {\n\n                doc.removeEventListener('click', self.clickHandler);\n\n                if(blockScrolling)\n                    enableScroll();\n            }\n\n            updatePosition();\n\n        }, {\n            defer: true\n        });\n\n        self.observe('value items', function(value) {\n\n            self.updateItems();\n\n        }, { defer: true });\n\n    },\n\n\n    onteardown: function() {\n\n        doc.removeEventListener('click', this.clickHandler);\n\n        // have to manually clean this up since we hoisted it from under ractive's nose\n        var dropdown = this.find('.dropdown');\n\n        if(dropdown) {\n            dropdown.parentNode.removeChild(dropdown);\n        }\n\n        var container = doc.getElementById(id);\n\n        if(container && container.childNodes.length == 0) {\n            container.parentNode.removeChild(container);\n        }\n\n\n    },\n\n    updateItems: function() {\n\n        var self = this;\n\n        var select = self.find('select');\n        var options = select.querySelectorAll('option');\n        var value = self.get('value');\n        var attr, label;\n\n        var items = self.get('items');\n\n        var newItems = [];\n\n        if (options && options.length > 0) {\n\n            for (var i = 0, len = options.length; i < len; i++) {\n                var opt = options[i];\n                attr = opt.getAttribute('value');\n                if (attr == value) {\n                    label = opt.textContent;\n                }\n                newItems.push({\n                    label: opt.textContent,\n                    value: attr,\n                    selected: opt.selected\n                });\n            }\n\n        }\n\n        self.set('label', label);\n        self.set('_items', newItems);\n\n        self.updateSize.call(self);\n\n    },\n\n    updateSize: function() {\n\n        var select = this.find('select');\n        var dropdown = this.find('.dropdown');\n        var el = this.find('div');\n        var label = this.find('label');\n\n        var computed = win.getComputedStyle(el);\n        dropdown.style.fontSize = computed.fontSize;\n\n        el.style.minWidth = dropdown.offsetWidth + 'px';\n\n        if (select.style.maxWidth)\n            label.style.maxWidth = select.style.maxWidth;\n    },\n\n    open: function(details) {\n\n        var event = details.original;\n\n        if (event.target.matches('.ractive-select .dropdown *'))\n            return;\n\n        if (isTouchDevice())\n            return showDropdown(this.find('select'));\n\n        this.set('open', true);\n\n    },\n\n    close: function(details) {\n\n        this.set('open', false);\n\n    },\n\n    select: function(details) {\n\n        var e = details.original;\n        var target = e.target;\n\n        if (target.nodeName !== 'LI')\n            target = target.parentNode;\n\n        if (target.nodeName !== 'LI')\n            return;\n\n        var valueAttribute = target.getAttribute('value');\n\n        var value = valueAttribute || target.textContent;\n\n        this.set('value', value);\n        this.fire('select', value);\n        this.fire('change', value);\n\n        this.close();\n\n    }\n\n\n\n});\n\nfunction showDropdown(element) {\n    var event = doc.createEvent('MouseEvents');\n    event.initMouseEvent('mousedown', true, true, win);\n    element.dispatchEvent(event);\n}\n\nfunction isTouchDevice() {\n    return ('ontouchstart' in win || 'onmsgesturechange' in win) && screen.width < 1200;\n}\n\n\n// block scrolling - from SO\n\n// left: 37, up: 38, right: 39, down: 40,\n// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36\nvar keys = {\n    37: 1,\n    38: 1,\n    39: 1,\n    40: 1\n};\n\nfunction preventDefault(e) {\n    e = e || win.event;\n    if (e.preventDefault)\n        e.preventDefault();\n    e.returnValue = false;\n}\n\nfunction preventDefaultForScrollKeys(e) {\n    if (keys[e.keyCode]) {\n        preventDefault(e);\n        return false;\n    }\n}\n\nfunction disableScroll() {\n    win.addEventListener('DOMMouseScroll', preventDefault, false);\n    win.addEventListener('wheel', preventDefault); // modern standard\n    win.addEventListener('mousewheel', preventDefault); // older browsers, IE\n    doc.addEventListener('mousewheel', preventDefault);\n    win.addEventListener('touchmove', preventDefault); // mobile\n    doc.addEventListener('keydown', preventDefaultForScrollKeys);\n}\n\nfunction enableScroll() {\n    win.removeEventListener('DOMMouseScroll', preventDefault, false);\n\n    win.removeEventListener('wheel', preventDefault); // modern standard\n    win.removeEventListener('mousewheel', preventDefault); // older browsers, IE\n    doc.removeEventListener('mousewheel', preventDefault);\n    win.removeEventListener('touchmove', preventDefault); // mobile\n    doc.removeEventListener('keydown', preventDefaultForScrollKeys);\n}\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/ractive-select.js\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/ractive-select.js?");

/***/ },
/* 1 */
/*!*************************!*\
  !*** ./src/styles.styl ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	eval("// style-loader: Adds some css to the DOM by adding a <style> tag\n\n// load the styles\nvar content = __webpack_require__(/*! !./../~/css-loader!./../~/stylus-loader!./styles.styl */ 2);\nif(typeof content === 'string') content = [[module.id, content, '']];\n// add the styles to the DOM\nvar update = __webpack_require__(/*! ./../~/style-loader/addStyles.js */ 4)(content, {});\nif(content.locals) module.exports = content.locals;\n// Hot Module Replacement\nif(false) {\n\t// When the styles change, update the <style> tags\n\tif(!content.locals) {\n\t\tmodule.hot.accept(\"!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl\", function() {\n\t\t\tvar newContent = require(\"!!./../node_modules/css-loader/index.js!./../node_modules/stylus-loader/index.js!./styles.styl\");\n\t\t\tif(typeof newContent === 'string') newContent = [[module.id, newContent, '']];\n\t\t\tupdate(newContent);\n\t\t});\n\t}\n\t// When the module is disposed, remove the <style> tags\n\tmodule.hot.dispose(function() { update(); });\n}\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/styles.styl\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/styles.styl?");

/***/ },
/* 2 */
/*!**********************************************************!*\
  !*** ./~/css-loader!./~/stylus-loader!./src/styles.styl ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	eval("exports = module.exports = __webpack_require__(/*! ./../~/css-loader/lib/css-base.js */ 3)();\n// imports\n\n\n// module\nexports.push([module.id, \".ractive-select {\\n  display: inline-block;\\n  position: relative;\\n  cursor: default;\\n  user-select: none;\\n  padding: 0 0.3em;\\n  line-height: 1;\\n}\\n.ractive-select,\\n.ractive-select *,\\n.ractive-select *:before,\\n.ractive-select *:after {\\n  box-sizing: border-box;\\n}\\n.ractive-select label {\\n  margin-right: 0.5em;\\n}\\n.ractive-select .arrows {\\n  display: inline-block;\\n  vertical-align: middle;\\n  position: absolute;\\n  right: 0.3em;\\n  top: 50%;\\n  transform: translate(0, -50%);\\n}\\n.ractive-select .arrows:before,\\n.ractive-select .arrows:after {\\n  content: '';\\n  display: block;\\n  border: 0.25em solid transparent;\\n}\\n.ractive-select .arrows:before {\\n  border-bottom-color: currentColor;\\n  margin-bottom: 3px;\\n}\\n.ractive-select .arrows:after {\\n  border-top-color: currentColor;\\n}\\n.ractive-select .dropdown {\\n  margin: 2px 0 0 0;\\n  background: #fff;\\n  color: #333;\\n  border-radius: 3px;\\n  padding: 2px 0;\\n  cursor: default;\\n  list-style: none;\\n  z-index: 50;\\n  box-shadow: 0 3px 9px rgba(0,0,0,0.4);\\n}\\n.ractive-select li {\\n  padding: 0.3em 0.5em 0.3em 1.5em;\\n  border-top: 1px solid transparent;\\n  border-bottom: 1px solid transparent;\\n  white-space: nowrap;\\n}\\n.ractive-select li[selected] {\\n  padding: 0.3em 0.5em;\\n}\\n.ractive-select li .checkmark {\\n  margin-right: 0.2em;\\n}\\n.ractive-select li .checkmark:before {\\n  content: '\\\\2713';\\n}\\n.ractive-select li:hover,\\n.ractive-select li .selecting {\\n  background: linear-gradient(#3d96f5, #0d7cf2);\\n  color: #fff;\\n  border-top-color: #0a63c2;\\n  border-bottom-color: #004a99;\\n}\\n#ractive-select-dropdown-container .dropdown {\\n  position: fixed;\\n  left: -9999px;\\n}\\n\", \"\"]);\n\n// exports\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./~/css-loader!./~/stylus-loader!./src/styles.styl\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/styles.styl?./~/css-loader!./~/stylus-loader");

/***/ },
/* 3 */
/*!**************************************!*\
  !*** ./~/css-loader/lib/css-base.js ***!
  \**************************************/
/***/ function(module, exports) {

	eval("/*\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Tobias Koppers @sokra\r\n*/\r\n// css base code, injected by the css-loader\r\nmodule.exports = function() {\r\n\tvar list = [];\r\n\r\n\t// return the list of modules as css string\r\n\tlist.toString = function toString() {\r\n\t\tvar result = [];\r\n\t\tfor(var i = 0; i < this.length; i++) {\r\n\t\t\tvar item = this[i];\r\n\t\t\tif(item[2]) {\r\n\t\t\t\tresult.push(\"@media \" + item[2] + \"{\" + item[1] + \"}\");\r\n\t\t\t} else {\r\n\t\t\t\tresult.push(item[1]);\r\n\t\t\t}\r\n\t\t}\r\n\t\treturn result.join(\"\");\r\n\t};\r\n\r\n\t// import a list of modules into the list\r\n\tlist.i = function(modules, mediaQuery) {\r\n\t\tif(typeof modules === \"string\")\r\n\t\t\tmodules = [[null, modules, \"\"]];\r\n\t\tvar alreadyImportedModules = {};\r\n\t\tfor(var i = 0; i < this.length; i++) {\r\n\t\t\tvar id = this[i][0];\r\n\t\t\tif(typeof id === \"number\")\r\n\t\t\t\talreadyImportedModules[id] = true;\r\n\t\t}\r\n\t\tfor(i = 0; i < modules.length; i++) {\r\n\t\t\tvar item = modules[i];\r\n\t\t\t// skip already imported module\r\n\t\t\t// this implementation is not 100% perfect for weird media query combinations\r\n\t\t\t//  when a module is imported multiple times with different media queries.\r\n\t\t\t//  I hope this will never occur (Hey this way we have smaller bundles)\r\n\t\t\tif(typeof item[0] !== \"number\" || !alreadyImportedModules[item[0]]) {\r\n\t\t\t\tif(mediaQuery && !item[2]) {\r\n\t\t\t\t\titem[2] = mediaQuery;\r\n\t\t\t\t} else if(mediaQuery) {\r\n\t\t\t\t\titem[2] = \"(\" + item[2] + \") and (\" + mediaQuery + \")\";\r\n\t\t\t\t}\r\n\t\t\t\tlist.push(item);\r\n\t\t\t}\r\n\t\t}\r\n\t};\r\n\treturn list;\r\n};\r\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./~/css-loader/lib/css-base.js\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./~/css-loader/lib/css-base.js?");

/***/ },
/* 4 */
/*!*************************************!*\
  !*** ./~/style-loader/addStyles.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	eval("/*\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Tobias Koppers @sokra\r\n*/\r\nvar stylesInDom = {},\r\n\tmemoize = function(fn) {\r\n\t\tvar memo;\r\n\t\treturn function () {\r\n\t\t\tif (typeof memo === \"undefined\") memo = fn.apply(this, arguments);\r\n\t\t\treturn memo;\r\n\t\t};\r\n\t},\r\n\tisOldIE = memoize(function() {\r\n\t\treturn /msie [6-9]\\b/.test(window.navigator.userAgent.toLowerCase());\r\n\t}),\r\n\tgetHeadElement = memoize(function () {\r\n\t\treturn document.head || document.getElementsByTagName(\"head\")[0];\r\n\t}),\r\n\tsingletonElement = null,\r\n\tsingletonCounter = 0;\r\n\r\nmodule.exports = function(list, options) {\r\n\tif(true) {\r\n\t\tif(typeof document !== \"object\") throw new Error(\"The style-loader cannot be used in a non-browser environment\");\r\n\t}\r\n\r\n\toptions = options || {};\r\n\t// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>\r\n\t// tags it will allow on a page\r\n\tif (typeof options.singleton === \"undefined\") options.singleton = isOldIE();\r\n\r\n\tvar styles = listToStyles(list);\r\n\taddStylesToDom(styles, options);\r\n\r\n\treturn function update(newList) {\r\n\t\tvar mayRemove = [];\r\n\t\tfor(var i = 0; i < styles.length; i++) {\r\n\t\t\tvar item = styles[i];\r\n\t\t\tvar domStyle = stylesInDom[item.id];\r\n\t\t\tdomStyle.refs--;\r\n\t\t\tmayRemove.push(domStyle);\r\n\t\t}\r\n\t\tif(newList) {\r\n\t\t\tvar newStyles = listToStyles(newList);\r\n\t\t\taddStylesToDom(newStyles, options);\r\n\t\t}\r\n\t\tfor(var i = 0; i < mayRemove.length; i++) {\r\n\t\t\tvar domStyle = mayRemove[i];\r\n\t\t\tif(domStyle.refs === 0) {\r\n\t\t\t\tfor(var j = 0; j < domStyle.parts.length; j++)\r\n\t\t\t\t\tdomStyle.parts[j]();\r\n\t\t\t\tdelete stylesInDom[domStyle.id];\r\n\t\t\t}\r\n\t\t}\r\n\t};\r\n}\r\n\r\nfunction addStylesToDom(styles, options) {\r\n\tfor(var i = 0; i < styles.length; i++) {\r\n\t\tvar item = styles[i];\r\n\t\tvar domStyle = stylesInDom[item.id];\r\n\t\tif(domStyle) {\r\n\t\t\tdomStyle.refs++;\r\n\t\t\tfor(var j = 0; j < domStyle.parts.length; j++) {\r\n\t\t\t\tdomStyle.parts[j](item.parts[j]);\r\n\t\t\t}\r\n\t\t\tfor(; j < item.parts.length; j++) {\r\n\t\t\t\tdomStyle.parts.push(addStyle(item.parts[j], options));\r\n\t\t\t}\r\n\t\t} else {\r\n\t\t\tvar parts = [];\r\n\t\t\tfor(var j = 0; j < item.parts.length; j++) {\r\n\t\t\t\tparts.push(addStyle(item.parts[j], options));\r\n\t\t\t}\r\n\t\t\tstylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction listToStyles(list) {\r\n\tvar styles = [];\r\n\tvar newStyles = {};\r\n\tfor(var i = 0; i < list.length; i++) {\r\n\t\tvar item = list[i];\r\n\t\tvar id = item[0];\r\n\t\tvar css = item[1];\r\n\t\tvar media = item[2];\r\n\t\tvar sourceMap = item[3];\r\n\t\tvar part = {css: css, media: media, sourceMap: sourceMap};\r\n\t\tif(!newStyles[id])\r\n\t\t\tstyles.push(newStyles[id] = {id: id, parts: [part]});\r\n\t\telse\r\n\t\t\tnewStyles[id].parts.push(part);\r\n\t}\r\n\treturn styles;\r\n}\r\n\r\nfunction createStyleElement() {\r\n\tvar styleElement = document.createElement(\"style\");\r\n\tvar head = getHeadElement();\r\n\tstyleElement.type = \"text/css\";\r\n\thead.appendChild(styleElement);\r\n\treturn styleElement;\r\n}\r\n\r\nfunction createLinkElement() {\r\n\tvar linkElement = document.createElement(\"link\");\r\n\tvar head = getHeadElement();\r\n\tlinkElement.rel = \"stylesheet\";\r\n\thead.appendChild(linkElement);\r\n\treturn linkElement;\r\n}\r\n\r\nfunction addStyle(obj, options) {\r\n\tvar styleElement, update, remove;\r\n\r\n\tif (options.singleton) {\r\n\t\tvar styleIndex = singletonCounter++;\r\n\t\tstyleElement = singletonElement || (singletonElement = createStyleElement());\r\n\t\tupdate = applyToSingletonTag.bind(null, styleElement, styleIndex, false);\r\n\t\tremove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);\r\n\t} else if(obj.sourceMap &&\r\n\t\ttypeof URL === \"function\" &&\r\n\t\ttypeof URL.createObjectURL === \"function\" &&\r\n\t\ttypeof URL.revokeObjectURL === \"function\" &&\r\n\t\ttypeof Blob === \"function\" &&\r\n\t\ttypeof btoa === \"function\") {\r\n\t\tstyleElement = createLinkElement();\r\n\t\tupdate = updateLink.bind(null, styleElement);\r\n\t\tremove = function() {\r\n\t\t\tstyleElement.parentNode.removeChild(styleElement);\r\n\t\t\tif(styleElement.href)\r\n\t\t\t\tURL.revokeObjectURL(styleElement.href);\r\n\t\t};\r\n\t} else {\r\n\t\tstyleElement = createStyleElement();\r\n\t\tupdate = applyToTag.bind(null, styleElement);\r\n\t\tremove = function() {\r\n\t\t\tstyleElement.parentNode.removeChild(styleElement);\r\n\t\t};\r\n\t}\r\n\r\n\tupdate(obj);\r\n\r\n\treturn function updateStyle(newObj) {\r\n\t\tif(newObj) {\r\n\t\t\tif(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)\r\n\t\t\t\treturn;\r\n\t\t\tupdate(obj = newObj);\r\n\t\t} else {\r\n\t\t\tremove();\r\n\t\t}\r\n\t};\r\n}\r\n\r\nvar replaceText = (function () {\r\n\tvar textStore = [];\r\n\r\n\treturn function (index, replacement) {\r\n\t\ttextStore[index] = replacement;\r\n\t\treturn textStore.filter(Boolean).join('\\n');\r\n\t};\r\n})();\r\n\r\nfunction applyToSingletonTag(styleElement, index, remove, obj) {\r\n\tvar css = remove ? \"\" : obj.css;\r\n\r\n\tif (styleElement.styleSheet) {\r\n\t\tstyleElement.styleSheet.cssText = replaceText(index, css);\r\n\t} else {\r\n\t\tvar cssNode = document.createTextNode(css);\r\n\t\tvar childNodes = styleElement.childNodes;\r\n\t\tif (childNodes[index]) styleElement.removeChild(childNodes[index]);\r\n\t\tif (childNodes.length) {\r\n\t\t\tstyleElement.insertBefore(cssNode, childNodes[index]);\r\n\t\t} else {\r\n\t\t\tstyleElement.appendChild(cssNode);\r\n\t\t}\r\n\t}\r\n}\r\n\r\nfunction applyToTag(styleElement, obj) {\r\n\tvar css = obj.css;\r\n\tvar media = obj.media;\r\n\tvar sourceMap = obj.sourceMap;\r\n\r\n\tif(media) {\r\n\t\tstyleElement.setAttribute(\"media\", media)\r\n\t}\r\n\r\n\tif(styleElement.styleSheet) {\r\n\t\tstyleElement.styleSheet.cssText = css;\r\n\t} else {\r\n\t\twhile(styleElement.firstChild) {\r\n\t\t\tstyleElement.removeChild(styleElement.firstChild);\r\n\t\t}\r\n\t\tstyleElement.appendChild(document.createTextNode(css));\r\n\t}\r\n}\r\n\r\nfunction updateLink(linkElement, obj) {\r\n\tvar css = obj.css;\r\n\tvar media = obj.media;\r\n\tvar sourceMap = obj.sourceMap;\r\n\r\n\tif(sourceMap) {\r\n\t\t// http://stackoverflow.com/a/26603875\r\n\t\tcss += \"\\n/*# sourceMappingURL=data:application/json;base64,\" + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + \" */\";\r\n\t}\r\n\r\n\tvar blob = new Blob([css], { type: \"text/css\" });\r\n\r\n\tvar oldSrc = linkElement.href;\r\n\r\n\tlinkElement.href = URL.createObjectURL(blob);\r\n\r\n\tif(oldSrc)\r\n\t\tURL.revokeObjectURL(oldSrc);\r\n}\r\n\n\n/*****************\n ** WEBPACK FOOTER\n ** ./~/style-loader/addStyles.js\n ** module id = 4\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./~/style-loader/addStyles.js?");

/***/ },
/* 5 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/debounce.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	eval("var isObject = __webpack_require__(/*! ./isObject */ 6),\n    now = __webpack_require__(/*! ./now */ 7),\n    toNumber = __webpack_require__(/*! ./toNumber */ 8);\n\n/** Used as the `TypeError` message for \"Functions\" methods. */\nvar FUNC_ERROR_TEXT = 'Expected a function';\n\n/* Built-in method references for those with the same name as other `lodash` methods. */\nvar nativeMax = Math.max;\n\n/**\n * Creates a debounced function that delays invoking `func` until after `wait`\n * milliseconds have elapsed since the last time the debounced function was\n * invoked. The debounced function comes with a `cancel` method to cancel\n * delayed `func` invocations and a `flush` method to immediately invoke them.\n * Provide an options object to indicate whether `func` should be invoked on\n * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked\n * with the last arguments provided to the debounced function. Subsequent calls\n * to the debounced function return the result of the last `func` invocation.\n *\n * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked\n * on the trailing edge of the timeout only if the debounced function is\n * invoked more than once during the `wait` timeout.\n *\n * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)\n * for details over the differences between `_.debounce` and `_.throttle`.\n *\n * @static\n * @memberOf _\n * @category Function\n * @param {Function} func The function to debounce.\n * @param {number} [wait=0] The number of milliseconds to delay.\n * @param {Object} [options] The options object.\n * @param {boolean} [options.leading=false] Specify invoking on the leading\n *  edge of the timeout.\n * @param {number} [options.maxWait] The maximum time `func` is allowed to be\n *  delayed before it's invoked.\n * @param {boolean} [options.trailing=true] Specify invoking on the trailing\n *  edge of the timeout.\n * @returns {Function} Returns the new debounced function.\n * @example\n *\n * // Avoid costly calculations while the window size is in flux.\n * jQuery(window).on('resize', _.debounce(calculateLayout, 150));\n *\n * // Invoke `sendMail` when clicked, debouncing subsequent calls.\n * jQuery(element).on('click', _.debounce(sendMail, 300, {\n *   'leading': true,\n *   'trailing': false\n * }));\n *\n * // Ensure `batchLog` is invoked once after 1 second of debounced calls.\n * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });\n * var source = new EventSource('/stream');\n * jQuery(source).on('message', debounced);\n *\n * // Cancel the trailing debounced invocation.\n * jQuery(window).on('popstate', debounced.cancel);\n */\nfunction debounce(func, wait, options) {\n  var args,\n      maxTimeoutId,\n      result,\n      stamp,\n      thisArg,\n      timeoutId,\n      trailingCall,\n      lastCalled = 0,\n      leading = false,\n      maxWait = false,\n      trailing = true;\n\n  if (typeof func != 'function') {\n    throw new TypeError(FUNC_ERROR_TEXT);\n  }\n  wait = toNumber(wait) || 0;\n  if (isObject(options)) {\n    leading = !!options.leading;\n    maxWait = 'maxWait' in options && nativeMax(toNumber(options.maxWait) || 0, wait);\n    trailing = 'trailing' in options ? !!options.trailing : trailing;\n  }\n\n  function cancel() {\n    if (timeoutId) {\n      clearTimeout(timeoutId);\n    }\n    if (maxTimeoutId) {\n      clearTimeout(maxTimeoutId);\n    }\n    lastCalled = 0;\n    args = maxTimeoutId = thisArg = timeoutId = trailingCall = undefined;\n  }\n\n  function complete(isCalled, id) {\n    if (id) {\n      clearTimeout(id);\n    }\n    maxTimeoutId = timeoutId = trailingCall = undefined;\n    if (isCalled) {\n      lastCalled = now();\n      result = func.apply(thisArg, args);\n      if (!timeoutId && !maxTimeoutId) {\n        args = thisArg = undefined;\n      }\n    }\n  }\n\n  function delayed() {\n    var remaining = wait - (now() - stamp);\n    if (remaining <= 0 || remaining > wait) {\n      complete(trailingCall, maxTimeoutId);\n    } else {\n      timeoutId = setTimeout(delayed, remaining);\n    }\n  }\n\n  function flush() {\n    if ((timeoutId && trailingCall) || (maxTimeoutId && trailing)) {\n      result = func.apply(thisArg, args);\n    }\n    cancel();\n    return result;\n  }\n\n  function maxDelayed() {\n    complete(trailing, timeoutId);\n  }\n\n  function debounced() {\n    args = arguments;\n    stamp = now();\n    thisArg = this;\n    trailingCall = trailing && (timeoutId || !leading);\n\n    if (maxWait === false) {\n      var leadingCall = leading && !timeoutId;\n    } else {\n      if (!lastCalled && !maxTimeoutId && !leading) {\n        lastCalled = stamp;\n      }\n      var remaining = maxWait - (stamp - lastCalled);\n\n      var isCalled = (remaining <= 0 || remaining > maxWait) &&\n        (leading || maxTimeoutId);\n\n      if (isCalled) {\n        if (maxTimeoutId) {\n          maxTimeoutId = clearTimeout(maxTimeoutId);\n        }\n        lastCalled = stamp;\n        result = func.apply(thisArg, args);\n      }\n      else if (!maxTimeoutId) {\n        maxTimeoutId = setTimeout(maxDelayed, remaining);\n      }\n    }\n    if (isCalled && timeoutId) {\n      timeoutId = clearTimeout(timeoutId);\n    }\n    else if (!timeoutId && wait !== maxWait) {\n      timeoutId = setTimeout(delayed, wait);\n    }\n    if (leadingCall) {\n      isCalled = true;\n      result = func.apply(thisArg, args);\n    }\n    if (isCalled && !timeoutId && !maxTimeoutId) {\n      args = thisArg = undefined;\n    }\n    return result;\n  }\n  debounced.cancel = cancel;\n  debounced.flush = flush;\n  return debounced;\n}\n\nmodule.exports = debounce;\n\n\n/*****************\n ** WEBPACK FOOTER\n ** /Users/JD/Dropbox/Applications/lib/~/lodash/debounce.js\n ** module id = 5\n ** module chunks = 0\n **/\n//# sourceURL=webpack:////Users/JD/Dropbox/Applications/lib/~/lodash/debounce.js?");

/***/ },
/* 6 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isObject.js ***!
  \***************************************************************/
/***/ function(module, exports) {

	eval("/**\n * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.\n * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\n *\n * @static\n * @memberOf _\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n * @example\n *\n * _.isObject({});\n * // => true\n *\n * _.isObject([1, 2, 3]);\n * // => true\n *\n * _.isObject(_.noop);\n * // => true\n *\n * _.isObject(null);\n * // => false\n */\nfunction isObject(value) {\n  var type = typeof value;\n  return !!value && (type == 'object' || type == 'function');\n}\n\nmodule.exports = isObject;\n\n\n/*****************\n ** WEBPACK FOOTER\n ** /Users/JD/Dropbox/Applications/lib/~/lodash/isObject.js\n ** module id = 6\n ** module chunks = 0\n **/\n//# sourceURL=webpack:////Users/JD/Dropbox/Applications/lib/~/lodash/isObject.js?");

/***/ },
/* 7 */
/*!**********************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/now.js ***!
  \**********************************************************/
/***/ function(module, exports) {

	eval("/**\n * Gets the timestamp of the number of milliseconds that have elapsed since\n * the Unix epoch (1 January 1970 00:00:00 UTC).\n *\n * @static\n * @memberOf _\n * @type {Function}\n * @category Date\n * @returns {number} Returns the timestamp.\n * @example\n *\n * _.defer(function(stamp) {\n *   console.log(_.now() - stamp);\n * }, _.now());\n * // => logs the number of milliseconds it took for the deferred function to be invoked\n */\nvar now = Date.now;\n\nmodule.exports = now;\n\n\n/*****************\n ** WEBPACK FOOTER\n ** /Users/JD/Dropbox/Applications/lib/~/lodash/now.js\n ** module id = 7\n ** module chunks = 0\n **/\n//# sourceURL=webpack:////Users/JD/Dropbox/Applications/lib/~/lodash/now.js?");

/***/ },
/* 8 */
/*!***************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/toNumber.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	eval("var isFunction = __webpack_require__(/*! ./isFunction */ 9),\n    isObject = __webpack_require__(/*! ./isObject */ 6);\n\n/** Used as references for various `Number` constants. */\nvar NAN = 0 / 0;\n\n/** Used to match leading and trailing whitespace. */\nvar reTrim = /^\\s+|\\s+$/g;\n\n/** Used to detect bad signed hexadecimal string values. */\nvar reIsBadHex = /^[-+]0x[0-9a-f]+$/i;\n\n/** Used to detect binary string values. */\nvar reIsBinary = /^0b[01]+$/i;\n\n/** Used to detect octal string values. */\nvar reIsOctal = /^0o[0-7]+$/i;\n\n/** Built-in method references without a dependency on `root`. */\nvar freeParseInt = parseInt;\n\n/**\n * Converts `value` to a number.\n *\n * @static\n * @memberOf _\n * @category Lang\n * @param {*} value The value to process.\n * @returns {number} Returns the number.\n * @example\n *\n * _.toNumber(3);\n * // => 3\n *\n * _.toNumber(Number.MIN_VALUE);\n * // => 5e-324\n *\n * _.toNumber(Infinity);\n * // => Infinity\n *\n * _.toNumber('3');\n * // => 3\n */\nfunction toNumber(value) {\n  if (isObject(value)) {\n    var other = isFunction(value.valueOf) ? value.valueOf() : value;\n    value = isObject(other) ? (other + '') : other;\n  }\n  if (typeof value != 'string') {\n    return value === 0 ? value : +value;\n  }\n  value = value.replace(reTrim, '');\n  var isBinary = reIsBinary.test(value);\n  return (isBinary || reIsOctal.test(value))\n    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)\n    : (reIsBadHex.test(value) ? NAN : +value);\n}\n\nmodule.exports = toNumber;\n\n\n/*****************\n ** WEBPACK FOOTER\n ** /Users/JD/Dropbox/Applications/lib/~/lodash/toNumber.js\n ** module id = 8\n ** module chunks = 0\n **/\n//# sourceURL=webpack:////Users/JD/Dropbox/Applications/lib/~/lodash/toNumber.js?");

/***/ },
/* 9 */
/*!*****************************************************************!*\
  !*** /Users/JD/Dropbox/Applications/lib/~/lodash/isFunction.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	eval("var isObject = __webpack_require__(/*! ./isObject */ 6);\n\n/** `Object#toString` result references. */\nvar funcTag = '[object Function]',\n    genTag = '[object GeneratorFunction]';\n\n/** Used for built-in method references. */\nvar objectProto = Object.prototype;\n\n/**\n * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)\n * of values.\n */\nvar objectToString = objectProto.toString;\n\n/**\n * Checks if `value` is classified as a `Function` object.\n *\n * @static\n * @memberOf _\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n * @example\n *\n * _.isFunction(_);\n * // => true\n *\n * _.isFunction(/abc/);\n * // => false\n */\nfunction isFunction(value) {\n  // The use of `Object#toString` avoids issues with the `typeof` operator\n  // in Safari 8 which returns 'object' for typed array constructors, and\n  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.\n  var tag = isObject(value) ? objectToString.call(value) : '';\n  return tag == funcTag || tag == genTag;\n}\n\nmodule.exports = isFunction;\n\n\n/*****************\n ** WEBPACK FOOTER\n ** /Users/JD/Dropbox/Applications/lib/~/lodash/isFunction.js\n ** module id = 9\n ** module chunks = 0\n **/\n//# sourceURL=webpack:////Users/JD/Dropbox/Applications/lib/~/lodash/isFunction.js?");

/***/ },
/* 10 */
/*!***************************!*\
  !*** ./src/template.html ***!
  \***************************/
/***/ function(module, exports) {

	eval("module.exports={\"v\":3,\"t\":[{\"t\":7,\"e\":\"div\",\"a\":{\"class\":[\"ractive-select \",{\"t\":2,\"r\":\"class\"}],\"style\":[{\"t\":2,\"r\":\"style\"}]},\"v\":{\"click\":{\"m\":\"open\",\"a\":{\"r\":[\"event\"],\"s\":\"[_0]\"}},\"keypress\":\"\",\"arrowdown\":\"\",\"arrowup\":\"\"},\"f\":[{\"t\":7,\"e\":\"label\",\"f\":[{\"t\":2,\"x\":{\"r\":[\"label\",\"value\",\"placeholder\"],\"s\":\"_0||_1||_2||\\\"Select...\\\"\"}}]},\" \",{\"t\":7,\"e\":\"div\",\"a\":{\"class\":\"arrows\"}},\" \",{\"t\":7,\"e\":\"select\",\"a\":{\"style\":\"position: fixed; left: -9999px\",\"value\":[{\"t\":2,\"r\":\".value\"}]},\"f\":[{\"t\":4,\"f\":[{\"t\":4,\"f\":[{\"t\":4,\"f\":[{\"t\":7,\"e\":\"option\",\"a\":{\"value\":[{\"t\":2,\"r\":\".value\"}]},\"f\":[{\"t\":2,\"r\":\".label\"}]}],\"n\":50,\"r\":\"./value\"},{\"t\":4,\"n\":51,\"f\":[{\"t\":7,\"e\":\"option\",\"f\":[{\"t\":2,\"r\":\".\"}]}],\"r\":\"./value\"}],\"n\":52,\"r\":\"_items\"}],\"n\":50,\"r\":\"items\"},{\"t\":4,\"n\":51,\"f\":[{\"t\":16}],\"r\":\"items\"}]},\" \",{\"t\":7,\"e\":\"ul\",\"a\":{\"class\":[\"dropdown\",{\"t\":4,\"f\":[\" open\"],\"n\":50,\"r\":\"open\"},\" \",{\"t\":2,\"r\":\"class\"}]},\"v\":{\"click\":{\"m\":\"select\",\"a\":{\"r\":[\"event\"],\"s\":\"[_0]\"}}},\"f\":[{\"t\":4,\"f\":[{\"t\":7,\"e\":\"li\",\"a\":{\"value\":[{\"t\":2,\"r\":\".value\"}]},\"m\":[{\"t\":4,\"f\":[\"class='selecting'\"],\"n\":50,\"r\":\"selecting\"},{\"t\":4,\"f\":[\"selected\"],\"n\":50,\"r\":\"selected\"}],\"f\":[{\"t\":4,\"f\":[{\"t\":7,\"e\":\"span\",\"a\":{\"class\":\"checkmark\"}}],\"n\":50,\"r\":\"selected\"},{\"t\":2,\"r\":\"label\"}]}],\"n\":52,\"r\":\"_items\"}]}]}]};\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/template.html\n ** module id = 10\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/template.html?");

/***/ }
/******/ ])
});
;