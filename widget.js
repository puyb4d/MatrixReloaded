WAF.define('MatrixReloaded', ['waf-core/widget', 'Container'], function(widget, Container) {
    "use strict";

    var MatrixReloaded = widget.create('MatrixReloaded', {
        collection: widget.property({ type: 'datasource', pageSize: 40 }),
        direction: widget.property({
            type: 'enum',
            values: {
                'vertical':   'vertical',
                'horizontal': 'horizontal'
            }
        }),
        mode: widget.property({
            type: 'enum',
            values: {
                'split': 'number of columns',
                'size': 'size'
            }
        }),
        number:       widget.property({ type: 'integer', defaultValue: 2 }),
        columnSize:   widget.property({ type: 'number',  defaultValue: 150 }),
        columnMargin: widget.property({ type: 'number',  defaultValue: 10 }),
        rowSize:      widget.property({ type: 'number',  defaultValue: 150 }),
        rowMargin:    widget.property({ type: 'number',  defaultValue: 10 }),
        expand:       widget.property({ type: 'boolean', defaultValue: true })
    });
    var proto = MatrixReloaded.prototype;

    MatrixReloaded.inherit('waf-behavior/layout/repeater-livescroll');
    MatrixReloaded.linkDatasourcePropertyToRepeater('collection');
    MatrixReloaded.repeatedWidget(Container);

    function getSelectorRegExp(id) {
        return new RegExp('#' + id + "($|[,. :\\[])");
    }

    function getRules(id) {
        if(!document.styleSheets) {
            return [];
        }

        var regexp = getSelectorRegExp(id);
        var res = [];
        for(var i = 0; i < document.styleSheets.length; i++) {
            var rules = document.styleSheets[i].cssRules ||
                        document.styleSheets[i].rules;
            for(var j = 0; j < rules.length; j++) {
                if(regexp.test(rules[j].selectorText)) {
                    res.push(rules[j]);
                }
            }
        }
        return res;
    }

    function upgradeRules(id, newClass) {
        var regexp = getSelectorRegExp(id);
        getRules(id).forEach(function(rule) {
            var selectors = rule.selectorText.split(/ *, */);
            selectors.some(function(selector) {
                if(regexp.test(selector)) {
                    selectors.push(selector.replace(regexp, '.' + newClass));
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

    proto.isHorizontalScroll = function() {
        return this.direction() === 'horizontal';
    };

    proto._getColumnsAvailableSize = function() {
        if(this.isHorizontalScroll()) {
            return this.node.clientHeight + this.columnMargin();
        }
        return this.node.clientWidth + this.columnMargin();
    };

    proto._getColumnSize = function() {
        if(this.mode() === 'split') {
            return (this._getColumnsAvailableSize() - this.number() * this.columnMargin()) / this.number();
        }
        if(this.expand()) {
            return this._getColumnsAvailableSize() / Math.floor(this._getColumnsAvailableSize() / (this.columnSize() + this.columnMargin())) - this.columnMargin();
        }
        return this.columnSize();
    };

    proto._getColumnCount = function() {
        return Math.floor(this._getColumnsAvailableSize() / (this._getColumnSize() + this.columnMargin()));
    };

    proto._getTop = function(position) {
        var row = Math.floor(position / this._getColumnCount());
        return (this.rowSize() + this.rowMargin()) * row;
    };

    proto._getLeft = function(position) {
        var column = position % this._getColumnCount();
        return (this._getColumnSize() + this.columnMargin()) * column;
    };

    proto.repeaterGetCoordinates = function(position) {
        var res = {};
        if(!this.isHorizontalScroll()) {
            res.left   = this._getLeft(position);
            res.top    = this._getTop(position);
            res.width  = this._getColumnSize();
            res.height = this.rowSize();
        } else {
            res.top    = this._getLeft(position);
            res.left   = this._getTop(position);
            res.height = this._getColumnSize();
            res.width  = this.rowSize();
        }
        //console.log(JSON.stringify(res));
        return res;
    };

    proto.getScrolledNode  = function() {
        if(!$('>div', this.node).length) {
            this.node.innerHTML = '<div></div>';
        }
        return $('>div', this.node).get(0);
    };


    // Live scroll method
    proto.getRowSize = function() {
        return this.rowSize() + this.rowMargin();
    };

    // Live scroll method
    proto.getItemsPerRow = function() {
        return this._getColumnCount();
    };

    proto._upgradeCSSRules = function() {
        // get master css and transform it in classes
        if(this.repeatedWidget()) {
            upgradeWidgetAndRules(this.repeatedWidget());
            this.repeatedWidget().allChildren().forEach(upgradeWidgetAndRules);
        }
    };

    proto.init = function() {
        this._upgradeCSSRules();

        var scrolled = this.getScrolledNode();
        $(scrolled).on('click', function(event) {
            if(!this.collection()) {
                return;
            }

            var el = event.target;
            while(el.parentNode !== scrolled && el !== document.body) {
                el = el.parentNode;
            }
            if(el.parentNode === scrolled) {
                this.collection().select(this.getPosition(el));
            }
        }.bind(this));

        this.collection.subscribe('currentElementChange', function() {
            var position = this.collection().getPosition();
            this.invoke('removeClass', 'waf-state-selected');
            var widget = this.widgetByPosition(position);
            if(widget) {
                widget.addClass('waf-state-selected');
            }
        }, this);
    };


    return MatrixReloaded;

});
