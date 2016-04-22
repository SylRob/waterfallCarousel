class WaterfallCarousel {

    wrapperElem:HTMLElement;
    canvasElem:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    itemWrapperElems:Array<MaskPloygone> = [];
    imagesArr:Array<string>;
    windowW:number = window.outerWidth;
    windowH:number = window.outerHeight;

    constructor( wrapperId:string, imagesArr:Array<string>) {

        this.wrapperElem = document.getElementById(wrapperId);
        if( !this.wrapperElem ) throw new Error('main element cannot be found');
        if( typeof imagesArr != 'object' || imagesArr.length < 1 ) throw new Error('need image tag list');

        this.imagesArr = imagesArr;

        this.initCanvas();
        this.initShapes();
        this.initEvents();

        var loadingElem = this.wrapperElem.querySelector('.loading');
        if( loadingElem ) this.wrapperElem.removeChild(loadingElem);
    }

    initEvents():void {

        window.addEventListener('resize', this.resizeHandeler.bind(this));
    }

    initCanvas():void {

        this.canvasElem = document.createElement('canvas');
        this.canvasElem.style.width = this.canvasElem.style.height = '100%';
        this.canvasElem.width  = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.wrapperElem.appendChild(this.canvasElem);


        this.ctx = this.canvasElem.getContext('2d');

    }

    initShapes():void {


        for( var i = 0; i < this.imagesArr.length; i++ ) {
            var shape = new MaskPloygone( this.ctx, 0, 0, this.windowW, this.windowH, this.imagesArr[i] );
            this.itemWrapperElems.push( shape );
            shape.draw();
        }

    }

    positioningShapes():void {


        for( var i = 0; i < this.imagesArr.length; i++ ) {

        }

    }

    resizeHandeler() {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;

        this.canvasElem.width  = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;

    }

}


/**
*   preloader
*
*/

(function() {
    'use strict'
    var imgList:Array<string> = [];
    var imgPreloader = function( wrapperElem ) {
        return new Promise((resolve, reject) => {
            var imgs = wrapperElem.getElementsByTagName('img'),
            k = 0,
            imgLength = imgs.length;


            for( var i = 0; i < imgLength; i++ ) {

                var imgObj = new Image();
                imgObj.onload = function() {
                    k++;
                    if( k==imgLength ) { resolve() }
                }
                imgObj.src = imgs[i].getAttribute("src");
                imgList.push( imgObj.src );
            }
        })
    }//imgPreloader()


    /**
    *
    * Let's Start
    *
    */

    imgPreloader( document.getElementById('toPreload') ).then( () => {
        new WaterfallCarousel('mainWrapper', imgList);
    });



})()
