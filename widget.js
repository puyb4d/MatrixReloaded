WAF.define('MatrixReloaded', ['waf-core/widget', 'Container'], function(widget, Container) {
    "use strict";

    var MatrixReloaded = widget.create('MatrixReloaded', {
        collection: widget.property({ type: 'datasource' })
    });

    MatrixReloaded.inherit('waf-behavior/layout/repeater');
    MatrixReloaded.linkDatasourcePropertyToRepeater('collection');
    MatrixReloaded.repeatedWidget(Container);

    function getSelectorRegExp(id) {
        return new RegExp('#' + id + "($|[,. :\\[])");
    }

    function getRules(id) {
        if(!document.styleSheets) {
            return [];
        }

        var r = getSelectorRegExp(id);
        var res = [];
        for(var i = 0; i < document.styleSheets.length; i++) {
            var rules = document.styleSheets[i].cssRules ||
                        document.styleSheets[i].rules;
            for(var j = 0; j < rules.length; j++) {
                if(r.test(rules[j].selectorText)) {
                    res.push(rules[j]);
                }
            }
        }
        return res;
    }

    function upgradeRules(id, newClass) {
        var r = getSelectorRegExp(id);
        getRules(id).forEach(function(rule) {
            var selectors = rule.selectorText.split(/ *, */);
            selectors.some(function(selector) {
                if(r.test(selector)) {
                    selectors.push(selector.replace(r, '.' + newClass));
                    return true;
                }
            });
            rule.selectorText = selectors.join(', ');
        });
    }

    function upgradeWidgetAndRules(widget) {
        var newClass = 'waf-clone-' + widget.node.id;
        upgradeRules(widget.node.id, newClass);
        widget.addClass(newClass);  
    }

    MatrixReloaded.prototype.init = function() {
        // get master css and transform it in classes
        if(this.repeatedWidget()) {
            upgradeWidgetAndRules(this.repeatedWidget());
            this.repeatedWidget().allChildren().forEach(upgradeWidgetAndRules);
        }
        // find how many per page

        // install scroll callback handler

    };

    MatrixReloaded.prototype.getNewItem = function(position) {
        var w = this.$super('getNewItem')(position);
        w.node.style.position = 'relative';
        return w;
    };


    return MatrixReloaded;

});
