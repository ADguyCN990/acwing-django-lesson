class MultiPlayerSocket {
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
                outer.receive_shootfireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event == "shoot_iceball") {
                outer.receive_shooticeball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event == "shoot_thunderball") {
                outer.receive_shootthunderball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event == "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.damage_speed, data.is_speed_up, data.ball_uuid);
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

    send_shooticeball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_iceball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    send_shootthunderball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_thunderball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    send_attack(attackee_uuid, x, y, angle, damage, damage_speed, is_speed_up, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack", 
            'uuid': outer.uuid, 
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'damage_speed': damage_speed,
            'is_speed_up': is_speed_up,
            'ball_uuid': ball_uuid,
        }))
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

    receive_shootfireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; //所有窗口的火球id需要统一
        }
            
    }

    receive_shooticeball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let iceball = player.shoot_iceball(tx, ty);
            iceball.uuid = ball_uuid;
        }
    }

    receive_shootthunderball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let thunderball = player.shoot_thunderball(tx, ty);
            thunderball.uuid = ball_uuid;
        }
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, damage_speed, is_speed_up, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attackee.is_alive && attacker.is_alive) {
            attackee.receive_attack(x, y, angle, damage, damage_speed, is_speed_up, ball_uuid, attacker);
        }
    }
}