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

@ccclass
class GameData {
    static instance:GameData = null;
    name:string = '';   //拿不到openId暂时以name为标准判断是否是自己
    maxScore:number = -1;//历史最高得分
    maxDepth:number = 0;//历史最高深度
    friendData:any[] = [];//好友游戏数据数组
    groupData:any[] = [];
    isDataDirty:boolean = false;//是否更新数据
    isDisplayDirty:boolean = false;//是否更新显示

    /**
     *
     */
    constructor() {
        console.log('GameData constructor');
        GameData.instance = this;
    }
}
export = GameData;
