import { createElement, getElement, setInner, addToClass, removeToClass, appendChild, appendChildren, createDOMElement, setAttribute, querySelector } from '../dom/elementsHander';

export class Menu extends Phaser.GameObjects.Container {
    constructor(scene, x, y, children) {
        super(scene, x, y, children);
        scene.add.existing(this);
        this.scene = scene;
        this.name = '';
        this.menuContainer = [];
        this.menuItems = [];

        this.currentIndex = -1;
        this.currentItem = null;
        this.confirmed = false;
    }
    moveSelection(data){
        //data == {direction: direction}
        //if the index is 0, make it -1 so that the dowhile will select 0
        var currentIndex = this.currentIndex;
        do {
            currentIndex = data.direction == 'up' ? currentIndex -= 1 : data.direction == 'down' ? currentIndex += 1 : this.currentIndex;
            currentIndex = currentIndex >= this.menuItems.length ? 0 : currentIndex < 0 ? this.menuItems.length - 1 : currentIndex;
        } while ((!this.menuItems[currentIndex].active || this.menuItems[currentIndex].empty) && this.menuItems.length > 1);

        this.verify({}, {'index': currentIndex});
    }
    clearSlots(){
        this.menuContainer.clearSlots();     
        this.confirmed = false;   
        this.currentItem = null;
        this.currentIndex = -1;
    }
    deselectAll(data){
        this.menuContainer.clearSelections();
        this.confirmed = false;
        this.currentItem = null;
        this.currentIndex = -1;
    }
    select(data){
        //optional == {slot: slot, index: index}
        var index = data.index || data.index == 0 ? data.index : data.target.dataset.index;
        var slot = this.menuItems[data.index] ? this.menuItems[data.index] : data.slot;
        slot.select(); 
        this.currentItem = slot;
        this.currentIndex = data.index;
        this.confirmed = true;
    }
    deselect(data){
        //optional == {slot: slot, index: index}
        var index = data.index || data.index == 0 ? data.index : data.target.parentElement.index;
        var slot = this.menuItems[data.index] ? this.menuItems[data.index] : data.slot ? data.slot : this.currentItem;
        this.currentItem = null;
        this.currentIndex = -1;
        this.confirmed = false;

        if (slot){ slot.deselect(); }
    }
    confirm(){        
        // do something when the player selects an action
    }
}

export class SkillMenu extends Menu {
    constructor(scene, x, y, children) {
        super(scene, x, y, children);
        scene.add.existing(this);
        this.scene = scene;
        this.name = 'skillMenu';
        this.menuContainer = scene.registry.get('inventories');
        this.character = null;
    }
    clearList() {
        this.currentIndex = -1;
        this.currentItem = null;
        this.confirmed = false;
        this.menuContainer = this.scene.registry.get('inventories');
    }
    createList(data){
        /*check and make sure skill/person is selectable each turn*/
        var index = this.scene.heroMenu.currentIndex < 0 ? 0 : this.scene.heroMenu.currentIndex;
        this.clearList();
        this.character = this.scene.heroMenu.currentItem.item.itemData;
        this.menuContainer = this.menuContainer[this.character.name+'-inventory'];
        this.menuItems = this.menuContainer.slots;
        this.checkData();
    }
    resetList(data){
        /*check and make sure skill/person is selectable each turn*/
        for (let i = 0; i < this.menuItems.length; i+= 1){
            this.menuItems[i].DOM.setAttribute('data-active', true); 
            this.menuItems[i].active = true;
        }
    }
    checkData(){
        /*check and make sure skill/person is selectable each turn*/
        for (let i = 0; i < this.menuItems.length; i+= 1){
            var itemData = this.menuItems[i].item ? this.menuItems[i].item.itemData : {};
            var verifyHP, verifyChakra, verifyLevel, verifyUser, verifyQuantity;
            if(this.menuItems[i].item){
                verifyHP = this.character.hp < itemData.hp_cost;
                verifyChakra = this.character.chakra < itemData.chakra_cost;
                verifyLevel = this.character.level < itemData.level;
                verifyUser = itemData.users.includes(this.character.name) || itemData.users.includes("all");
                verifyQuantity = this.menuItems[i].item ? this.menuItems[i].item.quantity <= 0 : false;
            }

            if (!verifyUser || verifyLevel || (verifyHP && itemData.hp_cost) || (verifyChakra && itemData.chakra_cost) || (verifyQuantity && itemData.category=="item")){ 
                this.menuItems[i].DOM.setAttribute('data-active', false); 
                this.menuItems[i].active = false;
            }  else { 
                this.menuItems[i].DOM.setAttribute('data-active', true); 
                this.menuItems[i].active = true;
            };
        }
    }
    verify(data, optional){
        //optional == {index: index}
        var index = data.target ? data.target.dataset.index : optional.index > 0 ? optional.index : 0;
        var slot = this.menuItems[index];
        var itemData = slot.item.itemData;

        var verifyHP = this.character.hp < itemData.hp_cost,
            verifyChakra = this.character.chakra < itemData.chakra_cost,
            verifyQuantity = slot.item.quantity <= 0;

        this.checkData();
        this.targetTeam = (itemData.type == 'buff' || itemData.type == 'defend' || itemData.type == 'selfbuff') ? 'heroes' : 'enemies';
        //this.scene.targetMenu.createList({'target':targetTeam});

        if (verifyHP && itemData.hp_cost){
            //if character doesn't have enough health
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.deselectAll();
            return "Not enough health!";
        } else if (verifyChakra && itemData.chakra_cost){
            //if character doesn't have enough chakra
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.deselectAll();
            return "Not enough chakra!";
        } else if (verifyQuantity && itemData.category=="item"){
            //if character doesn't have enough items
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.deselectAll();
            return "Not items left!";
        } else if (!slot.active){
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.deselectAll();
            return "Unavailable!";
        } else if (this.currentItem){
            //if everything is valid, select skill
            this.deselectAll();
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.select({'index': index, 'slot':slot});
        } else {
            //if everything is valid, select skill
            this.scene.events.emit('SelectCharacter', 'deselect');
            this.select({'index': index, 'slot':slot});
        }
    }
    confirm() {        
        // do something when the player selects an enemy
        this.scene.events.emit('SelectedAction', 'targetMenu');
    }
}

