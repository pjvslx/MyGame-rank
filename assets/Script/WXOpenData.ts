// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import GameData = require('./GameData');
import List = require('./List');

@ccclass
class WXOpenData extends cc.Component {
    @property(cc.Node)
    scrollNode: cc.Node = null;
    @property(cc.Node)
    exceedNode: cc.Node = null;
    @property(cc.Node)
    balanceNode: cc.Node = null;
    @property(cc.Node)
    balanceFrameList: cc.Node[] = [];
    @property(cc.SpriteFrame)
    indexSpriteFrameList: cc.SpriteFrame[] = [];
    gameData:GameData = null;

    static scoreKey: string = 'score1';

    static getWeek(str) {
        // 将字符串转为标准时间格式
        str = Date.parse(str);
        str = new Date(str);
        // 先计算出该日期为第几周
        let week = Math.ceil(str.getDate()/7);
        let year = str.getFullYear();
        let month = str.getMonth() + 1;
        // 判断这个月前7天是周几，如果不是周一，则计入上个月
        if  (str.getDate() < 7) {
            if (str.getDay() !== 1) {
                week = 5;
                month = str.getMonth();
            }
        }
        // console.log(`${year}-${month}-${week}`);
        return `${year}-${month}-${week}`;
    }

    onLoad(){
        let self = this;
        this.gameData = new GameData();

        window['wx'].onMessage(data => {
            switch (data.message) {
                case 'uploadGameData': {
                    self.uploadGameData(data.data.score);
                    break;
                }
                case 'ShowRank' : {
                    this.showRank();
                    break;
                }
                case 'CloseRank' : {
                    this.scrollNode.active = false;
                }
                case 'Exceed' : {
                    this.showExceed();
                    break;
                }
                case 'Balance' : {
                    self.getBalanceData();
                    break;
                }
            }
        });
    }

    resetScoreByWeek(data){
        let nowWeek = WXOpenData.getWeek(new Date());
        for(let i = 0; i < data.length; i++){
            let KVDataList = data[i].KVDataList;
            let week = '';
            for(let j = 0; j < KVDataList.length; j++){
                if(KVDataList[j].key == 'week'){
                    week = KVDataList[j].value;
                    break;
                }
            }
            if(week != nowWeek){
                for(let j = 0; j < KVDataList.length; j++){
                    if(KVDataList[j].key == WXOpenData.scoreKey){
                        KVDataList[j].value = 0;
                    }
                }
            }
        }
    }

