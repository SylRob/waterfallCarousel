var MaskPloygone = (function () {
    function MaskPloygone(ctx, id, imgPath, visible) {
        this.img = new Image();
        this.ctx = ctx;
        this.id = id;
        this.img.src = imgPath;
        this.visible = visible;
    }
    MaskPloygone.prototype.setMaskSize = function (w, h) {
        this.w = w;
        this.h = h;
    };
    MaskPloygone.prototype.setBezierPoints = function (xAxis, yDistance) {
        if (yDistance < 1 && yDistance > -1) {
        }
    };
    MaskPloygone.prototype.drawImageProp = function (x, y, x2, y2, offsetX, offsetY) {
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
        var iw = this.img.width, ih = this.img.height, r = Math.min(x2 / iw, y2 / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
        if (nw < x2)
            ar = x2 / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < y2)
            ar = y2 / nh;
        nw *= ar;
        nh *= ar;
        cw = iw / (nw / x2);
        ch = ih / (nh / y2);
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
        this.ctx.drawImage(this.img, cx, cy, cw, ch, x, y, x2, y2);
    };
    MaskPloygone.prototype.draw = function (points) {
        points = points || this.shapePoints;
        this.ctx.save();
        this.ctx.beginPath();
        this.shapePoints = points;
        for (var i = 0; i < points.length; i++) {
            if (i == 0)
                this.ctx.moveTo(points[i].x, points[i].y);
            if (points[i].type == 'line') {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
            else if (points[i].type == 'bezier') {
                this.ctx.moveTo(points[i].x, points[i].y);
                this.ctx.bezierCurveTo(points[i].cp1x, points[i].cp1y, points[i].cp2x, points[i].cp2y, points[i].x2, points[i].y2);
            }
        }
        this.ctx.closePath();
        this.ctx.clip();
        this.drawImageProp(points[0].x, points[0].y, this.w, this.h, 0, 0);
        this.ctx.restore();
    };
    return MaskPloygone;
}());
