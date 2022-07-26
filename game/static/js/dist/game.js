class AcGameMenu {
    constructor(root, AcWingOS) {
        this.root = root;
        this.AcWingOS = AcWingOS;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="title">Let's play some DOTA</div>    
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
        
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.$playdota = this.$menu.find('title');
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}


let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.had_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前距离上一帧的时间间隔
        this.uuid = this.create_uuid(); //唯一id
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() { //只会在第一帧执行

    }

    update() { //更新物体位置，每一帧都会执行

    }

    on_destroy() { //被销毁前执行一次

    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

    }

    destroy() { //销毁物品
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }

}

let last_timestamp; //上一帧的时间

let AC_GAME_ANIMATION = function(timestamp) { //实现每个帧内的操作，结尾递归调用实现帧循环

    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let now = AC_GAME_OBJECTS[i];
        if (!now.had_called_start) {
            now.had_called_start = true;
            now.start();
        }
        else {
            now.timedelta = timestamp - last_timestamp;
            now.update();
        }

    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION); //在每一帧快结束后递归调用该函数，实现循环
}

requestAnimationFrame(AC_GAME_ANIMATION); class GameMap extends AcGameObject {
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

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; 
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() { //该函数的作用是把画布画出来
        //this.ctx.drawImage("/static/image/menu/KaEr.jpg", 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)"; //设置为透明的黑色，这样移动会有残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
    }
}class Particle extends AcGameObject { //实现粒子特效(其实就是随机生成好多个大小随机的小球)
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
}class Player extends AcGameObject {
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
        //this.fire_ball_cd = 5;
        //this.ice_ball_cd = 5;
        //this.thunder_ball_cd = 5;
        this.username = username;
        this.photo = photo;
        this.fireballs = [];


        if (this.character == "me" || this.character == "enemy") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() { //开始时执行

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
                if (outer.cur_skill == "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty); //朝鼠标点击的位置释放一个火球
                    if (outer.playground.mode == "multi mode") {
                        outer.playground.mps.send_shootfireball(tx, ty, fireball.uuid);
                    }
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
        //if (this.fire_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "orange";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;
        let fireball = new FireBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.fireballs.push(fireball);
        //this.fire_ball_cd = 5;//设置cd

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.size(); i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid == uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    shoot_iceball(tx, ty) {
        //冰球，能减速，射速慢，半径大
        //if (this.ice_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.02;
        let color = "skyblue";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.3;
        let move_length = 1;
        let damage = 0.0075;
        new IceBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        //this.ice_ball_cd = 5;//设置cd
    }

    shoot_thunderball(tx, ty) {
        //雷球，能眩晕，射速快，半径小
        //if (this.thunder_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "purple";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = 0.8;
        let move_length = 1;
        let damage = 0.005;
        new ThunderBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);

        //this.thunder_ball_cd = 5;//设置cd
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
        //this.fire_ball_cd = Math.max(0, this.fire_ball_cd - this.timedelta / 1000)
        //this.ice_ball_cd = Math.max(0, this.ice_ball_cd - this.timedelta / 1000);
        //this.thunder_ball_cd = Math.max(0, this.thunder_ball_cd - this.timedelta / 1000);

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
}class FireBall extends AcGameObject {
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
            this.update_attack();
            
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
        player.is_attacked(angle, this.damage, this.damage * 100, 1.1);
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
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            let fireball = fireballs[i];
            if (this == fireball) {
                fireballs.splice(i, 1);
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
    
}class IceBall extends AcGameObject {
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

            for (let i = 0; i < this.playground.players.length; i++) {
                let player = this.playground.players[i];
                if (this.player != player && this.is_collision(player)) { //自己不会受到自己的攻击，另外火球碰到了另外的玩家
                    this.attack(player);
                }
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
        player.is_attacked(angle, this.damage, this.damage * 200, 0.75);
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

    render() { //渲染火球
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}class ThunderBall extends AcGameObject {
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

            for (let i = 0; i < this.playground.players.length; i++) {
                let player = this.playground.players[i];
                if (this.player != player && this.is_collision(player)) { //自己不会受到自己的攻击，另外火球碰到了另外的玩家
                    this.attack(player);
                }
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
        player.is_attacked(angle, this.damage, this.damage * 1, 1);
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

    render() { //渲染火球
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app2796.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }
    
    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid == outer.uuid) return false;
            let event = data.event;
            if (event == "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event == "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if (event == "shoot_fireball") {
                outer.receive_shootficeball(uuid, data.tx, data.ty, data.ball_uuid);
            }
        };
    }

    get_player(uuid) { //通过uuid找到对应的player
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid == uuid) {
                return player;
            }
        }
        return null;
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid, 
            'username': username,
            'photo': photo,
        }));
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to", 
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    send_shootfireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.25,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);

        if (player)
            player.move_to(tx, ty); //如果死了就没有必要调用了
    }

    receive_shootficeball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; //所有窗口的火球id需要统一
        }
            
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="ac-game-playground">
        
            </div>
        `);
        this.root.$ac_game.append(this.$playground);
        this.hide();
        this.start();
        
    }

    get_random_color() {
        let colors = ["green", "gray", "blue", "red", "pink", "yellow", "brown"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() { //动态调整窗口大小
        let outer = this;
        $(window).resize(function () {
             outer.resize();
        });
    }

    resize() { //动态保持长宽比
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }

    show(mode) {  // 打开playground界面
        let outer = this;
        this.$playground.show();
        
        this.mode = mode;
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.game_map = new GameMap(this); //创建一个地图
        this.resize();
        this.players = []; //创建一个存储玩家信息的列表
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.25, "me", this.root.settings.username, this.root.settings.photo));
        
        if (mode == "single mode") {
            for (let i = 0; i < 6; i++)
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.25, "robot"));
        }
        else if (mode == "multi mode") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
        
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo = "";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.$settings = $(`
        <div class="ac-game-settings">
            <div class="ac-game-settings-register">
                <div class="ac-game-settings-title"> <!--标题-->
                    注册
                </div>

                <div class="ac-game-settings-username"> <!--输入用户名-->
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名"> 
                    </div>
                </div>

                <div class="ac-game-settings-password ac-game-settings-password-first"> <!--输入密码-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-password ac-game-settings-password-second"> <!--再次输入密码-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="确认密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-submit"> <!--确认按钮-->
                    <div class="ac-game-settings-item">
                        <button>注册</button> 
                    </div>
                </div>

                <div class="ac-game-settings-errormessage"> <!--报错信息栏-->
                    
                </div>

                <div class="ac-game-settings-option"> <!--登录,点击跳转登录页面-->
                    登录
                </div>
                <br>
                <div class="ac-game-settings-acwing"> <!--acwing登录-->
                    <img src="https://app2796.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" width="30"> <br>
                    <div>AcWing一键登录</div>
                </div>
            </div>

            <div class="ac-game-settings-login">
                <div class="ac-game-settings-title"> <!--标题-->
                    登录
                </div>

                <div class="ac-game-settings-username"> <!--输入用户名-->
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名"> 
                    </div>
                </div>

                <div class="ac-game-settings-password"> <!--输入密码-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-submit"> <!--确认按钮-->
                    <div class="ac-game-settings-item">
                        <button>登录</button> 
                    </div>
                </div>

                <div class="ac-game-settings-errormessage"> <!--报错信息栏-->
                    
                </div>

                <div class="ac-game-settings-option"> <!--注册-->
                    注册
                </div>
                <br>
                <div class="ac-game-settings-acwing"> <!--acwing登录-->
                    <img src="https://app2796.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" width="30"> <br>
                    <div>AcWing一键登录</div>
                </div>

            </div>
        </div>
        `);
        this.$login = this.$settings.find(".ac-game-settings-login");

        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-errormessage");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$acwing_login = this.$login.find(".ac-game-settings-acwing img")

        this.$login.hide();


        this.$register = this.$settings.find(".ac-game-settings-register");

        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-errormessage");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();


        this.root.$ac_game.append(this.$settings);
        this.start();
    }


    start() {
        if (this.platform == "WEB") {
            this.getinfo_web();
            this.add_listening_events();
        }   
        else if (this.platform == "ACAPP")  {
            this.getinfo_acapp();
        }
    }

    getinfo_web() { //从服务端获取信息
        let outer = this;
        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET", 
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") { //登录成功就打开菜单界面 
                    //存储用户信息和用户头像后，关闭登录界面进入游戏菜单界面
                    outer.photo = resp.photo;
                    outer.username = resp.username;  
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.login();
                }
            }
        });
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) { 
        // 照抄讲义上的，调用api，最后一个参数是返回之后调用的函数
            console.log(resp); // 测试
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success (resp) {
                if (resp.result == "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            },
        });
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.add_listening_events_acwing(); //acwing一键登录
    }

    add_listening_events_acwing() { //实现acwing一键登录
        let outer = this;
        this.$acwing_login.click(function() {
            outer.acwing_login();
        });
    }

    acwing_login() {
        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/acwing/web/apply_code",
            type: "GET", 
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") { //如果成功收到后台的appid, redirect_uri, scope, state的话就重定向到授权网址
                    window.location.replace(resp.apply_code_url);
                }
            }

        });
    }

    add_listening_events_login() { //登录界面的监听函数
        //实现从登录界面跳转到注册界面
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });

        //实现登录
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });

    }

    login_on_remote() { //登录远程服务器
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty(); //每次试图登录时，都会情况上一次登录失败的状况

        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/login/", 
            type: "GET", 
            data: {
                username: username, 
                password: password,
            }, 
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload(); 
                }
                else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() { //在远程服务器登出
        if (this.platform == "ACAPP") {
            this.root.AcWingOS.api.window.close();
        }

        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/logout/", 
            type: "GET", 
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload();
                }
            }
        });
    }

    register_on_remote() { //在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let pasword_confirm = this.$register_password_confirm.val();
        this.$login_error_message.empty(); //每次试图登录时，都会情况上一次登录失败的状况

        $.ajax({
            url: "https://app2796.acapp.acwing.com.cn/settings/register/",
            type: "GET", 
            data: {
                username: username, 
                password: password, 
                password_confirm: pasword_confirm,
            }, 
            success: function(resp) {
                console.log(resp);
                if (resp.result == "success") {
                    location.reload();
                }
                else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }



    add_listening_events_register() { //注册界面的监听函数
        //实现从注册界面跳转到登录界面
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });

        //实现注册
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    hide() {
        this.$settings.hide();

    }

    show() {
        this.$settings.show();
    }

    login() { //打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    register() { //打开注册界面
        this.$login.hide();
        this.$register.show();
    }
}export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start();
    }


    start() {
        
    }
}