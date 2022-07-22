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
        this.fire_ball_cd = 5;
        this.ice_ball_cd = 5;
        this.thunder_ball_cd = 5;
        this.username = username;
        this.photo = photo


        if (this.character == "me" || this.character == "enemy") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() { //开始时执行

        if (this.character == "me") {
            this.add_listenting_events(); //只能用鼠标键盘操控自身，也就是只对自身加一个监听函数
        }
        else {
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
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (!outer.is_alive) return false;
            if (e.which == 3) { //右键移动
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            }
            else if (e.which == 1) { //左键释放技能
                if (outer.cur_skill == "fireball") {
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale); //朝鼠标点击的位置释放一个火球
                }
                else if (outer.cur_skill == "iceball") {
                    outer.shoot_iceball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                else if (outer.cur_skill == "thunderball") {
                    outer.shoot_thunderball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 69) { //按下E，释放冰球技能
                outer.cur_skill = "fireball";
                return false;
            }
            else if (e.which == 81) { //按下Q，释放冰球技能
                outer.cur_skill = "iceball";
            }
            else if (e.which == 87) { //按下W，释放雷球技能
                outer.cur_skill = "thunderball";
            }
        });
    }

    shoot_fireball(tx, ty) {
        //火球，能击退，射速适中，半径适中
        if (this.fire_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "orange";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;
        new FireBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);

        this.fire_ball_cd = 5;//设置cd
    }

    shoot_iceball(tx, ty) {
        //冰球，能减速，射速慢，半径大
        if (this.ice_ball_cd > this.eps) return false;
        if (this.ice_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.02;
        let color = "skyblue";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.3;
        let move_length = 1;
        let damage = 0.0075;
        new IceBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.ice_ball_cd = 5;//设置cd
    }

    shoot_thunderball(tx, ty) {
        //雷球，能眩晕，射速快，半径小
        if (this.thunder_ball_cd > this.eps) return false;
        if (this.thunder_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "purple";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.8;
        let move_length = 1;
        let damage = 0.005;
        new ThunderBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);

        this.thunder_ball_cd = 5;//设置cd
    }

    get_dis(x, y, tx, ty) {
        let a = x - tx;
        let b = y - ty;
        return Math.sqrt(a * a + b * b);
    }

    move_to(tx, ty) { //从一个点到另一个点，需要求出距离，x，y方向上的速度
        //console.log("move to: ", tx, ty);
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
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage_speed;
        this.speed *= is_speed_up;

        
    }

    update() { //除开始外的其他帧执行

        this.update_move();
        this.render();
    }

    update_move() { //负责更新玩家移动
        //减CD
        this.fire_ball_cd = Math.max(0, this.fire_ball_cd - this.timedelta / 1000)
        this.ice_ball_cd = Math.max(0, this.ice_ball_cd - this.timedelta / 1000);
        this.thunder_ball_cd = Math.max(0, this.thunder_ball_cd - this.timedelta / 1000);

        //AI随机放技能
        if (Math.random() < 1 / 180 && this.character == "robot") {
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
                //console.log(this.move_length);
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
        

    }
}