class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, speed, color, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.color = color;
        this.move_length = move_length;
        this.friction = 0.9; //减速度
        this.eps = 1;
    }

    start() {

    }

    update() {
        if (this.speed < 20 || this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        else {
            let move_vector = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * move_vector;
            this.y += this.vy * move_vector;
            this.speed *= this.friction;
            this.move_length -= move_vector;
        }
        this.render();
    }

    render() { //渲染粒子效果
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}