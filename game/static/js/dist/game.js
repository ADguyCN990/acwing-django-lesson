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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; //设置为透明的黑色，这样移动会有残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //this.ctx.drawImage("/static/image/menu/KaEr.jpg", 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.is_alive = true; //是否存活
        this.move_length = 0; //移动到目标点的距离
    }

    start() { //开始时执行

        if (this.is_me) {
            this.add_listenting_events(); //只能用鼠标键盘操控自身，也就是只对自身加一个监听函数
        }
    }

    add_listenting_events() {
        let outer = this; //嵌套使用，设个变量保存下
        this.playground.game_map.$canvas.on("contextmenu", function(){ //关闭鼠标右键弹出菜单
            return false;
        });

        this.playground.game_map.$canvas.mousedown(function(e) { //鼠标监听
            if (!outer.is_alive) return false;
            if (e.which == 3) {
                outer.move_to(e.clientX, e.clientY);
            }
        });
    }

    get_dis(x, y, tx, ty) {
        let a = x - tx;
        let b = y - ty;
        return Math.sqrt(a * a + b * b);
    }

    move_to(tx, ty) { //从一个点到另一个点，需要求出距离，x，y方向上的速度
        console.log("move to: ", tx, ty);
        this.move_length = this.get_dis(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() { //除开始外的其他帧执行
        //实现每一帧的玩家移动功能
        if (this.move_length < this.eps) { //到达目标点，停止继续移动
            this.vx = 0;
            this.vy = 0;
            this.move_length = 0;
        }
        else {
            let move_vector = Math.min(this.move_length, this.speed * this.timedelta / 1000); //向量的模长，和总距离取个较小值放置越界
            console.log(this.move_length);
            this.x += move_vector * this.vx;
            this.y += move_vector * this.vy;
            this.move_length -= move_vector;
        }
        this.render();
    }

    render() { //把玩家画出来，一个圆（直接抄的菜鸟教程）
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

        //this.hide();
        this.root.$ac_game.append(this.$playground);
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.game_map = new GameMap(this); //创建一个地图
        this.players = []; //创建一个存储玩家信息的列表
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.25, true));

        this.show();

        this.start();
    }

    start() {

    }

    show() {  // 打开playground界面
        this.$playground.show();
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }


    start() {
        
    }
}