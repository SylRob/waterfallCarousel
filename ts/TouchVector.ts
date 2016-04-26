interface BasicVectorOptions {
	x?: number;
	y?: number;
}

interface TouchVectorOptions extends BasicVectorOptions {
	listener?: any;
}

class BasicVector {
	protected _x: number = 0;
	public get x(): number { return this._x };

	protected _y: number = 0;
	public get y(): number { return this._y };

	constructor(options?: BasicVectorOptions) {
		if (options) {
			if (options.x)
				this._x = options.x;
			if (options.y)
				this._y = options.y;
		}
	}
}

class TouchVector extends BasicVector {

	private _xDirection: string = "";
	public get xDirection(): string { return this._xDirection };

	private _yDirection: string = "";
	public get yDirection(): string { return this._yDirection };

	constructor(options?: TouchVectorOptions){
		super(options);

		let listener: any = document;

		if (options){
			if (options.listener)
				listener = options.listener;
		}

		listener.addEventListener("mousemove", this.onTouchMove.bind(this), false);
		listener.addEventListener("touchmove", this.onTouchMove.bind(this), false);
	}

	private onTouchMove(event: any){
		var oldx = this.x;
		var oldy = this.y;

		if( typeof event.clientX !== 'undefined' ) {
			this._x = event.clientX;
			this._y = event.clientY;
		} else if ( typeof event.touches !== 'undefined' ) {
			this._x = event.touches[0].clientX;
			this._y = event.touches[0].clientY;
		}

		this._xDirection = this.x > oldx ? "right" : "left";
		this._yDirection = this.y > oldy ? "down" : "up";

		document.dispatchEvent(new CustomEvent("touchVector-move", { detail: this }));
	}
}
