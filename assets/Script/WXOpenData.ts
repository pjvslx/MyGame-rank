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

    gameData:GameData = null;

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
            }
        });
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
                    keyList : ["score","nick"],
                    success :   function(res){                
                        let selfIndex = null;
                        GameData.instance.friendData = res.data;
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
                                    if(data.KVDataList[i].key == 'score'){
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
                    keyList : ["score","nick"],
                    success :   function(res){
                        console.log("下载好友游戏数据成功!");
                        self.gameData.friendData = res.data;
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
                if(x.KVDataList[i].key == 'score'){
                    value1 = parseInt(x.KVDataList[i].value);
                    break;
                }
            }
            var value2 = 0;
            for(var i = 0; i < y.KVDataList.length; i++){
                if(y.KVDataList[i].key == 'score'){
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
                console.log('1111111111');
                self.gameData.name = res.data[0].nickName;
                self.gameData.maxScore = score;
                console.log('2222222222');
                console.log('3333333333');
                window['wx'].setUserCloudStorage({
                    KVDataList  :   [
                        { "key":'score', "value": "" + score },
                        { "key":"nick", "value":self.gameData.name}
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