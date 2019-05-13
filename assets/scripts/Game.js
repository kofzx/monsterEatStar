// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const Player = require("Player");

cc.Class({
    extends: cc.Component,

    properties: {
        // 该属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: Player
        },
        // score label的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        },
        // 开始按钮
        startBtn: {
            default: null,
            type: cc.Node
        },
    },

    spawnNewStar: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增节点添加到Canvas节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // newStar.getComponent('Star').game = this;
        newStar.getComponent('Star').init(this);
        this.startTimer();
        this.currentStar = newStar;
    },

    startTimer () {
        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的y坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星x坐标
        var maxX = this.node.width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },

    gainScore: function() {
        this.score += 1;
        // 更新scoreDisplay label的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function() {
        this.player.enabled = false;
        this.player.stopMove();
        this.startBtn.x = 0;
    },
    // 游戏开始按钮点击
    onGameStart () {
        this.enabled = true;
        // 将角色初始到地平面上
        this.player.startMoveAt(cc.v2(0, this.groundY));
        // 隐藏按钮
        this.startBtn.x = 3000;
        // 生成一个新的星星
        this.spawnNewStar();
    },

    onLoad () {
        this.enabled = false;
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        // 获取地平面的y轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 初始化计分
        this.score = 0;
    },

    update: function (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            this.enabled = false;
            return;
        }
        this.timer += dt;
    },
});
