class MaskPloygone {

    ctx:CanvasRenderingContext2D;
    x:Number;
    y:Number;
    w:Number;
    h:Number;
    img:string;

    constructor( ctx:CanvasRenderingContext2D, x:Number, y:Number, w:Number, h:Number, imgPath:string ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        //this.img = imgPath;
    }

}
