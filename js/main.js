var WaterfallCarousel = (function () {
    function WaterfallCarousel(wrapperId, imagesArr) {
        this.itemWrapperElems = [];
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
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
    }
    WaterfallCarousel.prototype.initEvents = function () {
        window.addEventListener('resize', this.resizeHandeler.bind(this));
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
        for (var i = 0; i < this.imagesArr.length; i++) {
            var shape = new MaskPloygone(this.ctx, 0, 0, this.windowW, this.windowH, this.imagesArr[i]);
            this.itemWrapperElems.push(shape);
            shape.draw();
        }
    };
    WaterfallCarousel.prototype.positioningShapes = function () {
        for (var i = 0; i < this.imagesArr.length; i++) {
        }
    };
    WaterfallCarousel.prototype.resizeHandeler = function () {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;
        this.canvasElem.width = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
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
