// This file has its origin from:
// https://github.com/paperjs/paper.js/blob/develop/src/paper.js
// but it was modified to handle threejs instead of paperjs.

// OpenSeadragon canvas Overlay plugin 0.0.1 based on svg overlay plugin

(function () {

    if (!window.OpenSeadragon) {
        console.error('[openseadragon-canvas-overlay] requires OpenSeadragon');
        return;
    }


    // ----------
    OpenSeadragon.Viewer.prototype.threejsOverlay = function () {
        if (this._threejsOverlayInfo) {
            return this._threejsOverlayInfo;
        }

        this._threejsOverlayInfo = new Overlay(this);
        return this._threejsOverlayInfo;
    };

    // ----------
    var Overlay = function (viewer) {
        var self = this;

        this._viewer = viewer;

        this._containerWidth = 0;
        this._containerHeight = 0;

        this._canvasdiv = document.createElement('div');
        this._canvasdiv.setAttribute('id', 'osd-overlaycontainer');
        this._canvasdiv.style.position = 'absolute';
        this._canvasdiv.style.left = 0;
        this._canvasdiv.style.top = 0;
        this._canvasdiv.style.width = '100%';
        this._canvasdiv.style.height = '100%';
        this._viewer.canvas.appendChild(this._canvasdiv);

        this._canvas = document.createElement('canvas');
        this._canvas.setAttribute('id', 'osd-overlaycanvas');
        this._canvasdiv.appendChild(this._canvas);
        this.resize();

        // paper.setup(this._canvas);

        this._viewer.addHandler('update-viewport', function () {
            self.resize();
            self.resizecanvas();
        });

        this._viewer.addHandler('open', function () {
            self.resize();
            self.resizecanvas();
        });

        this.resize();
    };

    // ----------
    Overlay.prototype = {
        // ----------
        canvas: function () {
            return this._canvas;
        },
        context3d: function () {
            return this._canvas.getContext('webgl');
        },
        clear: function () {
            // TODO: check what needs to be added here
        },
        // ----------
        resize: function () {
            if (this._containerWidth !== this._viewer.container.clientWidth) {
                this._containerWidth = this._viewer.container.clientWidth;
                this._canvasdiv.setAttribute('width', this._containerWidth);
                this._canvas.setAttribute('width', this._containerWidth);
            }
            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._canvasdiv.setAttribute('height', this._containerHeight);
                this._canvas.setAttribute('height', this._containerHeight);
            }
        },
        resizecanvas: function () {
            this._canvasdiv.setAttribute('width', this._containerWidth);
            this._canvas.setAttribute('width', this._containerWidth);
            this._canvasdiv.setAttribute('height', this._containerHeight);
            this._canvas.setAttribute('height', this._containerHeight);
            // paper.view.viewSize = new paper.Size(this._containerWidth, this._containerHeight);
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            // paper.view.zoom = image1.viewportToImageZoom(viewportZoom);
            var center = this._viewer.viewport.viewportToImageCoordinates(this._viewer.viewport.getCenter(true));
            // paper.view.center = new paper.Point(center.x, center.y);
        }
    };
})();