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

@ccclass
class Cell extends cc.Component {
    @property(cc.Node)
    imgIndex: cc.Node = null;
    @property(cc.Node)
    labelIndex: cc.Node = null;
    @property(cc.Node)
    nick: cc.Node = null;
    @property(cc.Node)
    score: cc.Node = null;
    @property(cc.Node)
    imgAvatar: cc.Node = null;
    @property(cc.SpriteFrame)
    spFrameList: cc.SpriteFrame[] = [];

    //index: 1~max
    init(index:number, imgURL:string, name:string, score:number){
        if(index <= 3){
            this.imgIndex.active = true;
            this.labelIndex.active = false;
            this.imgIndex.getComponent(cc.Sprite).spriteFrame = this.spFrameList[index - 1];
        }else{
            this.imgIndex.active = false;
            this.labelIndex.active = true;
            this.labelIndex.getComponent(cc.Label).string = `${index}`;
        }

        let image = window['wx'].createImage();
        image.onload = () => {
            let texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            this.imgAvatar.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        };
        image.src = imgURL;
        if(name == GameData.instance.name){
            this.nick.color = cc.color(84,171,35);
            this.score.color = cc.color(84,171,35);
        }else{
            this.nick.color = cc.color(199,120,40);
            this.score.color = cc.color(199,120,40);
        }

        this.nick.getComponent(cc.Label).string = name;
        this.score.getComponent(cc.Label).string = `${score}`;
    }
}
export = Cell;
