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

                <div class="ac-game-settings-password"> <!--输入密码-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-password"> <!--输入密码-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="确认密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-submit"> <!--确认按钮-->
                    <div class="ac-game-settings-item">
                        <button>登录</button> 
                    </div>
                </div>

                <div class="ac-game-settings-errormessage"> <!--报错信息栏-->
                    我爱庄轲
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
                    我爱庄轲
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
        this.$login.hide();
        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register.hide();
        this.root.$ac_game.append(this.$settings);
        this.start();
    }


    start() {
        this.getinfo();
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
                    //存储用户信息和用户头像
                    outer.photo = resp.photo;
                    outer.username = resp.username;  
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.register();
                }
            }
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