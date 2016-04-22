class MaskPloygone {

    ctx:CanvasRenderingContext2D;
    x:number;
    y:number;
    w:number;
    h:number;
    img:any = new Image();

    constructor( ctx:CanvasRenderingContext2D, x:number, y:number, w:number, h:number, imgPath:string ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img.src = imgPath;
    }

    drawImageProp(x, y, offsetX, offsetY) {

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
            r = Math.min(this.w / iw, this.h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;

        // decide which gap to fill
        if (nw < this.w) ar = this.w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < this.h) ar = this.h / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / this.w);
        ch = ih / (nh / this.h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        this.ctx.drawImage(this.img, cx, cy, cw, ch,  this.x, this.y, this.w, this.h);
    }

    draw() {

        this.ctx.save();
        //this.ctx.fillRect( this.x, this.y, this.w, this.h );
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.w, this.y);
        this.ctx.lineTo(this.w, this.h);
        this.ctx.lineTo(this.x, this.h);

        this.ctx.closePath();
        this.ctx.clip();
        this.drawImageProp(this.x, this.y, 0, 0);
        this.ctx.restore();

    }

}
