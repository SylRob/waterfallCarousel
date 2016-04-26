var WaterfallCarousel = (function () {
    function WaterfallCarousel(wrapperId, imagesArr) {
        this.itemWrapperMasks = [];
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.dirty = true;
        this.wrapperElem = document.getElementById(wrapperId);
        if (!this.wrapperElem)
            throw new Error('main element cannot be found');
        if (typeof imagesArr != 'object' || imagesArr.length < 1)
            throw new Error('need image tag list');
        this.imagesArr = imagesArr;
        this.initCanvas();
        this.initShapes();
        this.initEvents();
        var loadingElem = this.wrapperElem.querySelector('.loading');
        if (loadingElem)
            this.wrapperElem.removeChild(loadingElem);
        this.draw();
    }
    WaterfallCarousel.prototype.initEvents = function () {
        var _this = this;
        window.addEventListener('resize', this.resizeHandeler.bind(this));
        new TouchVector({ listener: this.wrapperElem });
        document.addEventListener('touchVector-move', function (event) {
            if (_this.userAction) {
                _this.dirty = true;
                _this.touchPosition = event.detail;
            }
        });
        this.canvasElem.addEventListener('mousedown', this.onTouchStart.bind(this), false);
        this.canvasElem.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.canvasElem.addEventListener('mouseup', this.onTouchEnd.bind(this), false);
        this.canvasElem.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    };
    WaterfallCarousel.prototype.initCanvas = function () {
        this.canvasElem = document.createElement('canvas');
        this.canvasElem.style.width = this.canvasElem.style.height = '100%';
        this.canvasElem.width = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.wrapperElem.appendChild(this.canvasElem);
        this.ctx = this.canvasElem.getContext('2d');
    };
    WaterfallCarousel.prototype.initShapes = function () {
        this.visibleItems = [null, 0, 1];
        for (var i = 0; i < this.imagesArr.length; i++) {
            var shape = new MaskPloygone(this.ctx, i, this.imagesArr[i], i == 0 ? true : false);
            this.itemWrapperMasks.push(shape);
            if (i == 0) {
                shape.setMaskSize(this.canvasElem.width, this.canvasElem.height);
                var points = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.windowW, y: 0 },
                    { type: 'line', x: this.windowW, y: this.windowH },
                    { type: 'line', x: 0, y: this.windowH }
                ];
                shape.draw(points);
            }
        }
    };
    WaterfallCarousel.prototype.positioningShapes = function () {
        if (typeof this.touchPosition !== 'undefined') {
            for (var i = 0; i < this.itemWrapperMasks.length; i++) {
                var shape = this.itemWrapperMasks[i];
                if (!shape.visible || !this.userAction)
                    continue;
                var points = this.getShapePoints(this.startPosition.x, this.startPosition.y, this.touchPosition.x, this.touchPosition.y);
                shape.draw(points);
            }
        }
    };
    WaterfallCarousel.prototype.getShapePoints = function (xStart, yStart, x, y) {
        var xDiff = xStart - x;
        var yDiff = yStart - y;
        var bezierMaxW = Math.round((this.canvasElem.width * 70) / 100);
        var bezierMaxH = Math.round((this.canvasElem.height * 80) / 100);
        var pour = (Math.abs(yDiff) / bezierMaxH) * 100;
        console.log(pour);
        var points = [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: 0, y: 0 }
        ];
        return [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: this.windowW, y: 0 },
            { type: 'line', x: this.windowW, y: this.windowH },
            { type: 'line', x: 0, y: this.windowH }
        ];
    };
    WaterfallCarousel.prototype.onTouchStart = function (event) {
        this.userAction = true;
        this.startPosition = new BasicVector({
            x: event.clientX,
            y: event.clientY
        });
    };
    WaterfallCarousel.prototype.onTouchEnd = function (event) {
        this.userAction = false;
        this.dirty = false;
    };
    WaterfallCarousel.prototype.resizeHandeler = function () {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.canvasElem.width = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.dirty = true;
        this.resizeActiveShape();
    };
    WaterfallCarousel.prototype.resizeActiveShape = function () {
        for (var i = 0; i < this.itemWrapperMasks.length; i++) {
            var shape = this.itemWrapperMasks[i];
            if (!shape.visible)
                continue;
            shape.setMaskSize(this.canvasElem.width, this.canvasElem.height);
            var points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'line', x: this.windowW, y: 0 },
                { type: 'line', x: this.windowW, y: this.windowH },
                { type: 'line', x: 0, y: this.windowH }
            ];
            shape.draw(points);
        }
    };
    WaterfallCarousel.prototype.draw = function () {
        requestAnimationFrame(this.draw.bind(this));
        if (this.dirty) {
            this.positioningShapes();
        }
    };
    return WaterfallCarousel;
}());
(function () {
    'use strict';
    var imgList = [];
    var imgPreloader = function (wrapperElem) {
        return new Promise(function (resolve, reject) {
            var imgs = wrapperElem.getElementsByTagName('img'), k = 0, imgLength = imgs.length;
            for (var i = 0; i < imgLength; i++) {
                var imgObj = new Image();
                imgObj.onload = function () {
                    k++;
                    if (k == imgLength) {
                        resolve();
                    }
                };
                imgObj.src = imgs[i].getAttribute("src");
                imgList.push(imgObj.src);
            }
        });
    };
    imgPreloader(document.getElementById('toPreload')).then(function () {
        var waterFallObj = new WaterfallCarousel('mainWrapper', imgList);
    });
})();
