class WaterfallCarousel {

    private wrapperElem: HTMLElement;
    private canvasElem: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private itemWrapperMasks: Array<MaskPloygone> = [];
    private imagesArr: Array<string>;
    private windowW: number = window.outerWidth;
    private windowH: number = window.outerHeight;
    private dirty: boolean = true;
    private userAction: boolean;
    private isAnimated:boolean = false;
    private animationTimeBase: number = 200;
    private resetMaskPositionNeeded: boolean = false;
    private startAnimationTime: number = 0;
    private touchPosition: TouchVector;
    private startPosition: BasicVector;
    private goToNext: boolean;
    private shapePoints: Array<any>;
    private visibleItems: Array<number>;

    private currentIteration: number = 0;

    constructor( wrapperId: string, imagesArr: Array<string>) {

        this.wrapperElem = document.getElementById(wrapperId);
        if( !this.wrapperElem ) throw new Error('main element cannot be found');
        if( typeof imagesArr != 'object' || imagesArr.length < 1 ) throw new Error('need image tag list');

        this.imagesArr = imagesArr;



        this.initCanvas();
        this.initMask();
        this.initEvents();

        var loadingElem = this.wrapperElem.querySelector('.loading');
        if( loadingElem ) this.wrapperElem.removeChild(loadingElem);

        // start the loop
        this.draw(0);
    }

