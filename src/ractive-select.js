require('./styles.styl');

var debounce = require('lodash/debounce');
var find = require('lodash/find');

var win = window;
var doc = document;

var id = 'ractive-select-dropdown-container';
var Keys = require('ractive-events-keys');

module.exports = Ractive.extend({

    template: require('!ractive!./template.html'),

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
        preventOverscroll: require('./decorators/prevent-overscroll')
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


