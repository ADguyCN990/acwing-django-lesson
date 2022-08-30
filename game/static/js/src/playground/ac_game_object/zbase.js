
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

    late_update() { //渲染游戏结束界面

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
        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            let now = AC_GAME_OBJECTS[i];
            now.late_update(); 
        }

    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION); //在每一帧快结束后递归调用该函数，实现循环
}

requestAnimationFrame(AC_GAME_ANIMATION); 