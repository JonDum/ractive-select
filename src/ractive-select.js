
require('./styles.styl');

module.exports = Ractive.extend({

    template: require('./template.html'),

    isolated: true,

    data: function() {
        return {

            open: false

        }
    },

    onrender: function() {

        var self = this;

        self.updateItems();

        var observer = new MutationObserver(function(mutations) {
          self.updateSize();
        });

        var select = self.find('select');

        observer.observe(select, {attributes:true, attributeFilter: ['style', 'class', 'id'] });

    },

    oncomplete: function() {

        var self = this;

        var container = self.find('*');

        self.clickHandler = function(e) {

            if(container.contains(e.target))
                return;

            self.set('open', false);

        };

        self.observe('open', function(open) {

            if(open)
                document.addEventListener('click', self.clickHandler);
            else
                document.removeEventListener('click', self.clickHandler);

        }, {defer: true});

        self.observe('value', function(value) {

            this.updateItems();

        }, {defer: true});

        self.observe('content partial', function(value, keypath) {
            console.log('observe: content ', arguments);
        });

    },

    onteardown: function() {

        document.removeEventListener('click', this.clickHandler);

    },

    updateItems: function() {

        var select = this.find('select');
        var options = select.querySelectorAll('option');
        var value = this.get('value');
        var attr, label;

        var items = this.get('items');

        var newItems = [];

        if(options && options.length > 0) {

            for(var i = 0, len = options.length; i < len; i++) {
                var opt = options[i];
                attr = opt.getAttribute('value');
                if(attr == value) {
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
        var el = this.find('div');
        var label = this.find('label');

        el.style.minWidth = select.offsetWidth + 'px';

        if(select.style.maxWidth)
            label.style.maxWidth = select.style.maxWidth;
    },

    open: function(details) {

        var event = details.original;

        if(event.target.matches('.ractive-select .dropdown *'))
            return;

        if(isTouchDevice())
            return showDropdown(this.find('select'));

        this.set('open', true);

    },

    close: function(details) {

        this.set('open', false);

    },

    select: function(details) {

        var e = details.original;
        var target = e.target;

        if(target.nodeName !== 'LI')
           target = target.parentNode;

        if(target.nodeName !== 'LI')
            return;

        var valueAttribute = target.getAttribute('value');

        if(valueAttribute)
            this.set('value', valueAttribute);
        else
            this.set('value', target.textContent);

        this.close();

    }



});

function showDropdown(element) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('mousedown', true, true, window);
    element.dispatchEvent(event);
}

function isTouchDevice() {
    return 'ontouchstart' in window || 'onmsgesturechange' in window;
}
