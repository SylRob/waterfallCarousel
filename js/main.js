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
