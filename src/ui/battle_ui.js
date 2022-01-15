import { Message, BattleMessage, SkillMenu, HeroMenu, TargetMenu } from '../ui/battle_menu_elements';
import { createElement, getElement, addToClass, removeToClass, appendChild, appendChildren, getAttribute, setAttribute } from '../dom/elementsHander';
import { Hero, Enemy } from '../objects/battleCharacterEntities';
import { Inventory, Slot, Item } from '../objects/inventory';

export default class BattleUI extends Phaser.Scene {
    constructor() {
        super('BattleUI');
    }
    init(){
        const camera = this.cameras.main;
        this.viewport = this.rexUI.viewport;
        this.mainScene = this.scene.get('Game');
        this.commonUIScene = this.scene.get('CommonUI');
        this.commonMenu = this.scene.get('CommonMenu');

        this.message_ui = this.commonMenu.message_ui;
        this.battle_ui = this.commonMenu.battle_ui;
    }
    create(){
        var scene = this;
        const camera = this.cameras.main;

        this.currentMenu;
        this.currentItem;

        this.heroMenu = new HeroMenu(this, this.viewport.x, this.viewport.y);
        this.targetMenu = new TargetMenu(this, this.viewport.x, this.viewport.y);
        this.skillMenu = new SkillMenu(this, this.viewport.x, this.viewport.y);

        this.battle_ui.on('pointerdown', function (event) {
            let classList = event.target.classList.value;
            let battleStatus = getElement('battleUI').dataset.battle == 'true' ? true : false;
            let editingStatus = getElement('characterStatus-dialog').dataset.editing == 'true' ? true : false;

            if (!editingStatus && battleStatus && classList.includes('skillsItem')) {
                scene.switchMenu('skillMenu', 0);
                scene.skillMenu.verify(event);

                var targetTeam = scene.skillMenu.targetTeam;
                scene.targetMenu.createList({'target':targetTeam});
            }
            if (!editingStatus && battleStatus && classList.includes('targetItem')) {
                scene.switchMenu('targetMenu', 0);
                scene.targetMenu.verify(event);
            }
            if (!editingStatus && battleStatus && classList.includes('charactersItem')) {
                scene.switchMenu('heroMenu', 0);
                scene.heroMenu.verify(event);
            }
            if (!editingStatus && battleStatus && classList.includes('proceed-btn')) {
                scene.switchMenu('submit');
            }
            if (!editingStatus && battleStatus && classList.includes('escape-btn')) {
                scene.switchMenu('escape');
            }
        });

        //new emitters
        this.events.on('PlayerSelect', this.switchMenu, this);
        this.events.on('Target', this.switchMenu, this);
        this.events.on('SelectedAction', this.switchMenu, this);
        this.events.on('SelectCharacter', this.selectCharacter, this);
        // when its player unit turn to move
        //this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this);

        // listen for user events
        this.input.keyboard.on('keydown', this.onKeyInput, this);

        // when the scene receives wake event
        this.sys.events.on('wake', this.createMenu, this);

        // the message describing the current action
        this.message = new Message(this, 0, 0, undefined, this.events);
        this.battleMessage = new BattleMessage(this, 0, 0, undefined, this.events);
        this.add.existing(this.message);
        this.add.existing(this.battleMessage);

        this.events.on('Message', this.message.showMessage, this.message);
        this.events.on('BattleMessage', this.battleMessage.showMessage, this.battleMessage);

        // the currently selected menu
        this.commonMenu.currentScene = this.scene;

        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            scene.uiResize(scene);
        });
    }

    uiResize(scene){        
        this.viewport = this.rexUI.viewport;
    }
    createTurnOrderHUD(){ }

    createMenu() {
        this.battleScene = this.scene.get('BattleScene');
        this.currentMenu = this.skillMenu;

        this.heroMenu.clearSlots();
        this.targetMenu.clearSlots();
        this.targetMenu.createList({'target':'enemies'});
        this.heroMenu.createList({'target':'heroes'});

        this.switchMenu('heroMenu', 0);
        this.skillMenu.createList();
        this.switchMenu('skillMenu', 0);
        this.message_ui.setVisible(true);

        // first move
        this.battleScene.nextTurn();
    };
    clearMenus(){
        this.skillMenu.deselect({},{'index':this.skillMenu.currentIndex});
        this.skillMenu.createList();
        this.targetMenu.deselect({},{'index':this.targetMenu.currentIndex});
        this.targetMenu.createList({'target':'enemies'});
        this.heroMenu.deselect({},{'index':this.heroMenu.currentIndex});
        this.heroMenu.createList({'target':'heroes'});
    }
    switchMenu(menu, index = 0){
        switch(menu){
            case 'heroMenu':
                this.currentMenu = this.heroMenu;
                this.heroMenu.select({'index':index});
            break;
            case 'skillMenu':
                this.currentMenu = this.skillMenu;
                this.battleScene.activeCharacter = this.battleScene.units.filter(chara => chara.name == this.heroMenu.currentItem);
            break;
            case 'targetMenu':
                this.currentMenu = this.targetMenu;
            break;
            case 'submit':
                var errorMSG = this.skillMenu.verify({},{'index':this.skillMenu.currentIndex});
                    errorMSG = errorMSG || this.targetMenu.verify({},{'index':this.targetMenu.currentIndex});
                    errorMSG = this.battleScene.activeTeam != 'hero' ? "Enemy turn!" : errorMSG;
                if (this.skillMenu.confirmed && this.targetMenu.confirmed && this.battleScene.activeTeam == 'hero') {
                    var data = this.skillMenu.currentItem.item.itemData;
                    this.battleScene.receivePlayerSelection(data, index);
                } else {
                    this.events.emit('Message', errorMSG || "No skill or target selected!");
                } 
            break;
            case 'escape':
                this.battleScene.receivePlayerSelection({'type': 'escape'});
            break;
        }
    }

    selectCharacter(action){
        //this needs to be moved to the character object and have options for all sorts of effects and multiple layered ones separate clear effects from apply effect
        for (let i = 0; i < this.battleScene.units.length; i+= 1){
            this.battleScene.units[i].clearTint();
        }

        if (action == 'select'){
            let character = this.targetMenu.currentItem.item.itemData;
            character.setTint(0xffff00, 0xffff00, 0xff0000, 0xff0000);
        }
    }
    onPlayerSelect(id) {
        this.switchMenu('heroMenu', id);
    };
    onKeyInput(event) {
        if (this.currentMenu) {
            switch(event.code){
                case 'ArrowUp':
                case 'KeyW':
                    this.currentMenu.moveSelection({'direction':'up'});
                break;
                case 'ArrowDown':
                case 'KeyS':
                    this.currentMenu.moveSelection({'direction':'down'});
                break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.currentMenu == this.skillMenu){
                        this.currentMenu = this.skillMenu;
                    } else if (this.currentMenu == this.targetMenu){
                        this.currentMenu = this.skillMenu;
                    }
                break;
                case 'ArrowRight':
                case 'KeyD':
                    this.currentMenu.confirm();
                break;
                case 'Enter':
                    this.currentMenu.confirm();
                break;
                default:
                    //
                break;
            }
        }
    }
    update(){

    }
}