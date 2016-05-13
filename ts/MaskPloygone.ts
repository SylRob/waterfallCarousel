class MaskPloygone {

    private ctx:CanvasRenderingContext2D;
    public img: any = new Image();
    public id: number;
    private w: number;
    private h: number;
    public shapePoints: Array<any>;
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

    getImagePropPoints(x, y, x2, y2, offsetX, offsetY) {

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
        return {
            cx: cx,
            cy: cy,
            cw: cw,
            ch: ch,
            x: x,
            y: y,
            x2: x2,
            y2: y2
        };
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
            }
        }

        this.ctx.closePath();
        this.ctx.clip();
        var imgPoints = this.getImagePropPoints(points[0].x, points[0].y, this.w, this.h, 0, 0);
        this.ctx.drawImage(this.img, imgPoints.cx, imgPoints.cy, imgPoints.cw, imgPoints.ch,  imgPoints.x, imgPoints.y, imgPoints.x2, imgPoints.y2);
        this.transformImageProcess( imgPoints );
        this.ctx.restore();

    }

    private transformImageProcess( imgPoints ) {

        for( var i = 0; i < this.shapePoints.length; i++ ) {
            var points = this.shapePoints[i];

            if( points.type == 'bezier' ) {
                var bezierDist = Math.abs(points.x2 - points.x);

                for( var j = 0; j < bezierDist; j++ ) {
                    var pour = j / bezierDist;
                    //var startPoint = this.bezierPoints( { x: points.x, y: points.y}, {x: points.cp1x, y: points.cp1y}, {x: points.cp2x, y: points.cp2y}, {x: points.x2, y: points.y2}, pour );
                    var startPoint =  this.bezierPointsV2( points.x, points.y, points.cp1x, points.cp1y, points.cp2x, points.cp2y, points.x2, points.y2, pour );

                    /*this.ctx.rect(startPoint.x,startPoint.y,4, Math.abs(imgPoints.y2-startPoint.y));
                    this.ctx.clip();*/
                    this.ctx.drawImage(this.img, startPoint.x, imgPoints.cy, 4, imgPoints.ch, startPoint.x, startPoint.y, 4, Math.abs(imgPoints.y2-startPoint.y));
                }

            }
        }

    }

    /**
    *   Points are objects with x and y properties
    *   p0: start point
    *   p1: handle of start point
    *   p2: handle of end point
    *   p3: end point
    *   t: progression along curve 0..1
    *   returns an object containing x and y values for the given t
    **/
    private bezierPoints(p0, p1, p2, p3, t):any {
        var ret = {};
        var coords = ['x', 'y'];
        var i, k;

        for (i in coords) {
            k = coords[i];
            ret[k] = Math.pow(1 - t, 3) * p0[k] + 3 * Math.pow(1 - t, 2) * t * p1[k] + 3 * (1 - t) * Math.pow(t, 2) * p2[k] + Math.pow(t, 3) * p3[k];
        }

        return ret;
    }

    private bezierPointsV2( p0x, p0y, cp0x, cp0y, cp1x, cp1y, p1x, p1y,  t ):any {
        var Ax = ( (1 - t) * p0x ) + (t * cp0x);
        var Ay = ( (1 - t) * p0y ) + (t * cp0y);
        var Bx = ( (1 - t) * cp0x ) + (t * cp1x);
        var By = ( (1 - t) * cp0y ) + (t * cp1y);
        var Cx = ( (1 - t) * cp1x ) + (t * p1x);
        var Cy = ( (1 - t) * cp1y ) + (t * p1y);

        var Dx = ( (1 - t) * Ax ) + (t * Bx);
        var Dy = ( (1 - t) * Ay ) + (t * By);

        var Ex = ( (1 - t) * Bx ) + (t * Cx);
        var Ey = ( (1 - t) * By ) + (t * Cy);

        var Px = ( (1 - t) * Dx ) + (t * Ex);
        var Py = ( (1 - t) * Dy ) + (t * Ey);

        return { x: Math.round(Px), y: Math.round(Py) };
    }

}
