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

        this._vec = new THREE.Vector3(); // create once and reuse
        this._pos = new THREE.Vector3(); // create once and reuse

        this._containerWidth = 0;
        this._containerHeight = 0;

        this.width = 13306;
        this.height = 10245;

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

        this._renderer = this.renderer();
        this._camera = undefined;
        this._scene = undefined;
        this._stats = undefined;
        // this.imagingHelper = this._viewer.activateImagingHelper();
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
        renderer: function () {
            if (this._renderer) return this._renderer;
            this._renderer = new THREE.WebGLRenderer(this.context3d());
            this._renderer.setSize(this._viewer.container.clientWidth, this._viewer.container.clientHeight);
            // this._renderer.setSize(this.width, this.height);
            return this._renderer;
        },
        camera: function () {
            if (this._camera) return this._camera;
            this._camera = new THREE.PerspectiveCamera(120, this._viewer.viewport.getAspectRatio(), 1, 30000);
            this._camera.position.x = 0;
            this._camera.position.y = 0;
            this._camera.position.z = 1000;
            // console.log("default zoom", this.imagingHelper.getZoomFactor());
            // this._camera.zoom = this.imagingHelper.getZoomFactor();
            this._camera.updateProjectionMatrix();
            console.log("three zoom", this._camera.zoom);
            return this._camera;
        },
        scene: function () {
            return this._scene ? this._scene : new THREE.Scene();
        },
        sceneToWorld: function (x, y) {
            // console.log("Scene coordinates: ", x, y)
            x = Math.round(x);
            y = Math.round(y);
            this._vec.set(
                (x / window.innerWidth) * 2 - 1,
                - (y / window.innerHeight) * 2 + 1,
                0.5);
            // this._vec.set(
            //     (x / this.width) * 2 - 1,
            //     - (y / this.height) * 2 + 1,
            //     0.5);

            // console.log(distance, camera, vec);
            this._vec.unproject(this._camera);

            this._vec.sub(this._camera.position).normalize();

            var distance = - this._camera.position.z / this._vec.z;
            this._pos.copy(this._camera.position).add(this._vec.multiplyScalar(distance));
            // console.log("World coordinates: ", this._pos);
            return this._pos;
        },
        stats: function () {
            if (this._stats) return this._stats;

            this._stats = new Stats();
            this._stats.dom.style.left = 'unset';
            this._stats.dom.style.right = '0px';
            document.body.appendChild(this._stats.dom);
            return this._stats;
        },
        panZoom: function () {
            return panzoom(this._camera, this._renderer.domElement);
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
                // this._renderer.setSize(this._viewer.container.clientWidth, this._viewer.container.clientHeight);
            }
            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._canvasdiv.setAttribute('height', this._containerHeight);
                this._canvas.setAttribute('height', this._containerHeight);
                // this._renderer.setSize(this._viewer.container.clientWidth, this._viewer.container.clientHeight);
            }
        },
        resizecanvas: function () {
            this._canvasdiv.setAttribute('width', this._containerWidth);
            this._canvas.setAttribute('width', this._containerWidth);
            this._canvasdiv.setAttribute('height', this._containerHeight);
            this._canvas.setAttribute('height', this._containerHeight);
            // this._renderer.setSize(this._viewer.container.clientWidth, this._viewer.container.clientHeight);
            // paper.view.viewSize = new paper.Size(this._containerWidth, this._containerHeight);
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            // paper.view.zoom = image1.viewportToImageZoom(viewportZoom);
            var center = this._viewer.viewport.viewportToImageCoordinates(this._viewer.viewport.getCenter(true));
            // paper.view.center = new paper.Point(center.x, center.y);
        }
    };
})();