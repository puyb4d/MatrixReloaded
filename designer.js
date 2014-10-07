(function(MatrixReloaded) {
    "use strict";

    MatrixReloaded.containerChildrenAreSubWidgets();

    var updateSize = function() {
        var coords = this.repeaterGetCoordinates(0);
        console.log(coords);
        console.trace();
        for(var key in coords) {
            this.widget(0)[key](coords[key]);
        }
        var num = this._getColumnCount();
        if(this.isHorizontalScroll()) {
            num *= Math.ceil(this.width() / this.getRowSize());
        } else {
            num *= Math.ceil(this.height() / this.getRowSize());
        }
        num--;
        this.studioRepeatedClones(num);
    };

    var Container = WAF.require('Container');
    MatrixReloaded.prototype.studioRepeaterGetClone = function(position) {
        var widget = new Container();
        widget.node.innerHTML = position + 1;
        return widget;
    };

    MatrixReloaded.doAfter('_init', function() {
        this.direction.onChange(updateSize);
        this.number.onChange(updateSize);
        this.columnSize.onChange(updateSize);
        this.rowSize.onChange(updateSize);
        this.expand.onChange(updateSize);
        this.rowMargin.onChange(updateSize);
        this.columnMargin.onChange(updateSize);
        updateSize.call(this);

        var showMode = function() {
            if(this.mode() === 'split') {
                this.number.show();
                this.columnSize.hide();
                this.expand.hide();
            } else {
                this.number.hide();
                this.columnSize.show();
                this.expand.show();
            }
            updateSize.call(this);
        };
        this.mode.onChange(showMode);
        showMode.call(this);
    });

    MatrixReloaded.studioOnResize(function() {
        //debugger;
        updateSize.call(this);
    });
});
