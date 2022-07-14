class FireBall extends AcGameObject {
    constructor(playground, x, y, vx, vy, radius, color, speed, player, move_length) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.ctx = this.playground.game_map.ctx;
        this.vx = vx; //横坐标上的速度
        this.vy = vy; //纵坐标上的速度
        this.eps = 0.1;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.player = player; //发射火球的玩家
        this.move_length = move_length; //火球的射程
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            //如果火球到了射程范围外，则直接销毁
            this.destroy();
            return false;
        }
        else {
            let move_vector = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += move_vector * this.vx;
            this.y += move_vector * this.vy;
            this.move_length -= move_vector;
        }
        this.render();
    }

    render() { //渲染火球
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}