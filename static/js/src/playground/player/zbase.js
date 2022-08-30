class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.x = x; //坐标
        this.y = y; //坐标
        this.playground = playground; //所属于playground
        this.ctx = this.playground.game_map.ctx; //用ctx操控画笔
        this.radius = radius; //半径
        this.color = color; //颜色
        this.speed = speed; //玩家移动速度
        this.character = character; //敌我鉴定
        this.eps = 0.01; //小于eps就认定为距离为0，因为涉及到浮点数运算
        this.vx = 0; //x方向上的移动速度
        this.vy = 0; //y方向上的移动速度 
        this.damage_x = 0; //被击退后
        this.damage_y = 0; //被击退后
        this.damage_speed = 0; //被击退后
        this.friction = 0.9; //减速度
        this.is_alive = true; //是否存活
        this.move_length = 0; //移动到目标点的距离
        this.cur_skill = null; //当前有没有选择技能，默认无技能
        this.spent_time = 0;
        //this.fire_ball_cd = 5;
        //this.ice_ball_cd = 5;
        //this.thunder_ball_cd = 5;
        this.username = username;
        this.photo = photo;
        this.balls = [];

        if (this.character == "me" || this.character == "enemy") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character == "me") {
            this.fireball_cd = 5;
            this.thunderball_cd = 5;
            this.iceball_cd = 5;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://adguycn990-typoraimage.oss-cn-hangzhou.aliyuncs.com/typora-img/202207271938643.png";
            this.iceball_img = new Image();
            this.iceball_img.src = "https://adguycn990-typoraimage.oss-cn-hangzhou.aliyuncs.com/typora-img/202207271938977.png";
            this.thunderball_img = new Image();
            this.thunderball_img.src = "https://adguycn990-typoraimage.oss-cn-hangzhou.aliyuncs.com/typora-img/202207271938023.png";
        }     
    }

    start() { //开始时执行
        this.playground.player_cnt++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_cnt + "人");
        if (this.playground.player_cnt >= 2) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting!");
        }
        if (this.character == "me") {
            this.add_listenting_events(); //只能用鼠标键盘操控自身，也就是只对自身加一个监听函数
        }
        else if (this.character == "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listenting_events() {
        let outer = this; //嵌套使用，设个变量保存下
        this.playground.game_map.$canvas.on("contextmenu", function(){ //关闭鼠标右键弹出菜单
            return false;
        });
        
        this.playground.game_map.$canvas.mousedown(function(e) { //鼠标监听
            if (outer.playground.state != "fighting") {
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (e.clientX - rect.left) / outer.playground.scale;
            let ty = (e.clientY - rect.top) / outer.playground.scale;
            if (!outer.is_alive) return false;
            if (e.which == 3) { //右键移动
                outer.move_to(tx, ty);
                if (outer.playground.mode == "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
            else if (e.which == 1) { //左键释放技能
                if (outer.cur_skill == "fireball" && outer.fireball_cd < outer.eps) {
                    let fireball = outer.shoot_fireball(tx, ty); //朝鼠标点击的位置释放一个火球
                    if (outer.playground.mode == "multi mode") {
                        outer.playground.mps.send_shootfireball(tx, ty, fireball.uuid);
                    }
                }
                else if (outer.cur_skill == "iceball" && outer.iceball_cd < outer.eps) {
                    let iceball = outer.shoot_iceball(tx, ty);
                    if (outer.playground.mode == "multi mode") {
                        outer.playground.mps.send_shooticeball(tx, ty, iceball.uuid);
                    }
                }
                else if (outer.cur_skill == "thunderball" && outer.thunderball_cd < outer.eps) {
                    let thunderball = outer.shoot_thunderball(tx, ty);
                    if (outer.playground.mode == "multi mode") {
                        outer.playground.mps.send_shootthunderball(tx, ty, thunderball.uuid);
                    }
                }
                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function(e) {
            if (e.which == 13) { //回车键打开聊天框
                if (outer.playground.mode == "multi mode") {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if (e.which == 27) { //ESC键退出聊天框
                if (outer.playground.mode == "multi mode") {
                    outer.playground.chat_field.hide_input();
                }
            }
            else if (e.which === 69 && outer.fireball_cd < outer.eps && outer.playground.state == "fighting") { //按下E，释放冰球技能
                outer.cur_skill = "fireball";
            }
            else if (e.which == 81 && outer.iceball_cd < outer.eps && outer.playground.state == "fighting") { //按下Q，释放冰球技能
                outer.cur_skill = "iceball";
            }
            else if (e.which == 87 && outer.thunderball_cd < outer.eps && outer.playground.state == "fighting") { //按下W，释放雷球技能
                outer.cur_skill = "thunderball";
            }
        });
    }

    shoot_fireball(tx, ty) {
        //火球，能击退，射速适中，半径适中
        //if (this.fire_ball_cd > this.eps) return false;
        if (!this.is_alive) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "orange";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;
        let fireball = new FireBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.balls.push(fireball);
        this.fireball_cd = 5;//设置cd

        return fireball;
    }

    destroy_ball(uuid) {
        for (let i = 0; i < this.balls.length; i++) {
            let ball = this.balls[i];
            if (ball.uuid == uuid) {
                ball.destroy();
                break;
            }
        }
    }

    on_destroy() {
        if (this.character == "me") {
            if (this.playground.state == "fighting") {
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }
            
        
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }

    shoot_iceball(tx, ty) {
        //冰球，能减速，射速慢，半径大
        //if (this.ice_ball_cd > this.eps) return false;
        if (!this.is_alive) return false;
        let x = this.x, y = this.y;
        let radius = 0.02;
        let color = "skyblue";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.3;
        let move_length = 1;
        let damage = 0.0075;
        let iceball = new IceBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.balls.push(iceball);
        this.iceball_cd = 5;//设置cd
        return iceball;
    }

    shoot_thunderball(tx, ty) {
        //雷球，能眩晕，射速快，半径小
        //if (this.thunder_ball_cd > this.eps) return false;
        if (!this.is_alive) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "purple";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.8;
        let move_length = 1;
        let damage = 0.005;
        let thunderball = new ThunderBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.balls.push(thunderball)
        this.thunderball_cd = 5;//设置cd
        return thunderball;
    }

    get_dis(x, y, tx, ty) {
        let a = x - tx;
        let b = y - ty;
        return Math.sqrt(a * a + b * b);
    }

    move_to(tx, ty) { //从一个点到另一个点，需要求出距离，x，y方向上的速度
        this.move_length = this.get_dis(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage, damage_speed, is_speed_up) {
        //damage_speed决定了后退的距离，若足够小可以当做眩晕技能使用
        //is_speed_up决定了被击中的玩家在这之后的速度是多少
        for (let i = 0; i < 20 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1; 
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 7;
            let move_length = this.radius * Math.random() * 175;
            new Particle(this.playground, x, y, radius, vx, vy, speed, color, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.is_alive = false;
            this.destroy();
            if (this.character == "me") {
                this.playground.state = "lose";
                this.playground.notice_board.write("哥哥你这么菜你女朋友知道了不会生气吧");
            }
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage_speed;
        this.speed *= is_speed_up;
    }

    receive_attack(x, y, angle, damage, damage_speed, is_speed_up, ball_uuid, attacker) {
        this.x = x;
        this.y = y;
        attacker.destroy_ball(ball_uuid);
        this.is_attacked(angle, damage, damage_speed, is_speed_up);
    }

    update() { //除开始外的其他帧执行
        this.spent_time += this.timedelta / 1000;
        this.update_win();
        this.update_move();
        if (this.character == "me" && this.playground.state == "fighting") {
            this.update_cd();

        }
        this.render();
    }

    update_win() {
        if (this.playground.state == "fighting" && this.character == "me" && this.playground.players.length == 1) {
            this.playground.state = "over";
            this.playground.notice_board.write("我们是冠军咚咚咚咚!");
            this.playground.score_board.win();
        }
    }

    update_cd() {
        this.fireball_cd = Math.max(0, this.fireball_cd - this.timedelta / 1000)
        this.iceball_cd = Math.max(0, this.iceball_cd - this.timedelta / 1000);
        this.thunderball_cd = Math.max(0, this.thunderball_cd - this.timedelta / 1000);
    }

    update_move() { //负责更新玩家移动
        //减CD
        //this.fire_ball_cd = Math.max(0, this.fire_ball_cd - this.timedelta / 1000)
        //this.ice_ball_cd = Math.max(0, this.ice_ball_cd - this.timedelta / 1000);
        //this.thunder_ball_cd = Math.max(0, this.thunder_ball_cd - this.timedelta / 1000);

        //AI随机放技能
        if (Math.random() < 1 / 300 && this.character == "robot" && this.spent_time > 5) {
            let player = this.playground.players[0]; 
            let id = Math.floor(Math.random() * 3);
            if (id == 0) {
                this.shoot_fireball(player.x, player.y);
            }
            else if (id == 1) {
                this.shoot_iceball(player.x, player.y);
            }
            else if (id == 2) {
                this.shoot_thunderball(player.x, player.y);
            }
        }


        if (this.damage_speed > this.eps) { //如果是在被击退的状态下
            this.vx = 0, this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_speed * this.damage_x * this.timedelta / 1000;
            this.y += this.damage_speed * this.damage_y * this.timedelta / 1000;
            this.damage_speed *= this.friction;
            if (this.damage_speed < this.speed * 0.3) {
                this.damage_speed = 0;
            }
        }
        else {
            if (this.move_length < this.eps) { //到达目标点，停止继续移动
                this.vx = 0;
                this.vy = 0;
                this.move_length = 0;
                if (this.character == "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height  / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else {
                let move_vector = Math.min(this.move_length, this.speed * this.timedelta / 1000); //向量的模长，和总距离取个较小值放置越界
                this.x += move_vector * this.vx;
                this.y += move_vector * this.vy;
                this.move_length -= move_vector;
            }
        }
        
    }

    render() { //把玩家画出来，一个圆（直接抄的菜鸟教程）
        let scale = this.playground.scale;
        if (this.character == "me" || this.character == "enemy") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if (this.character == "me" && this.playground.state == "fighting") {
            this.render_fireball_cd();
            this.render_iceball_cd();
            this.render_thunderball_cd();
        }
    }

    render_fireball_cd() {
        let scale = this.playground.scale;
        let x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        if (this.fireball_cd > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_cd / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_iceball_cd() {
        let scale = this.playground.scale;
        let x = 1.38, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.iceball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        if (this.iceball_cd > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.iceball_cd / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render_thunderball_cd() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.thunderball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        if (this.thunderball_cd > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.thunderball_cd / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
}