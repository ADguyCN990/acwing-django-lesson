class IceBall extends AcGameObject {
    constructor(playground, x, y, vx, vy, radius, color, speed, player, move_length, damage) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.ctx = this.playground.game_map.ctx;
        this.vx = vx; //横坐标上的速度
        this.vy = vy; //纵坐标上的速度
        this.eps = 0.01;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.player = player; //发射火球的玩家
        this.move_length = move_length; //火球的射程
        this.damage = damage;
        this.damage_speed = this.damage * 200;
        this.is_speed_up = 0.75;
    }

    start() {

    }

    update_move() {
        let move_vector = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += move_vector * this.vx;
        this.y += move_vector * this.vy;
        this.move_length -= move_vector;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) { //自己不会受到自己的攻击，另外火球碰到了另外的玩家
                this.attack(player);
            }
        }
    }

    update() {
        if (this.move_length < this.eps) {
            //如果火球到了射程范围外，则直接销毁
            this.destroy();
            return false;
        }
        else {
            this.update_move();
            if (this.player.character != "enemy") {
                this.update_attack();
            }            
        }
        this.render();
    }

    get_dist(x, y, xx, yy) {
        let a = x - xx;
        let b = y - yy;
        return Math.sqrt(a * a + b * b);
    }

    attack(player) { //攻击玩家
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        //damage_speed决定了后退的距离，若足够小可以当做眩晕技能使用
        //is_speed_up决定了被击中的玩家在这之后的速度是多少
        player.is_attacked(angle, this.damage, this.damage_speed, this.is_speed_up);

        if (this.playground.mode == "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.damage_speed, this.is_speed_up, this.uuid);
        }

        this.destroy();
    }

    is_collision(player) { //检测火球与玩家是否碰撞
        let dis = this.get_dist(this.x, this.y, player.x, player.y);
        let safe = this.radius + player.radius;
        if (dis < safe) {
            return true;
        }
        else {
            return false;
        }
    }

    on_destroy() {
        let balls = this.player.balls;
        for (let i = 0; i < balls.length; i++) {
            let ball = balls[i];
            if (this == ball) {
                balls.splice(i, 1);
                break;
            }
        }
    }

    render() { //渲染火球
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}