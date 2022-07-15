class AcGamePlayground {
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
        for (let i = 0; i < 6; i++)
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.25, false));
        this.show();

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
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

