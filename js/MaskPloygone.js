var MaskPloygone = (function () {
    function MaskPloygone(ctx, x, y, w, h, imgPath) {
        this.img = new Image();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img.src = imgPath;
    }
    MaskPloygone.prototype.drawImageProp = function (x, y, offsetX, offsetY) {
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;
        if (offsetX < 0)
            offsetX = 0;
        if (offsetY < 0)
            offsetY = 0;
        if (offsetX > 1)
            offsetX = 1;
        if (offsetY > 1)
            offsetY = 1;
        var iw = this.img.width, ih = this.img.height, r = Math.min(this.w / iw, this.h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
        if (nw < this.w)
            ar = this.w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < this.h)
            ar = this.h / nh;
        nw *= ar;
        nh *= ar;
        cw = iw / (nw / this.w);
        ch = ih / (nh / this.h);
        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;
        if (cx < 0)
            cx = 0;
        if (cy < 0)
            cy = 0;
        if (cw > iw)
            cw = iw;
        if (ch > ih)
            ch = ih;
        this.ctx.drawImage(this.img, cx, cy, cw, ch, this.x, this.y, this.w, this.h);
    };
    MaskPloygone.prototype.draw = function () {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.w, this.y);
        this.ctx.lineTo(this.w, this.h);
        this.ctx.lineTo(this.x, this.h);
        this.ctx.closePath();
        this.ctx.clip();
        this.drawImageProp(this.x, this.y, 0, 0);
        this.ctx.restore();
    };
    return MaskPloygone;
}());
