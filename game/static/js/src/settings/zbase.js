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
        this.getinfo();
        this.add_listening_events();
    }

    getinfo() { //从服务端获取信息
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

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
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
        if (this.platform == "ACAPP") return false;

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
}