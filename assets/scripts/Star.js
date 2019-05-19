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
        // 星星和主角之间的距离小于该数值，会完成收集
        pickRadius: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    getPlayerDistance: function() {
        // 根据player节点位置判断距离
        var playerPos = this.game.player.getCenterPos();
        // 根据两点位置计算两点之间距离
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },

    onPicked: function() {
        var pos = this.node.getPosition();
        // 当星星被收集时，调用Game脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 调用Game脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
        // 生成+1
        this.game.spawnNewPlusOne(pos);
    },

    init (game) {
        this.enabled = true;
        this.game = game;
        this.node.opacity = 255;
    },

    onLoad () {
        this.enabled = false;
    },

    update (dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
        // 根据Game脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    },
});
