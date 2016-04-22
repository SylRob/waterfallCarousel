var WaterfallCarousel = (function () {
    function WaterfallCarousel(wrapperId, imagesArr) {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.wrapperElem = document.getElementById(wrapperId);
        if (!this.wrapperElem)
            throw new Error('main element cannot be found');
        if (typeof imagesArr != 'object' || imagesArr.length < 1)
            throw new Error('need image tag list');
        this.imagesArr = imagesArr;
        this.initCanvas();
        this.positioningImages();
        this.initEvents();
        var loadingElem = this.wrapperElem.querySelector('.loading');
        if (loadingElem)
            this.wrapperElem.removeChild(loadingElem);
    }
    WaterfallCarousel.prototype.initEvents = function () {
        var _this = this;
        window.addEventListener('resize', function () {
            _this.windowW = window.outerWidth;
            _this.windowH = window.outerHeight;
        });
    };
    WaterfallCarousel.prototype.initCanvas = function () {
        this.canvasElem = document.createElement('canvas');
        this.canvasElem.style.width = this.canvasElem.style.height = '100%';
        this.wrapperElem.appendChild(this.canvasElem);
        this.ctx = this.canvasElem.getContext('2d');
    };
    WaterfallCarousel.prototype.positioningImages = function () {
        for (var i = 0; i < this.imagesArr.length; i++) {
        }
    };
    WaterfallCarousel.prototype.drawImageProp = function (img, x, y, w, h, offsetX, offsetY) {
        if (arguments.length === 2) {
            x = y = 0;
            w = this.ctx.canvas.width;
            h = this.ctx.canvas.height;
        }
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;
        if (offsetX < 0)
            offsetX = 0;
        if (offsetY < 0)
            offsetY = 0;
        if (offsetX > 1)
            offsetX = 1;
        if (offsetY > 1)
            offsetY = 1;
        var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
        if (nw < w)
            ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h)
            ar = h / nh;
        nw *= ar;
        nh *= ar;
        cw = iw / (nw / w);
        ch = ih / (nh / h);
        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;
        if (cx < 0)
            cx = 0;
        if (cy < 0)
            cy = 0;
        if (cw > iw)
            cw = iw;
        if (ch > ih)
            ch = ih;
        this.ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
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
        new WaterfallCarousel('mainWrapper', imgList);
    });
})();
