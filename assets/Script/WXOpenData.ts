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
                case 'SetOpenId' :
                {
                    //openid登陆时主域获取，传到子域使用。
                    //data: {message:'SetOpenId', openid:"xxxxxxxxxxxxx"}

                    // GameData.instance.openId = data.openid;
                    // GameData.instance.isDataDirty = true;
                    // self.GetUserGameData();
                    break;
                }
                case 'uploadGameData': {
                    self.uploadGameData(data.data.score);
                    break;
                }
                case 'ShowRank' : {
                    this.showRank();
                    // this.scrollNode.active = true;
                    break;
                }
                case 'CloseRank' : {
                    this.scrollNode.active = false;
                }
                case 'FriendRank' : {
                    //
                    // self.GetFriendGameData();
                    // self.showRank();
                    break;
                }
                case 'BalanceRank' : {
                    // self.GetBalanceData();
                    // self.showBalance();
                    break;
                }
                case 'exceed' : {
                    // self.showExceed();
                    break;
                }
                case 'CloseRank' : {
                    //
                    // self.closeRank();
                    break;
                }
            }
        });
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