export class HeroMenu extends Menu {
    constructor(scene, x, y, children) {
        super(scene, x, y, children);
        scene.add.existing(this);
        this.scene = scene;
        this.name = 'heroMenu';
        this.menuItems = scene.mainScene.heroesPanel.slots;
        this.menuContainer = scene.mainScene.heroesPanel;
    }
    addItem(data, index){
        this.menuContainer.addItem({'index':index,'key':data.name,'category':data.role,'type':'characters','itemData':data});
        data.menuItem = this.menuItems[index].item;
        console.log(data.menuItem)
    }
    clearList() {
        this.currentIndex = -1;
        this.currentItem = null;
        this.confirmed = false;
        this.clearSlots();
    }
    createList(data){
        /*check and make sure skill/person is selectable each turn*/
        this.clearList();
        this.targetList = this.scene.battleScene ? this.scene.battleScene[data.target] : data.targetList;
        for (let i = 0; i < this.targetList.length; i+= 1){
            this.addItem(this.targetList[i], i);

            var data = this.menuItems[i].item.itemData;
            data.createCharacterHUD(this.scene);
            this.menuItems[i].active = data.hp < 0 ? false : true;
            this.targetList[i].setMenuItem(this.menuItems[i]);
        }
        this.checkData();
    }
    checkData(){
        /*check and make sure skill/person is selectable each turn*/
        for (let i = 0; i < this.targetList.length; i+= 1){
            var data = this.menuItems[i].item.itemData;
            var verifyHP = data.hp < 0;
            if (verifyHP){ 
                this.menuItems[i].DOM.setAttribute('data-active', false); 
                this.menuItems[i].active = false;
            }  else { 
                this.menuItems[i].DOM.setAttribute('data-active', true); 
                this.menuItems[i].active = true;
            };
        }
    }
    verify(data, optional){
        var index = data.target ? data.target.dataset.index : optional.index > 0 ? optional.index : 0;
        var slot = this.menuItems[index];
        var slotData = slot.item.itemData;

        this.checkData();
        var team  = data.target ? data.target.dataset.category : data.team;
        team = team == 'enemy' ? 'enemies' : 'heroes';

        if (!slot.active){
            //if character doesn't have enough health
            this.scene.events.emit('SelectCharacter', '');
            return "Cannot target!";
        } else if (this.currentItem){
            //if another skill is already selected, deselect the old skill and then select the new one
            this.deselectAll();
            this.select({'index': index, 'slot':slot});
            this.scene.events.emit('SelectCharacter', 'select');
        } else {
            //if everything is valid, select skill
            this.select({'index': index, 'slot':slot});
            this.scene.events.emit('SelectCharacter', 'select');
        }
    }
    confirm() {        
        // do something when the player selects an enemy
        this.scene.events.emit('Target', 'submit', this.currentIndex);
    }
}

