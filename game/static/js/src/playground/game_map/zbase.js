class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground; //这个“MAP"是属于playground的
        this.$canvas = $(`<canvas> </canvas>`) //canvas是画布
        this.ctx = this.$canvas[0].getContext("2d"); //用ctx参数操作画布canvas
        this.ctx.canvas.width = this.playground.width; //画布宽度
        this.ctx.canvas.height = this.playground.height; //画布高度
        this.playground.$playground.append(this.$canvas); //把这个画布加入到playground里
    }

    start() {

    }

    update() {
        this.render();
    }

    render() { //该函数的作用是把画布画出来
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; //设置为透明的黑色，这样移动会有残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //this.ctx.drawImage("/static/image/menu/KaEr.jpg", 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}