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
import Cell = require('./Cell');
import GameData = require('./GameData');
@ccclass
class List extends cc.Component {
    mPool: cc.Node[] = [];
    @property(cc.Prefab)
    mCell : cc.Prefab = null;

    getItem(){
        let item = cc.instantiate(this.mCell);
        return item;
    }

    createRankItem(index, imgURL, name, score){
        console.log('createRankItem index = ' + index + ' imgURL = ' + imgURL + ' name = ' + name + ' score = ' + score );
        let cellNode = this.getItem();
        cellNode.active = true;
        let cell:Cell = cellNode.getComponent("Cell");
        cell.init(index + 1, imgURL, name, score);
        cellNode.y = -20 -0.5 * 100 - index * 100;
        cellNode.parent = this.node;
    }

    updateRankList(){
        let WXOpenData = require('./WXOpenData');
        let self = this;
        let length = 10;
        if(GameData.instance.friendData.length < length){
            length = GameData.instance.friendData.length;
        }
        this.node.setContentSize(cc.size(450, length*100 + 20));
        
        for (let index = 0; index < length; index++) {
            const data = GameData.instance.friendData[index];
            let score = 0;
            for(let i = 0; i < data.KVDataList.length; i++){
                if(data.KVDataList[i].key == WXOpenData.scoreKey){
                    score = data.KVDataList[i].value;
                }
            }
            self.createRankItem(index, data.avatarUrl, data.nickname, score);
        }
    }
}

export = List;