export class TargetMenu extends Menu {
    constructor(scene, x, y, children) {
        super(scene, x, y, children);
        scene.add.existing(this);
        this.scene = scene;
        this.name = 'targetMenu';
        this.menuItems = scene.mainScene.targetPanel.slots;
        this.menuContainer = scene.mainScene.targetPanel;
    }
    addItem(data, index){
        this.menuContainer.addItem({'index':index,'key':data.name,'category':data.role,'type':'characters','itemData':data});
        data.menuItem = this.menuItems[index].item;
        console.log(data.menuItem)
    }
    clearList(data) {
        this.currentIndex = -1;
        this.currentItem = null;
        this.confirmed = false;
        this.clearSlots();
    }
    createList(data){
        /*check and make sure skill/person is selectable each turn*/
        this.clearList();
        this.targetList = this.scene.battleScene ? this.scene.battleScene[data.target] : data.targetList;
        for (let i = 0; i < this.targetList.length; i+= 1){
            this.addItem(this.targetList[i], i);

            var data = this.menuItems[i].item.itemData;
            data.createCharacterHUD(this.scene);
            this.menuItems[i].active = data.hp < 0 ? false : true;
            this.targetList[i].setMenuItem(this.menuItems[i]);
        }
        this.checkData();
    }
    checkData(){
        /*check and make sure skill/person is selectable each turn*/
        for (let i = 0; i < this.targetList.length; i+= 1){
            var data = this.menuItems[i].item.itemData;
            var verifyHP = data.hp < 0;
            if (verifyHP){ 
                this.menuItems[i].DOM.setAttribute('data-active', false); 
                this.menuItems[i].active = false;
            }  else { 
                this.menuItems[i].DOM.setAttribute('data-active', true); 
                this.menuItems[i].active = true;
            };
        }
    }
    verify(data, optional){
        var index = data.target ? data.target.dataset.index : optional.index > 0 ? optional.index : 0;
        var slot = this.menuItems[index];
        var slotData = slot.item.itemData;

        this.checkData();
        var team  = data.target ? data.target.dataset.category : data.team;
        team = team == 'enemy' ? 'enemies' : 'heroes';

        if (!slot.active){
            //if character doesn't have enough health
            this.scene.events.emit('SelectCharacter', '');
            return "Cannot target!";
        } else if (this.currentItem){
            //if another skill is already selected, deselect the old skill and then select the new one
            this.deselectAll();
            this.select({'index': index, 'slot':slot});
            this.scene.events.emit('SelectCharacter', 'select');
        } else {
            //if everything is valid, select skill
            this.select({'index': index, 'slot':slot});
            this.scene.events.emit('SelectCharacter', 'select');
        }
    }
    confirm() {        
        // do something when the player selects an enemy
        this.scene.events.emit('Target', 'submit', this.currentIndex);
    }
}

export class Message extends Phaser.GameObjects.Container {
    constructor(scene, x, y, children, events) {
        super(scene, x, y, children, events);
        scene.add.existing(this);
        this.scene = scene;
        this.name = 'message';
        this.messageType;
    }
    showMessage(text, type, team) {
        this.messageType = type || "general";
        var message = querySelector(`#${this.messageType}MessageUI`);
        var messageDialog = querySelector(`#${this.messageType}MessageUI-dialog`);
        var messageText = querySelector(`#${this.messageType}MessageUI-dialog .menu-content p`);
        setInner(messageText, text);
        addToClass(messageDialog, 'active');
        setAttribute(messageDialog, 'data-active', true);

        if (this.hideEvent) this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2500, callback: this.hideMessage, callbackScope: this });
    }
    hideMessage() {
        var message = querySelector(`#${this.messageType}MessageUI`);
        var messageDialog = querySelector(`#${this.messageType}MessageUI-dialog`);
        var messageText = querySelector(`#${this.messageType}MessageUI-dialog .menu-content p`);
        setInner(messageText, '');
        removeToClass(messageDialog, 'active');
        setAttribute(messageDialog, 'data-active', false);
        this.hideEvent = null;
    }
};

export class BattleMessage extends Menu {
    constructor(scene, x, y, children) {
        super(scene, x, y, children);
        scene.add.existing(this);
        this.scene = scene;
    }
    showMessage(text, type, team) {
        var message = querySelector(`#${type}MessageUI`);
        var messageDialog = querySelector(`#${type}MessageUI-dialog`);
        var messageText = querySelector(`#${type}MessageUI-dialog .menu-content p`);

        setInner(messageText, text);
        addToClass(message, team);
        setAttribute(message, 'data-team', team);
        addToClass(messageDialog, 'active');
        setAttribute(messageDialog, 'data-active', true);

        if (this.hideEvent) this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2500, callback: this.hideMessage, callbackScope: this });
    }
    hideMessage() {
        var messageDialogHero = querySelector(`#heroMessageUI-dialog`);
        var messageDialogTarget = querySelector(`#enemyMessageUI-dialog`);

        var messageTextHero = querySelector(`#heroMessageUI-dialog .menu-content p`);
        var messageTextTarget = querySelector(`#enemyMessageUI-dialog .menu-content p`);

        setInner(messageTextHero, '');
        setInner(messageTextTarget, '');
        removeToClass(messageDialogHero, 'active');
        removeToClass(messageDialogTarget, 'active');
        setAttribute(messageDialogHero, 'data-active', false);
        setAttribute(messageDialogTarget, 'data-active', false);
        this.hideEvent = null;
    }
}