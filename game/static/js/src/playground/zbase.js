class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="ac-game-playground"></div>
        `);

        this.hide();
        this.root.$ac_game.append(this.$playground);
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

