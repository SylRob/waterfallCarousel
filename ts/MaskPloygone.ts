class MaskPloygone {

    ctx:CanvasRenderingContext2D;
    img: any = new Image();
    id: number;
    w: number;
    h: number;
    shapePoints: Array<any>;
    visible: boolean;

    constructor( ctx:CanvasRenderingContext2D, id:number, imgPath: string, visible: boolean ) {
        this.ctx = ctx;
        this.id = id;
        this.img.src = imgPath;
        this.visible = visible;
    }

    setMaskSize( w: number, h: number ) {
        this.w = w;
        this.h = h;
    }

    setBezierPoints( xAxis: number, yDistance:number ) {

        if( yDistance < 1 && yDistance > -1 ) {

        }

    }

    drawImageProp(x, y, x2, y2, offsetX, offsetY) {

        // default offset is center
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;

        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        var iw = this.img.width,
            ih = this.img.height,
            r = Math.min(x2 / iw, y2 / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;

        // decide which gap to fill
        if (nw < x2) ar = x2 / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < y2) ar = y2 / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / x2);
        ch = ih / (nh / y2);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        this.ctx.drawImage(this.img, cx, cy, cw, ch,  x, y, x2, y2);
    }

    draw( points:Array<any> ) {

        points = points || this.shapePoints;

        this.ctx.save();
        //this.ctx.fillRect( this.x, this.y, this.w, this.h );
        this.ctx.beginPath();

        this.shapePoints = points;
        var changeColor = false;
        for( var i = 0; i < points.length; i++ ) {
            if( i == 0 ) this.ctx.moveTo( points[i].x, points[i].y )
            if( points[i].type == 'line' ) {
                this.ctx.lineTo( points[i].x, points[i].y );
            } else if ( points[i].type == 'bezier' ) {
                this.ctx.lineTo( points[i].x, points[i].y );
                this.ctx.bezierCurveTo(
                    points[i].cp1x, points[i].cp1y,
                    points[i].cp2x, points[i].cp2y,
                    points[i].x2, points[i].y2 );
                changeColor = true;
            }
        }

        this.ctx.closePath();
        this.ctx.clip();
        this.drawImageProp(points[0].x, points[0].y, this.w, this.h, 0, 0);
        this.ctx.restore();

    }

}
