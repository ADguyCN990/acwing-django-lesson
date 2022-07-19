class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo = "";
        if (this.root.AcWingOS) this.platform = "ACAPP";
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
                    outer.login();
                }
            }
        });
    }

    hide() {

    }

    show() {

    }

    login() { //打开登录界面

    }

    register() { //打开注册界面

    }
}