
require('./styles.styl');

module.exports = Ractive.extend({

    template: require('./template.html'),

    data: function() {
        return {

            open: false

        }
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

        });

    },

    onteardown: function() {

        document.removeEventListener('click', this.clickHandler);

    },

    updateItems: function() {

    },

    open: function(details) {

        this.set('open', true);

    },

    close: function(details) {

        this.set('open', false);

    },

    select: function(details) {

        var e = details.original;
        var target = e.target;

        var valueAttribute = target.getAttribute('value');

        if(valueAttribute)
            this.set('value', valueAttribute);
        else
            this.set('value', target.textContent);

    }



});
