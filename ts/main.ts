class WaterfallCarousel {

    wrapperElem: HTMLElement;
    canvasElem: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    itemWrapperMasks: Array<MaskPloygone> = [];
    imagesArr: Array<string>;
    windowW: number = window.outerWidth;
    windowH: number = window.outerHeight;
    dirty: boolean = true;
    userAction: boolean;
    touchPosition: TouchVector;
    startPosition: BasicVector;
    visibleItems: Array<number>;

    constructor( wrapperId: string, imagesArr: Array<string>) {

        this.wrapperElem = document.getElementById(wrapperId);
        if( !this.wrapperElem ) throw new Error('main element cannot be found');
        if( typeof imagesArr != 'object' || imagesArr.length < 1 ) throw new Error('need image tag list');

        this.imagesArr = imagesArr;



        this.initCanvas();
        this.initShapes();
        this.initEvents();

        var loadingElem = this.wrapperElem.querySelector('.loading');
        if( loadingElem ) this.wrapperElem.removeChild(loadingElem);

        // start the loop
        this.draw();
    }

    private initEvents():void {

        window.addEventListener('resize', this.resizeHandeler.bind(this));
        new TouchVector({listener: this.wrapperElem});

        document.addEventListener('touchVector-move', (event:any) => {
            if( this.userAction ){
                this.dirty = true;
                this.touchPosition = event.detail;
            }

        });

        this.canvasElem.addEventListener('mousedown', this.onTouchStart.bind(this), false);
        this.canvasElem.addEventListener('touchstart', this.onTouchStart.bind(this), false);

        this.canvasElem.addEventListener('mouseup', this.onTouchEnd.bind(this), false);
        this.canvasElem.addEventListener('touchend', this.onTouchEnd.bind(this), false);

    }

    private initCanvas():void {

        this.canvasElem = document.createElement('canvas');
        this.canvasElem.style.width = this.canvasElem.style.height = '100%';
        this.canvasElem.width  = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.wrapperElem.appendChild(this.canvasElem);


        this.ctx = this.canvasElem.getContext('2d');

    }

    private initShapes(): void {

        this.visibleItems = [null, 0, 1];

        for( var i = 0; i < this.imagesArr.length; i++ ) {
            var shape = new MaskPloygone( this.ctx, i, this.imagesArr[i], i == 0 ? true: false );
            this.itemWrapperMasks.push( shape );

            if( i == 0 ) {
                shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );
                var points = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.windowW, y: 0 },
                    { type: 'line', x: this.windowW, y: this.windowH },
                    { type: 'line', x: 0, y: this.windowH }
                ];
                shape.draw(points);
            }
        }

    }

    private positioningShapes(): void {

        if( typeof this.touchPosition !== 'undefined' ) {

            for( var i = 0; i < this.itemWrapperMasks.length; i++ ) {
                var shape = this.itemWrapperMasks[i];
                if( !shape.visible || !this.userAction ) continue;

                var points = this.getShapePoints( this.startPosition.x, this.startPosition.y , this.touchPosition.x, this.touchPosition.y );
                shape.draw( points );
            }
        }

    }

    private getShapePoints( xStart, yStart, x, y ):Array<Object> {

        var xDiff = xStart - x;
        var yDiff = yStart - y;

        var bezierMaxW = Math.round( (this.canvasElem.width * 70) / 100 );
        var bezierMaxH = Math.round( (this.canvasElem.height * 80) / 100 );
        var pour = ( Math.abs(yDiff) / bezierMaxH) * 100;

        console.log( pour );

        var points = [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: 0, y: 0 }
        ]

        return [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: this.windowW, y: 0 },
            { type: 'line', x: this.windowW, y: this.windowH },
            { type: 'line', x: 0, y: this.windowH }
        ]
    }

    private onTouchStart( event: MouseEvent ): void {
        this.userAction = true;

        this.startPosition = new BasicVector({
            x: event.clientX,
            y: event.clientY
        });

    }

    private onTouchEnd( event: MouseEvent ): void {
        this.userAction = false;
        this.dirty = false;
    }

    private resizeHandeler(): void {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;

        this.canvasElem.width  = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.dirty = true;

        this.resizeActiveShape();

    }

    private resizeActiveShape() {
        for( var i = 0; i < this.itemWrapperMasks.length; i++ ) {
            var shape = this.itemWrapperMasks[i];
            if( !shape.visible ) continue;
                shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );

                var points = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.windowW, y: 0 },
                    { type: 'line', x: this.windowW, y: this.windowH },
                    { type: 'line', x: 0, y: this.windowH }
                ];
                shape.draw( points );
        }
    }

    private draw(): void {
        requestAnimationFrame(this.draw.bind(this));

        if(this.dirty) {
            /*this.ctx.save();
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect( 0, 0, this.canvasElem.width, this.canvasElem.height );
            this.ctx.restore();*/
            this.positioningShapes();

        }

    }

}


/**
*   preloader
*
*/

(function() {
    'use strict'
    var imgList: Array<string> = [];
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
        var waterFallObj: WaterfallCarousel = new WaterfallCarousel('mainWrapper', imgList);
    });



})()
