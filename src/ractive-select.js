require('./styles.styl');

var debounce = require('lodash/function/debounce');

var win = window;
var doc = document;

var id = 'ractive-select-dropdown-container';

module.exports = Ractive.extend({

    template: require('./template.html'),

    isolated: true,

    data: function() {
        return {

            open: false,

            blockScrolling: true,

        }
    },

    onrender: function() {

        var self = this;

        var select = self.find('select');

        // set up a MutationObserve to watch for style changes that may affect layout
        var observer = new MutationObserver(function(mutations) {
            self.updateSize();
        });

        observer.observe(select, {
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });

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

            if (el.contains(e.target))
                return;

            self.set('open', false);

        };

        function updatePosition() {

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

            var blockScrolling = self.get('blockScrolling');

            if (open) {

                doc.addEventListener('click', self.clickHandler);

                if(blockScrolling)
                    disableScroll();

            } else {

                doc.removeEventListener('click', self.clickHandler);

                if(blockScrolling)
                    enableScroll();
            }

            updatePosition();

        }, {
            defer: true
        });

        self.observe('value', function(value) {

            this.updateItems();

        }, {
            defer: true
        });

        //this.updateItems();

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


    },

    updateItems: function() {

        var select = this.find('select');
        var options = select.querySelectorAll('option');
        var value = this.get('value');
        var attr, label;

        var items = this.get('items');

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

        this.set('label', label);
        this.set('_items', newItems);

        this.updateSize();

    },

    updateSize: function() {

        var select = this.find('select');
        var dropdown = this.find('.dropdown');
        var el = this.find('div');
        var label = this.find('label');

        var computed = win.getComputedStyle(el);
        dropdown.style.fontSize = computed.fontSize;

        el.style.minWidth = dropdown.offsetWidth + 'px';

        if (select.style.maxWidth)
            label.style.maxWidth = select.style.maxWidth;
    },

    open: function(details) {

        var event = details.original;

        if (event.target.matches('.ractive-select .dropdown *'))
            return;

        if (isTouchDevice())
            return showDropdown(this.find('select'));

        this.set('open', true);

    },

    close: function(details) {

        this.set('open', false);

    },

    select: function(details) {

        var e = details.original;
        var target = e.target;

        if (target.nodeName !== 'LI')
            target = target.parentNode;

        if (target.nodeName !== 'LI')
            return;

        var valueAttribute = target.getAttribute('value');

        var value = valueAttribute || target.textContent;

        this.set('value', value);
        this.fire('select', value);

        this.close();

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


// block scrolling - from SO

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1
};

function preventDefault(e) {
    e = e || win.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    win.addEventListener('DOMMouseScroll', preventDefault, false);
    win.addEventListener('wheel', preventDefault); // modern standard
    win.addEventListener('mousewheel', preventDefault); // older browsers, IE
    doc.addEventListener('mousewheel', preventDefault);
    win.addEventListener('touchmove', preventDefault); // mobile
    doc.addEventListener('keydown', preventDefaultForScrollKeys);
}

function enableScroll() {
    win.removeEventListener('DOMMouseScroll', preventDefault, false);

    win.removeEventListener('wheel', preventDefault); // modern standard
    win.removeEventListener('mousewheel', preventDefault); // older browsers, IE
    doc.removeEventListener('mousewheel', preventDefault);
    win.removeEventListener('touchmove', preventDefault); // mobile
    doc.removeEventListener('keydown', preventDefaultForScrollKeys);
}
