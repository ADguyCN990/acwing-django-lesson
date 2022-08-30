class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.state = null; //win, lose

        this.win_image = new Image();
        this.win_image = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.lose_image = new Image();
        this.lose_image = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";

    }

    win() {
        this.state = "win";
    }

    lose() {
        this.state = "lose";
    }

    start() {
        this.win();
    }

    update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state == "win") {
            this.ctx.drawImage(this.win_image, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
        else if (this.state == "lose") {
            this.ctx.drawImage(this.lose_image, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}