// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
        // 形变持续时间
        shapeDuration: 0,
        // 跳跃音效资源
        jumpAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    getCenterPos () {
        // var centerPos = cc.v2(this.node.x, this.node.y + this.node.height / 2);
        var centerPos = this.node.getPosition();
        return centerPos;
    },

    stopMove () {
        this.node.stopAllActions(); //停止 player 节点的跳跃动作
    },

    setJumpAction: function () {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 形变
        var flatten = cc.scaleTo(this.shapeDuration, 1, 0.6);
        var widen = cc.scaleTo(this.shapeDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.shapeDuration, 1, 1);
        // 添加一个回调函数，用于在动作结束时调用我们的自定方法
        var callback = cc.callFunc(this.playJumpSound, this);   // ActionInstant: callback
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        return cc.repeatForever(cc.sequence(flatten, widen, jumpUp, scaleBack, jumpDown, callback));
    },

    playJumpSound: function() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    // 将角色移动到指定坐标点
    startMoveAt: function(pos) {
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(pos);
        this.node.runAction(this.setJumpAction());  // 初始化跳跃动作
    },

    onKeyDown: function (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = true;
                break;
            case cc.macro.KEY.d:
                this.accRight = true;
                break;    
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.accLeft = false;
                break;
            case cc.macro.KEY.d:
                this.accRight = false;
                break;    
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.enabled = false;
        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;
        // 边界
        var monsterHalfWidth = this.node.width / 2;
        this.leftBorder = -this.node.parent.width / 2 + monsterHalfWidth;
        this.rightBorder = this.node.parent.width / 2 - monsterHalfWidth;

        // 初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);    
    },

    onDestroy () {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }, 

    update (dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }

        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // direction = this.xSpeed / Math.abs(this.xSpeed)
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角位置
        this.node.x += this.xSpeed * dt;

        // 限制主角的移动不能超过视窗边界
        if (this.node.x < this.leftBorder) {
            this.node.x = this.leftBorder;
            this.xSpeed = 0;
        } else if (this.node.x > this.rightBorder) {
            this.node.x = this.rightBorder;
            this.xSpeed = 0;
        }
    },
});
