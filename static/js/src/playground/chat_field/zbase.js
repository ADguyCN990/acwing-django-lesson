class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history"></div>`);
        this.$input = $(`<input class="ac-game-chat-field-input"></input>`);

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);  
        this.start();

        //this.func_id = null;
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$input.keydown(function(e) {
            if (e.which == 27) { //关闭聊天框
                outer.hide_input();
                outer.hide_history();
                return false;
            }
            else if (e.which == 13) { //发送消息
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(text);
                }
                outer.show_history();
                return false;
            }
        });
    }

    rend_message(message) { //渲染成html对象
        return $(`<div>${message}</div>`)
    }

    add_message(username, text) {
        let message = `[${username}]: ${text}`;
        this.$history.append(this.rend_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();
        // if (this.func_id) {
        //     clearTimeout(this.func_id);
        // }
        // this.func_id = setTimeout(function() {
        //     outer.$history.fadeOut();
        //     outer.func_id = null;
        // }, 50000000); //5秒后关闭
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_history() {
        this.$history.hide();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }

}