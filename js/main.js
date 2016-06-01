var WaterfallCarousel = (function () {
    function WaterfallCarousel(wrapperId, imagesArr) {
        this.itemWrapperMasks = [];
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.dirty = true;
        this.isAnimated = false;
        this.animationTimeBase = 500;
        this.resetMaskPositionNeeded = false;
        this.startAnimationTime = 0;
        this.currentIteration = 0;
        this.wrapperElem = document.getElementById(wrapperId);
        if (!this.wrapperElem)
            throw new Error('main element cannot be found');
        if (typeof imagesArr != 'object' || imagesArr.length < 1)
            throw new Error('need image tag list');
        this.imagesArr = imagesArr;
        this.initCanvas();
        this.initMask();
        this.initEvents();
        var loadingElem = this.wrapperElem.querySelector('.loading');
        if (loadingElem)
            this.wrapperElem.removeChild(loadingElem);
        this.draw(0);
    }
    WaterfallCarousel.prototype.initEvents = function () {
        window.addEventListener('resize', this.resizeHandeler.bind(this));
        new TouchVector({ listener: this.wrapperElem });
        document.addEventListener('touchVector-move', this.onTouchMove.bind(this), false);
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
    WaterfallCarousel.prototype.initMask = function () {
        this.visibleItems = [null, 0, 1];
        for (var i = 0; i < this.imagesArr.length; i++) {
            var shape = new MaskPloygone(this.ctx, i, this.imagesArr[i]);
            this.itemWrapperMasks.push(shape);
            if (i == 0) {
                shape.setMaskSize(this.canvasElem.width, this.canvasElem.height);
                this.shapePoints = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                    { type: 'line', x: 0, y: this.canvasElem.height }
                ];
                shape.draw(this.shapePoints);
            }
        }
    };
    WaterfallCarousel.prototype.positioningMask = function () {
        this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
        var shapeId, shape, points = [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: this.canvasElem.width, y: 0 },
            { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
            { type: 'line', x: 0, y: this.canvasElem.height }
        ], mainShape = this.itemWrapperMasks[this.visibleItems[1]];
        var maskH = Math.abs(this.shapePoints[0].y - this.shapePoints[3].y);
        if (this.animationSide != null && this.visibleItems[2] != null && this.animationSide == 'upward' && this.visibleItems[2] != null) {
            if (typeof this.itemWrapperMasks[this.visibleItems[2]] == 'undefined')
                console.log(this.itemWrapperMasks, this.visibleItems[2]);
            shapeId = this.visibleItems[2];
            shape = this.itemWrapperMasks[shapeId];
            shape.setMaskSize(this.canvasElem.width, this.canvasElem.height);
            shape.draw(points);
        }
        if (this.animationSide != null && this.visibleItems[0] != null && this.animationSide == 'downward' && this.visibleItems[0] != null) {
            mainShape.draw(points);
            shapeId = this.visibleItems[0];
            shape = this.itemWrapperMasks[shapeId];
            shape.setMaskSize(this.canvasElem.width, this.canvasElem.height);
            shape.draw(this.shapePoints);
        }
        else
            mainShape.draw(this.shapePoints);
    };
    WaterfallCarousel.prototype.getShapePoints = function (xStart, yStart, x, y) {
        var xDiff = xStart - x;
        var yDiff = yStart - y;
        var bezierMaxW = Math.round((this.canvasElem.width * 40) / 100);
        var bezierMaxH = Math.round((this.canvasElem.height * 40) / 100);
        var pour = (Math.abs(yDiff) / bezierMaxH) * 100;
        y = y > bezierMaxH ? bezierMaxH : y;
        pour = pour > 100 ? 100 : pour;
        if (pour == 100 && ((this.animationSide == 'upward' && this.visibleItems[2] != null) || (this.animationSide == 'downward' && this.visibleItems[0] != null)))
            this.goToNext = true;
        else
            this.goToNext = false;
        var bezierW = Math.round(((pour * bezierMaxW) / 100));
        var bezierFpX = (x - bezierW / 2) < 0 ? 0 : (x - bezierW / 2);
        var bezierSpX = (bezierFpX + bezierW) > this.canvasElem.width ? this.canvasElem.width : (bezierFpX + bezierW);
        var bezierY = Math.round(((pour * Math.abs(bezierMaxH)) / 100));
        var points = [];
        if (this.animationSide == 'upward') {
            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'bezier', x: bezierFpX, y: 0, cp1x: x, cp1y: bezierY, cp2x: x, cp2y: bezierY, x2: bezierSpX, y2: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];
        }
        else if (this.visibleItems[0] == null) {
            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'bezier', x: bezierSpX, y: this.canvasElem.height, cp1x: x, cp1y: (this.canvasElem.height - bezierY), cp2x: x, cp2y: (this.canvasElem.height - bezierY), x2: bezierFpX, y2: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];
        }
        else {
            points = [
                { type: 'line', x: 0, y: this.canvasElem.height },
                { type: 'bezier', x: bezierSpX, y: this.canvasElem.height, cp1x: x, cp1y: (this.canvasElem.height - bezierY), cp2x: x, cp2y: (this.canvasElem.height - bezierY), x2: bezierFpX, y2: this.canvasElem.height },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];
        }
        return points;
    };
    WaterfallCarousel.prototype.onTouchStart = function (event) {
        if (!this.isAnimated) {
            this.userAction = true;
            var x, y;
            if (typeof event.clientX !== 'undefined') {
                x = event.clientX;
                y = event.clientY;
            }
            else if (typeof event.touches !== 'undefined') {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            }
            this.startPosition = new BasicVector({
                x: x,
                y: y
            });
            this.touchPosition = new BasicVector({
                x: x,
                y: y
            });
        }
    };
    WaterfallCarousel.prototype.onTouchMove = function (event) {
        if (this.userAction && !this.isAnimated) {
            this.dirty = true;
            this.touchPosition = new BasicVector(event.detail);
            this.shapePoints = this.getShapePoints(this.startPosition.x, this.startPosition.y, this.touchPosition.x, this.touchPosition.y);
            if (this.startPosition.y > this.touchPosition.y)
                this.animationSide = 'downward';
            else
                this.animationSide = 'upward';
        }
    };
    WaterfallCarousel.prototype.onTouchEnd = function (event) {
        this.userAction = false;
        this.dirty = false;
        if (Math.abs(this.startPosition.x - this.touchPosition.x) < 1 || Math.abs(this.startPosition.y - this.touchPosition.y) < 1)
            return false;
        if (!this.goToNext)
            this.resetMaskPositionNeeded = true;
    };
    WaterfallCarousel.prototype.setNextTransition = function () {
        this.isAnimated = true;
        this.dirty = true;
        var totalIteration = (this.animationTimeBase / 1000) * 60, pour = this.currentIteration / totalIteration;
        if (this.currentIteration == 0)
            this.startElemPosition = JSON.parse(JSON.stringify(this.shapePoints));
        for (var i = 0; i < this.shapePoints.length; i++) {
            if (this.animationSide == "upward" && this.shapePoints[i].y != this.canvasElem.height) {
                this.shapePoints[i].y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].y, this.canvasElem.height - this.startElemPosition[i].y, totalIteration);
                if (this.shapePoints[i].type == "bezier") {
                    this.shapePoints[i].y2 = this.shapePoints[i].y;
                    if (this.shapePoints[i].cp1y < this.shapePoints[i].y)
                        this.shapePoints[i].cp1y = this.shapePoints[i].cp2y = this.shapePoints[i].y;
                }
            }
            else if (this.animationSide == "downward" && this.shapePoints[i].y != 0) {
                if (i == 3 || i == 4)
                    continue;
                this.shapePoints[i].y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].y, this.startElemPosition[i].y * -1, totalIteration);
                if (this.shapePoints[i].type == "bezier") {
                    this.shapePoints[i].y2 = this.shapePoints[i].y;
                    if (this.shapePoints[i].cp1y > this.shapePoints[i].y)
                        this.shapePoints[i].cp1y = this.shapePoints[i].cp2y = this.shapePoints[i].y;
                }
            }
        }
        this.currentIteration += 1;
        if (pour >= 1) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.goToNext = false;
            this.transitionCallBack();
        }
    };
    WaterfallCarousel.prototype.transitionCallBack = function () {
        if (this.animationSide == 'upward') {
            this.visibleItems = [
                this.visibleItems[0] != null ? this.visibleItems[0] + 1 : 0,
                this.visibleItems[1] + 1,
                this.visibleItems[2] + 1 == this.imagesArr.length ? null : this.visibleItems[2] + 1,
            ];
        }
        else {
            this.visibleItems = [
                this.visibleItems[0] != 0 ? this.visibleItems[0] - 1 : null,
                this.visibleItems[1] - 1,
                this.visibleItems[2] != null ? this.visibleItems[2] - 1 : this.imagesArr.length - 1
            ];
        }
        this.animationSide = null;
    };
    WaterfallCarousel.prototype.resetMaskPosition = function () {
        this.isAnimated = true;
        this.dirty = true;
        if (this.currentIteration == 0)
            this.startElemPosition = JSON.parse(JSON.stringify(this.shapePoints));
        var bezierMaxH = Math.round((this.canvasElem.height * 20) / 100), distY = Math.abs(this.touchPosition.y - this.startPosition.y) > bezierMaxH ? bezierMaxH : Math.abs(this.touchPosition.y - this.startPosition.y), durationPour = distY / bezierMaxH, totalIteration = (((this.animationTimeBase * 0.6) / 1000) * 60) * durationPour, pour = this.currentIteration / totalIteration;
        for (var i = 0; i < this.shapePoints.length; i++) {
            if (this.animationSide == "upward") {
                if (this.shapePoints[i].type == 'bezier') {
                    this.shapePoints[i].x = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].x, this.touchPosition.x - this.startElemPosition[i].x, totalIteration);
                    this.shapePoints[i].x2 = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].x2, this.touchPosition.x - this.startElemPosition[i].x2, totalIteration);
                    this.shapePoints[i].cp1y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].cp1y, this.startElemPosition[i].cp1y * -1, totalIteration);
                    this.shapePoints[i].cp2y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].cp2y, this.startElemPosition[i].cp2y * -1, totalIteration);
                }
            }
            else if (this.animationSide == "downward") {
                if (this.shapePoints[i].type == 'bezier') {
                    this.shapePoints[i].x = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].x, this.touchPosition.x - this.startElemPosition[i].x, totalIteration);
                    this.shapePoints[i].x2 = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].x2, this.touchPosition.x - this.startElemPosition[i].x2, totalIteration);
                    this.shapePoints[i].cp1y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].cp1y, this.canvasElem.height - this.startElemPosition[i].cp1y, totalIteration);
                    this.shapePoints[i].cp2y = this.easeOutCubic(this.currentIteration, this.startElemPosition[i].cp2y, this.canvasElem.height - this.startElemPosition[i].cp2y, totalIteration);
                }
            }
        }
        this.currentIteration += 1;
        if (pour >= 1) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.resetMaskPositionNeeded = false;
            this.animationSide = null;
        }
    };
    WaterfallCarousel.prototype.resizeHandeler = function () {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.canvasElem.width = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.dirty = true;
        this.resizeActiveMask();
    };
    WaterfallCarousel.prototype.resizeActiveMask = function () {
        for (var i = 0; i < this.itemWrapperMasks.length; i++) {
            if (this.visibleItems.indexOf(i) < 0)
                continue;
            var shape = this.itemWrapperMasks[i];
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
    WaterfallCarousel.prototype.draw = function (timeStamp) {
        if (this.resetMaskPositionNeeded) {
            if (this.startAnimationTime == 0)
                this.startAnimationTime = timeStamp;
            this.resetMaskPosition();
        }
        if (this.goToNext && !this.userAction) {
            if (this.startAnimationTime == 0)
                this.startAnimationTime = timeStamp;
            this.setNextTransition();
        }
        if (this.dirty) {
            this.positioningMask();
        }
        this.dirty = false;
        requestAnimationFrame(this.draw.bind(this));
    };
    WaterfallCarousel.prototype.easeOutCubic = function (currentIteration, startValue, changeInValue, totalIterations) {
        return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
    };
    return WaterfallCarousel;
}());
(function () {
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    ;
    CustomEvent.prototype = Event.prototype;
    window.CustomEvent = CustomEvent;
})();
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
