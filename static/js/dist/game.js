class AcGameMenu {
    constructor(root) {
        this.root = root;
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
            设置
        </div>
        
    </div>
</div>
`);

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
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
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
    }

    start() { //只会在第一帧执行

    }

    update() { //更新物体位置，每一帧都会执行

    }

    on_destroy() { //被销毁前执行一次

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
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x; //坐标
        this.y = y; //坐标
        this.playground = playground; //所属于playground
        this.ctx = this.playground.game_map.ctx; //用ctx操控画笔
        this.radius = radius; //半径
        this.color = color; //颜色
        this.speed = speed; //玩家移动速度
        this.is_me = is_me; //敌我鉴定
        this.eps = 0.1; //小于eps就认定为距离为0，因为涉及到浮点数运算
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
    }

    start() { //开始时执行

        if (this.is_me) {
            this.add_listenting_events(); //只能用鼠标键盘操控自身，也就是只对自身加一个监听函数
        }
        else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
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
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            }
            else if (e.which == 1) { //左键释放技能
                if (outer.cur_skill == "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top); //朝鼠标点击的位置释放一个火球
                }
                else if (outer.cur_skill == "iceball") {
                    outer.shoot_iceball(e.clientX - rect.left, e.clientY - rect.top);
                }
                else if (outer.cur_skill == "thunderball") {
                    outer.shoot_thunderball(e.clientX - rect.left, e.clientY - rect.top);
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
        console.log("fireball!!!");
        if (this.fire_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let color = "orange";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height;
        let damage = this.playground.height * 0.01;
        new FireBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);

        this.fire_ball_cd = 5;//设置cd
    }

    shoot_iceball(tx, ty) {
        //冰球，能减速，射速慢，半径大
        console.log("iceball!!!");
        if (this.ice_ball_cd > this.eps) return false;
        if (this.ice_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.02;
        let color = "skyblue";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * 0.3;
        let move_length = this.playground.height;
        let damage = this.playground.height * 0.0075;
        new IceBall(this.playground, x, y, vx, vy, radius, color, speed, this, move_length, damage);
        this.ice_ball_cd = 5;//设置cd
    }

    shoot_thunderball(tx, ty) {
        //雷球，能眩晕，射速快，半径小
        console.log("thunderball!!!");
        if (this.thunder_ball_cd > this.eps) return false;
        if (this.thunder_ball_cd > this.eps) return false;
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let color = "purple";
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * 0.8;
        let move_length = this.playground.height;
        let damage = this.playground.height * 0.005;
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
            let move_length = this.radius * Math.random() * 7;
            new Particle(this.playground, x, y, radius, vx, vy, speed, color, move_length);
        }
        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage_speed;
        this.speed *= is_speed_up;

        
    }

    update() { //除开始外的其他帧执行

        //减CD
        this.fire_ball_cd = Math.max(0, this.fire_ball_cd - this.timedelta / 1000)
        this.ice_ball_cd = Math.max(0, this.ice_ball_cd - this.timedelta / 1000);
        this.thunder_ball_cd = Math.max(0, this.thunder_ball_cd - this.timedelta / 1000);

        //AI随机放技能
        if (Math.random() < 1 / 180 && !this.is_me) {
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
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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
        
        this.render();
    }

    render() { //把玩家画出来，一个圆（直接抄的菜鸟教程）
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

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
        this.eps = 0.1;
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

    render() { //渲染火球
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class="ac-game-playground">
        
            </div>
        `);

        this.hide();
        this.start();
        
    }

    get_random_color() {
        let colors = ["green", "gray", "blue", "red", "pink", "yellow", "brown"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        
    }

    show() {  // 打开playground界面
        this.$playground.show();
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.game_map = new GameMap(this); //创建一个地图
        this.players = []; //创建一个存储玩家信息的列表
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.25, true));
        for (let i = 0; i < 6; i++)
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.25, false));
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }


    start() {
        
    }
}