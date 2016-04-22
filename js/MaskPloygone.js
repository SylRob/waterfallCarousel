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
    MaskPloygone.prototype.drawImageProp = function (img, x, y, w, h, offsetX, offsetY) {
        if (arguments.length === 2) {
            x = y = 0;
            w = this.ctx.canvas.width;
            h = this.ctx.canvas.height;
        }
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
        var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
        if (nw < w)
            ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h)
            ar = h / nh;
        nw *= ar;
        nh *= ar;
        cw = iw / (nw / w);
        ch = ih / (nh / h);
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
        this.ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    };
    return MaskPloygone;
}());