    private initEvents():void {

        window.addEventListener('resize', this.resizeHandeler.bind(this));
        new TouchVector({listener: this.wrapperElem});

        document.addEventListener('touchVector-move', this.onTouchMove.bind(this), false);

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

    private initMask(): void {

        this.visibleItems = [null, 0, 1];

        for( var i = 0; i < this.imagesArr.length; i++ ) {
            var shape = new MaskPloygone( this.ctx, i, this.imagesArr[i], i == 0 ? true: false );
            this.itemWrapperMasks.push( shape );

            if( i == 0 ) {
                shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );
                this.shapePoints = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                    { type: 'line', x: 0, y: this.canvasElem.height }
                ];


                shape.draw(this.shapePoints);
            }
        }

    }

    private positioningMask(): void {

        this.ctx.clearRect( 0, 0, this.canvasElem.width, this.canvasElem.height );
        for( var i = this.itemWrapperMasks.length -1; i > -1; i-- ) {
            var shape = this.itemWrapperMasks[i];

            //next image that go under
            if( this.itemWrapperMasks[i-1] && this.itemWrapperMasks[i-1].visible ) {
                shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );
                var points = [
                    { type: 'line', x: 0, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: 0 },
                    { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                    { type: 'line', x: 0, y: this.canvasElem.height }
                ];
                shape.draw( points );
            }
            else if( shape.visible ) {
                //main image
                shape.draw( this.shapePoints );
            }
        }

    }

    private getShapePoints( xStart, yStart, x, y ):Array<Object> {

        var xDiff = xStart - x;
        var yDiff = yStart - y;

        var bezierMaxW = Math.round( (this.canvasElem.width * 70) / 100 );
        var bezierMaxH = Math.round( (this.canvasElem.height * 70) / 100 );

        var pour = ( Math.abs(yDiff) / bezierMaxH) * 100;

        y = y > bezierMaxH ? bezierMaxH : y;//limit to max height
        pour = pour > 100 ? 100 : pour;//limit to 100%

        if( pour == 100 ) this.goToNext = true;

        var bezierW = Math.round( ((pour * bezierMaxW) /100) );
        var bezierFpX = (x - bezierW/2) < 0 ? 0 : (x - bezierW/2);
        var bezierSpX = (bezierFpX + bezierW) > this.canvasElem.width ? this.canvasElem.width : (bezierFpX + bezierW);
        var bezierY = Math.round( ((pour * Math.abs(bezierMaxH)) /100) );


        var points = [];
        //bottom to top
        if( yDiff < 0 ) {
            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'bezier', x: bezierFpX, y: 0, cp1x: x, cp1y: bezierY, cp2x: x, cp2y: bezierY, x2: bezierSpX, y2: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];

        } else {
            //top to bottom
            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'bezier', x: bezierSpX, y: this.canvasElem.height, cp1x: x , cp1y: (this.canvasElem.height - bezierY), cp2x: x, cp2y: (this.canvasElem.height - bezierY), x2: bezierFpX, y2: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];

        }

        return points;
    }

    private onTouchStart( event: any ): void {
        if( !this.isAnimated ) {
            this.userAction = true;

            if( typeof event.clientX !== 'undefined' ) {
    			var x = event.clientX;
    			var y = event.clientY;
    		} else if ( typeof event.touches !== 'undefined' ) {
    			var x = event.touches[0].clientX;
    			var y = event.touches[0].clientY;
    		}

            this.startPosition = new BasicVector({
                x: x,
                y: y
            });
        }
    }

    private onTouchMove( event: any ): void {
        if( this.userAction && !this.isAnimated && !this.goToNext ){
            console.log( 'mouveeeeeeee', this.goToNext );
            this.dirty = true;
            this.touchPosition = event.detail;
            this.shapePoints = this.getShapePoints( this.startPosition.x, this.startPosition.y , this.touchPosition.x, this.touchPosition.y );
        }
    }

    private onTouchEnd( event: MouseEvent ): void {
        this.userAction = false;
        this.dirty = false;

        if( !this.goToNext ) this.resetMaskPositionNeeded = true;
    }

    private setNextTransition( newTime ) {
        this.isAnimated = true;
        this.dirty = true;

        var timeDiff = Math.round( newTime - this.startAnimationTime ),
        totalIteration = (this.animationTimeBase/2000) * 60,//60 FPS base
        pour = this.currentIteration / totalIteration;

        for( var i = 0; i < this.shapePoints.length; i++ ) {
            if( this.shapePoints[i].y != this.canvasElem.height ) {
                this.shapePoints[i].y = this.shapePoints[i].y + pour*(this.touchPosition.y - this.shapePoints[i].y);
            }
        }

        this.currentIteration += 1;

        if( pour >= 1 ) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.goToNext = false;
        }
    }

    private resetMaskPosition( newTime ) {

        this.isAnimated = true;
        this.dirty = true;

        //var dist =
        var timeDiff = Math.round( newTime - this.startAnimationTime ),
        totalIteration = (this.animationTimeBase/1000) * 60,//60 FPS base
        pour = this.currentIteration / totalIteration,
        bezierMaxH = Math.round( (this.canvasElem.height * 70) / 100 ),
        distY = Math.abs(this.touchPosition.y - this.startPosition.y) > bezierMaxH ? bezierMaxH : Math.abs(this.touchPosition.y - this.startPosition.y);

        for( var i = 0; i < this.shapePoints.length; i++ ) {
            //lets find the bezier curve and update it

            if( this.shapePoints[i].type == 'bezier' ) {

                this.shapePoints[i].x = this.shapePoints[i].x + pour*(this.touchPosition.x - this.shapePoints[i].x);
                this.shapePoints[i].x2 = this.shapePoints[i].x2 - pour*(this.shapePoints[i].x2 - this.touchPosition.x);
                this.shapePoints[i].cp1y = this.shapePoints[i].y == this.canvasElem.height ? (pour*distY) + this.shapePoints[i].cp1y : this.shapePoints[i].cp1y - pour*distY;
                this.shapePoints[i].cp2y = this.shapePoints[i].y == this.canvasElem.height ? pour*distY + this.shapePoints[i].cp2y : this.shapePoints[i].cp2y - pour*distY;
            }
        }

        this.currentIteration += 1;

        if( pour >= 1 ) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.resetMaskPositionNeeded = false;
        }

    }

    private resizeHandeler(): void {
        this.windowW = window.outerWidth;
        this.windowH = window.outerHeight;

        this.canvasElem.width  = this.wrapperElem.offsetWidth;
        this.canvasElem.height = this.wrapperElem.offsetHeight;
        this.dirty = true;

        this.resizeActiveMask();

    }

    private resizeActiveMask() {
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

    private draw( timeStamp ): void {

        if( this.resetMaskPositionNeeded ) {
            if( this.startAnimationTime == 0 ) this.startAnimationTime = timeStamp;
            this.resetMaskPosition( timeStamp );
        }

        if( this.goToNext ) {
            if( this.startAnimationTime == 0 ) this.startAnimationTime = timeStamp;
            this.setNextTransition( timeStamp );
        }

        if(this.dirty) {
            this.positioningMask();
        }

        this.dirty = false;
        requestAnimationFrame(this.draw.bind(this));
    }

    private easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
        return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
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
