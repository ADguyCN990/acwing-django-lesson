class AcGamePlayground {
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
        
        this.state = "waiting" //状态机：waiting -> fighting -> over
        this.mode = mode;
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.player_cnt = 0; //玩家人数
        this.game_map = new GameMap(this); //创建一个地图
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.resize();
        this.players = []; //创建一个存储玩家信息的列表
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.25, "me", this.root.settings.username, this.root.settings.photo));
        
        if (mode == "single mode") {
            for (let i = 0; i < 6; i++)
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.25, "robot"));
        }
        else if (mode == "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
        
    }

    hide() {  // 关闭playground界面
        //清空所有游戏元素
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }
        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }
        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        this.$playground.empty();   //清空所有html标签
        this.$playground.hide();
    }
}

