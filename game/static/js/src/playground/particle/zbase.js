class Particle extends AcGameObject { //实现粒子特效(其实就是随机生成好多个大小随机的小球)
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
        if (this.move_length < this.eps || this.speed < this.eps * 0.5) {
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}