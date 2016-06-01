
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
    private animationTimeBase: number = 500;
    private resetMaskPositionNeeded: boolean = false;
    private startAnimationTime: number = 0;
    private touchPosition: BasicVector;
    private startPosition: BasicVector;
    private startElemPosition: Array<any>;
    private goToNext: boolean;
    private shapePoints: Array<any>;
    private visibleItems: Array<number>;
    private animationSide: string;

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
            var shape = new MaskPloygone( this.ctx, i, this.imagesArr[i] );
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
        var shapeId, shape,
        points =  [
            { type: 'line', x: 0, y: 0 },
            { type: 'line', x: this.canvasElem.width, y: 0 },
            { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
            { type: 'line', x: 0, y: this.canvasElem.height }
        ],
        mainShape = this.itemWrapperMasks[this.visibleItems[1]];

        var maskH = Math.abs( this.shapePoints[0].y - this.shapePoints[3].y );
        //upward drowing ? lets draw that first
        if( this.animationSide != null && this.visibleItems[2] != null && this.animationSide == 'upward' && this.visibleItems[2] != null) {
            if( typeof this.itemWrapperMasks[this.visibleItems[2]] == 'undefined' ) console.log( this.itemWrapperMasks, this.visibleItems[2] );
            shapeId = this.visibleItems[2];
            shape = this.itemWrapperMasks[shapeId];
            shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );
            shape.draw( points );
        }

        //downward drowing ? lets draw that first
        if( this.animationSide != null && this.visibleItems[0] != null && this.animationSide == 'downward' && this.visibleItems[0] != null ) {
            // the actual main pic must be render first
            mainShape.draw( points );
            shapeId = this.visibleItems[0];
            shape = this.itemWrapperMasks[shapeId];
            shape.setMaskSize( this.canvasElem.width, this.canvasElem.height );
            shape.draw( this.shapePoints );
        } else  mainShape.draw( this.shapePoints );

    }

    private getShapePoints( xStart, yStart, x, y ):Array<Object> {

        var xDiff = xStart - x;
        var yDiff = yStart - y;

        var bezierMaxW = Math.round( (this.canvasElem.width * 40) / 100 );
        var bezierMaxH = Math.round( (this.canvasElem.height * 40) / 100 );

        var pour = ( Math.abs(yDiff) / bezierMaxH) * 100;

        y = y > bezierMaxH ? bezierMaxH : y;//limit to max height
        pour = pour > 100 ? 100 : pour;//limit to 100%

        if( pour == 100 && ( ( this.animationSide == 'upward' && this.visibleItems[2] != null ) || ( this.animationSide == 'downward' && this.visibleItems[0] != null ) ) ) this.goToNext = true;
        else this.goToNext = false;

        var bezierW = Math.round( ((pour * bezierMaxW) /100) );
        var bezierFpX = (x - bezierW/2) < 0 ? 0 : (x - bezierW/2);
        var bezierSpX = (bezierFpX + bezierW) > this.canvasElem.width ? this.canvasElem.width : (bezierFpX + bezierW);
        var bezierY = Math.round( ((pour * Math.abs(bezierMaxH)) /100) );


        var points = [];

        if( this.animationSide == 'upward' ) {
            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'bezier', x: bezierFpX, y: 0, cp1x: x, cp1y: bezierY, cp2x: x, cp2y: bezierY, x2: bezierSpX, y2: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];

        } else if( this.visibleItems[0] == null ) {

            points = [
                { type: 'line', x: 0, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: 0 },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'bezier', x: bezierSpX, y: this.canvasElem.height, cp1x: x , cp1y: (this.canvasElem.height - bezierY), cp2x: x, cp2y: (this.canvasElem.height - bezierY), x2: bezierFpX, y2: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];

        } else {

            points = [
                { type: 'line', x: 0, y: this.canvasElem.height },
                { type: 'bezier', x: bezierSpX, y: this.canvasElem.height, cp1x: x , cp1y: (this.canvasElem.height - bezierY), cp2x: x, cp2y: (this.canvasElem.height - bezierY), x2: bezierFpX, y2: this.canvasElem.height },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: this.canvasElem.width, y: this.canvasElem.height },
                { type: 'line', x: 0, y: this.canvasElem.height }
            ];

        }

        return points;
    }

    private onTouchStart( event: any ): void {
        if( !this.isAnimated ) {
            this.userAction = true;
            var x, y;
            if( typeof event.clientX !== 'undefined' ) {
    			x = event.clientX;
    			y = event.clientY;
    		} else if ( typeof event.touches !== 'undefined' ) {
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
    }

    private onTouchMove( event: any ) {
        if( this.userAction && !this.isAnimated ){
            this.dirty = true;
            this.touchPosition = new BasicVector(event.detail);

            this.shapePoints = this.getShapePoints( this.startPosition.x, this.startPosition.y , this.touchPosition.x, this.touchPosition.y );

            if( this.startPosition.y > this.touchPosition.y ) this.animationSide = 'downward';
            else this.animationSide = 'upward';
        }

    }

    private onTouchEnd( event: MouseEvent ) {
        this.userAction = false;
        this.dirty = false;
        if( Math.abs( this.startPosition.x - this.touchPosition.x ) < 1 || Math.abs( this.startPosition.y - this.touchPosition.y ) < 1 ) return false;
        if( !this.goToNext ) this.resetMaskPositionNeeded = true;
    }

    private setNextTransition() {
        this.isAnimated = true;
        this.dirty = true;

        var totalIteration = (this.animationTimeBase/1000) * 60,//60 FPS base
        pour = this.currentIteration / totalIteration;

        if( this.currentIteration == 0 ) this.startElemPosition = JSON.parse(JSON.stringify(this.shapePoints));

        for( var i = 0; i < this.shapePoints.length; i++ ) {
            if( this.animationSide == "upward" && this.shapePoints[i].y != this.canvasElem.height ) {

                this.shapePoints[i].y = this.easeOutCubic(
                    this.currentIteration,
                    this.startElemPosition[i].y,
                    this.canvasElem.height - this.startElemPosition[i].y,
                    totalIteration
                );
                //this.startElemPosition[i].y + pour*(this.canvasElem.height - this.startElemPosition[i].y);

                if( this.shapePoints[i].type == "bezier" ) {
                    this.shapePoints[i].y2 = this.shapePoints[i].y;
                    if( this.shapePoints[i].cp1y < this.shapePoints[i].y ) this.shapePoints[i].cp1y = this.shapePoints[i].cp2y = this.shapePoints[i].y;
                }

            } else if( this.animationSide == "downward" && this.shapePoints[i].y != 0 ) {
                if( i == 3 || i == 4 ) continue;

                this.shapePoints[i].y = this.easeOutCubic(
                    this.currentIteration,
                    this.startElemPosition[i].y,
                    this.startElemPosition[i].y*-1,
                    totalIteration
                );
                //this.startElemPosition[i].y - pour*(this.startElemPosition[i].y);

                if( this.shapePoints[i].type == "bezier" ) {
                    this.shapePoints[i].y2 = this.shapePoints[i].y;
                    if( this.shapePoints[i].cp1y > this.shapePoints[i].y ) this.shapePoints[i].cp1y = this.shapePoints[i].cp2y = this.shapePoints[i].y;

                }
            }
        }


        this.currentIteration += 1;

        if( pour >= 1 ) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.goToNext = false;
            this.transitionCallBack();
        }
    }

    private transitionCallBack() {

        if( this.animationSide == 'upward' ) {

            this.visibleItems = [
                this.visibleItems[0] != null ? this.visibleItems[0] + 1 : 0,
                this.visibleItems[1] + 1,
                this.visibleItems[2] + 1 == this.imagesArr.length ? null : this.visibleItems[2] + 1,
            ];

        } else {
            this.visibleItems = [
                this.visibleItems[0] != 0 ? this.visibleItems[0] - 1 : null,
                this.visibleItems[1] - 1,
                this.visibleItems[2] != null ? this.visibleItems[2] - 1 : this.imagesArr.length - 1
            ];
        }
        this.animationSide = null;
    }

    private resetMaskPosition() {

        this.isAnimated = true;
        this.dirty = true;

        if( this.currentIteration == 0 ) this.startElemPosition = JSON.parse(JSON.stringify(this.shapePoints));

        var bezierMaxH = Math.round( (this.canvasElem.height * 20) / 100 ),
        distY = Math.abs(this.touchPosition.y - this.startPosition.y) > bezierMaxH ? bezierMaxH : Math.abs(this.touchPosition.y - this.startPosition.y),
        durationPour = distY / bezierMaxH,
        totalIteration = ( ( (this.animationTimeBase*0.6)/1000 ) * 60)*durationPour,//60 FPS base
        pour = this.currentIteration / totalIteration;

        for( var i = 0; i < this.shapePoints.length; i++ ) {
            //lets find the bezier curve and update it

            if( this.animationSide == "upward" ) {
                if( this.shapePoints[i].type == 'bezier' ) {

                    this.shapePoints[i].x = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].x,
                        this.touchPosition.x - this.startElemPosition[i].x,
                        totalIteration
                    );
                    //this.startElemPosition[i].x + pour*(this.touchPosition.x - this.startElemPosition[i].x);
                    this.shapePoints[i].x2 = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].x2,
                        this.touchPosition.x - this.startElemPosition[i].x2,
                        totalIteration
                    );
                    //this.startElemPosition[i].x2 - pour*(this.startElemPosition[i].x2 - this.touchPosition.x);
                    this.shapePoints[i].cp1y = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].cp1y,
                        this.startElemPosition[i].cp1y*-1,
                        totalIteration
                    );
                    //this.startElemPosition[i].cp1y - pour*distY;
                    this.shapePoints[i].cp2y = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].cp2y,
                        this.startElemPosition[i].cp2y*-1,
                        totalIteration
                    );
                    //this.startElemPosition[i].cp2y - pour*distY;
                }
            } else if( this.animationSide == "downward" ) {
                if( this.shapePoints[i].type == 'bezier' ) {

                    this.shapePoints[i].x = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].x,
                        this.touchPosition.x - this.startElemPosition[i].x,
                        totalIteration
                    );
                    //this.startElemPosition[i].x + pour*(this.touchPosition.x - this.startElemPosition[i].x);
                    this.shapePoints[i].x2 = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].x2,
                        this.touchPosition.x - this.startElemPosition[i].x2,
                        totalIteration
                    );
                    //this.startElemPosition[i].x2 - pour*(this.startElemPosition[i].x2 - this.touchPosition.x);
                    this.shapePoints[i].cp1y = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].cp1y,
                        this.canvasElem.height - this.startElemPosition[i].cp1y,
                        totalIteration
                    );
                    //this.startElemPosition[i].y == this.canvasElem.height ? (pour*distY) + this.startElemPosition[i].cp1y : this.shapePoints[i].cp1y - pour*distY;
                    this.shapePoints[i].cp2y = this.easeOutCubic(
                        this.currentIteration,
                        this.startElemPosition[i].cp2y,
                        this.canvasElem.height - this.startElemPosition[i].cp2y,
                        totalIteration
                    );
                    //this.startElemPosition[i].y == this.canvasElem.height ? pour*distY + this.startElemPosition[i].cp2y : this.shapePoints[i].cp2y - pour*distY;
                }
            }

        }

        this.currentIteration += 1;

        if( pour >= 1 ) {
            this.currentIteration = 0;
            this.isAnimated = false;
            this.dirty = false;
            this.resetMaskPositionNeeded = false;
            this.animationSide = null;
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
            if( this.visibleItems.indexOf(i) < 0 ) continue;
            var shape = this.itemWrapperMasks[i];
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
            this.resetMaskPosition();
        }

        if( this.goToNext && !this.userAction ) {
            if( this.startAnimationTime == 0 ) this.startAnimationTime = timeStamp;
            this.setNextTransition();
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
*   Custom event hack for IE 10
*
*/
interface Window {
    CustomEvent: CustomEvent;
}

(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt:CustomEvent = <any>document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   };

  CustomEvent.prototype = Event.prototype;

  window.CustomEvent = <any>CustomEvent;
})();

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