    getBalanceData (){
        var self = this;
        this.node.active = false;
        window['wx'].getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                self.gameData.name = res.data[0].nickName;
                window['wx'].getFriendCloudStorage({
                    keyList : [WXOpenData.scoreKey,"nick","week"],
                    success :   function(res){
                        console.log("下载好友游戏数据成功!");
                        GameData.instance.friendData = res.data;
                        console.log("friendData.length = " + GameData.instance.friendData.length);
                        self.sortFriendGameData();
                        let selfIndex = 0;
                        //找到自身数据的前一个以及后一个
                        for(var i = 0; i < GameData.instance.friendData.length; i++){
                            let KVDataList = GameData.instance.friendData[i].KVDataList;
                            let nick:string = '';
                            for(var j = 0; j < KVDataList.length; j++){
                                if(KVDataList[j].key == 'nick'){
                                    nick = KVDataList[j].value;
                                    break;
                                }
                            }
        
                            if(nick == GameData.instance.name){
                                selfIndex = i;
                                break;
                            }
                        }
        
                        var rankList = [];
                        var dataList = [];
                        if(selfIndex - 1 >= 0){
                            dataList.push(GameData.instance.friendData[selfIndex - 1]);
                            rankList.push(selfIndex);
                        }
                        dataList.push(GameData.instance.friendData[selfIndex]);
                        rankList.push(selfIndex + 1);
                        if(selfIndex + 1 < GameData.instance.friendData.length){
                            dataList.push(GameData.instance.friendData[selfIndex + 1]);
                            rankList.push(selfIndex + 2);
                        }
        
                        if(dataList.length <= 2){
                            //如果只有两个说明自己左边的肯定没人 要补右边的
                            if(selfIndex + 2 < GameData.instance.friendData.length){
                                dataList.push(GameData.instance.friendData[selfIndex + 2]);
                                rankList.push(selfIndex + 3);
                            }
                        }
                        self.node.active = true;
                        self.scrollNode.active = false;
                        self.balanceNode.active = true;
                        self.exceedNode.active = false;
                        self.updateBalance(dataList,rankList,selfIndex + 1);
                    }
                });
            }
        });
    }

    updateBalance (dataList,rankList,selfRank){
        var index = 0;
        for(var i = 0; i < dataList.length; i++){
            index = i;
            var frameNode = this.balanceFrameList[i];
            frameNode.active = true;
            var imgIndex = frameNode.getChildByName('imgIndex');
            var labelIndex = frameNode.getChildByName('labelIndex');
            var nickNode = frameNode.getChildByName('nick');
            var levelNode = frameNode.getChildByName('score');
            var rank = rankList[i];
            if(rank <= 3){
                imgIndex.active = true;
                labelIndex.active = false;
                imgIndex.getComponent(cc.Sprite).spriteFrame = this.indexSpriteFrameList[rank - 1];
            }else{
                imgIndex.active = false;
                labelIndex.active = true;
                labelIndex.getComponent(cc.Label).string = `${rank}`;
            }

            if(rank == selfRank){
                //如果是自己
                labelIndex.color = cc.color(82,172,37);
                levelNode.color = cc.color(82,172,37);
                nickNode.color = cc.color(82,172,37);
            }else{
                labelIndex.color = cc.color(209,117,41);
                levelNode.color = cc.color(209,117,41);
                nickNode.color = cc.color(209,117,41);
            }

            nickNode.getComponent(cc.Label).string = dataList[i].nickname;
            var img = frameNode.getChildByName('frame').getChildByName('avatar');
            this.setImageUrl(img,dataList[i].avatarUrl);

            var KVDataList = dataList[i].KVDataList;
            var score = '0';
            for(var j = 0; j < KVDataList.length; j++){
                if(KVDataList[j].key == WXOpenData.scoreKey){
                    score = KVDataList[j].value;
                    break;
                }
            }
            levelNode.getComponent(cc.Label).string = `${score}`;
        }

        for(var i = index + 1; i < this.balanceFrameList.length; i++){
            this.balanceFrameList[i].active = false;
        }
    }

    setImageUrl (imgNode, url){
        let image = window['wx'].createImage();
        image.onload = () => {
            let texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            imgNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        };
        image.src = url;
    }

    showExceed () {
        console.log('==========showExceed===========');
        this.node.active = false;
        let self = this;
        window['wx'].getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                console.log('success', res.data)
                self.gameData.name = res.data[0].nickName;
                window['wx'].getFriendCloudStorage({
                    keyList : [WXOpenData.scoreKey,'nick','week'],
                    success :   function(res){                
                        let selfIndex = null;
                        GameData.instance.friendData = res.data;
                        self.resetScoreByWeek(GameData.instance.friendData);
                        self.sortFriendGameData();
                        //找到玩家下一个
                        for(var i = 0; i < GameData.instance.friendData.length; i++){
                            var KVDataList = GameData.instance.friendData[i].KVDataList;
                            let nick:string = '';
                            for(var j = 0; j < KVDataList.length; j++){
                                if(KVDataList[j].key == 'nick'){
                                    nick = KVDataList[j].value;
                                    break;
                                }
                            }
        
                            if(nick == GameData.instance.name){
                                selfIndex = i;
                                break;
                            }
                        }
        
                        console.log('selfIndex = ' + selfIndex);
        
                        if(selfIndex != null){
                            let data = GameData.instance.friendData[selfIndex - 1];
                            if(data == null){
                                //如果自己分最高 就选自己作为目标
                                data = GameData.instance.friendData[selfIndex];
                            }
                            if(data != null){
                                var score = 0;
                                for(var i = 0; i < data.KVDataList.length; i++){
                                    if(data.KVDataList[i].key == WXOpenData.scoreKey){
                                        score = data.KVDataList[i].value;
                                        break;
                                    }
                                }
                                var nick = data.nickname;
                                var url = data.avatarUrl;
                                //说明有下个玩家
                                self.node.active = true;
                                self.scrollNode.active = false;
                                self.balanceNode.active = false;
                                self.exceedNode.active = true;
                                self.exceedNode.getChildByName('nick').getComponent(cc.Label).string = nick;
                                self.exceedNode.getChildByName('score').getComponent(cc.Label).string = `${score}`;
                                let image = window['wx'].createImage();
                                image.onload = () => {
                                    let texture = new cc.Texture2D();
                                    texture.initWithElement(image);
                                    texture.handleLoadedTexture();
                                    var imgNode = self.exceedNode.getChildByName('avatarFrame');
                                    imgNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                                };
                                image.src = url;
                            }
                        }
                    }
                });
            }
        })
    }

    showRank(){
        let self = this;
        window['wx'].getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                console.log('success', res.data)
                self.gameData.name = res.data[0].nickName;
                window['wx'].getFriendCloudStorage({
                    keyList : [WXOpenData.scoreKey,"nick",'week'],
                    success :   function(res){
                        console.log("download friend cloud success!");
                        self.gameData.friendData = res.data;
                        self.resetScoreByWeek(self.gameData.friendData)
                        console.log("res.data = " + JSON.stringify(res.data));
                        console.log("friendData.length = " + self.gameData.friendData.length);
                        self.sortFriendGameData();
                        self.scrollNode.getChildByName('view').getChildByName('content').getComponent(List).updateRankList();
                    }
                });
            }
        })
        this.scrollNode.active = true;
        this.balanceNode.active = false;
        this.exceedNode.active = false;
    }

    //好友游戏数据排序，按得分从高到低
    sortFriendGameData () {
        var compareScore = function (x, y) {//比较得分
            var value1 = 0;
            for(var i = 0; i < x.KVDataList.length; i++){
                if(x.KVDataList[i].key == WXOpenData.scoreKey){
                    value1 = parseInt(x.KVDataList[i].value);
                    break;
                }
            }
            var value2 = 0;
            for(var i = 0; i < y.KVDataList.length; i++){
                if(y.KVDataList[i].key == WXOpenData.scoreKey){
                    value2 = parseInt(y.KVDataList[i].value);
                    break
                }
            }
            if (value1 >= value2) {
                return -1;
            } else if (value1 < value2) {
                return 1;
            }
        }

        this.gameData.friendData.sort(compareScore);
        let str = JSON.stringify(this.gameData.friendData);
    }

    //上传玩家游戏数据
    uploadGameData (score:number) {
        console.log('uploadGameData score = ' + score);
        let self = this;
        window['wx'].getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                console.log('success', res.data)
                self.gameData.name = res.data[0].nickName;
                self.gameData.maxScore = score;
                window['wx'].setUserCloudStorage({
                    KVDataList  :   [
                        { "key":WXOpenData.scoreKey, "value": "" + score },
                        { "key":"nick", "value":self.gameData.name},
                        { "key":"week", "value":WXOpenData.getWeek(new Date())}
                    ],
                    success :   function(){
                        console.log("UploadGameData 上传成功!");
                        self.gameData.isDataDirty = true;
                    },
                    fail : function(){
                        console.log("UploadGameData 上传失败!");
                    }
                });
            },
        })
        
    }
}
export = WXOpenData;