var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BasicVector = (function () {
    function BasicVector(options) {
        this._x = 0;
        this._y = 0;
        if (options) {
            if (options.x)
                this._x = options.x;
            if (options.y)
                this._y = options.y;
        }
    }
    Object.defineProperty(BasicVector.prototype, "x", {
        get: function () { return this._x; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(BasicVector.prototype, "y", {
        get: function () { return this._y; },
        enumerable: true,
        configurable: true
    });
    ;
    return BasicVector;
}());
var TouchVector = (function (_super) {
    __extends(TouchVector, _super);
    function TouchVector(options) {
        _super.call(this, options);
        this._xDirection = "";
        this._yDirection = "";
        var listener = document;
        if (options) {
            if (options.listener)
                listener = options.listener;
        }
        listener.addEventListener("mousemove", this.onTouchMove.bind(this), false);
        listener.addEventListener("touchmove", this.onTouchMove.bind(this), false);
    }
    Object.defineProperty(TouchVector.prototype, "xDirection", {
        get: function () { return this._xDirection; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TouchVector.prototype, "yDirection", {
        get: function () { return this._yDirection; },
        enumerable: true,
        configurable: true
    });
    ;
    TouchVector.prototype.onTouchMove = function (event) {
        var oldx = this.x;
        var oldy = this.y;
        if (typeof event.clientX !== 'undefined') {
            this._x = event.clientX;
            this._y = event.clientY;
        }
        else if (typeof event.touches !== 'undefined') {
            this._x = event.touches[0].clientX;
            this._y = event.touches[0].clientY;
        }
        this._xDirection = this.x > oldx ? "right" : "left";
        this._yDirection = this.y > oldy ? "down" : "up";
        document.dispatchEvent(new CustomEvent("touchVector-move", { detail: this }));
    };
    return TouchVector;
}(BasicVector));
