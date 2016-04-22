class WaterfallCarousel {

    wrapperElem:HTMLElement;
    canvasElem:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    itemWrapperElems:NodeListOf<Element>;
    imagesArr:Array<String>;
    windowW:Number = window.outerWidth;
    windowH:Number = window.outerHeight;

    constructor( wrapperId:string, imagesArr:Array<String>) {

        this.wrapperElem = document.getElementById(wrapperId);
        if( !this.wrapperElem ) throw new Error('main element cannot be found');
        if( typeof imagesArr != 'object' || imagesArr.length < 1 ) throw new Error('need image tag list');

        this.imagesArr = imagesArr;

        this.initCanvas();
        this.positioningImages();
        this.initEvents();

        var loadingElem = this.wrapperElem.querySelector('.loading');
        if( loadingElem ) this.wrapperElem.removeChild(loadingElem);
    }

    public initEvents():void {

        window.addEventListener('resize', ()=>{
            this.windowW = window.outerWidth;
            this.windowH = window.outerHeight;
        })
    }

    public initCanvas():void {

        this.canvasElem = document.createElement('canvas');
        this.canvasElem.style.width = this.canvasElem.style.height = '100%';
        this.wrapperElem.appendChild(this.canvasElem);

        this.ctx = this.canvasElem.getContext('2d');

    }

    public positioningImages():void {


        for( var i = 0; i < this.imagesArr.length; i++ ) {

        }

    }

}


/**
*   preloader
*
*/

(function() {
    'use strict'
    var imgList:Array<String> = [];
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
