import { createElement, getElement, setInner, addToClass, removeToClass, appendChild, appendChildren, createDOMElement, setAttribute,getAttribute, querySelector, querySelectorAll } from '../dom/elementsHander';

export default class CommonMenu extends Phaser.Scene {
	constructor() {
    	super('CommonMenu');
	}
	init(data){
		const camera = this.cameras.main;
        this.viewport = this.rexUI.viewport;
		this.mainScene = this.scene.get('Game');
    	this.battleUI = this.scene.get('BattleUI');
    	this.commonUI = this.scene.get('CommonUI');
    }
	create() {
        var scene = this;
        const camera = this.cameras.main;
        this.viewport = this.rexUI.viewport;

		this.currentScene;

        this.message_ui = this.add.dom(0,0).createFromCache('menu_messages').setOrigin(0,0);
        this.message_ui.addListener('click').addListener('pointerdown').addListener('pointerup').addListener('pointerenter').addListener('pointerover').addListener('pointerout').addListener('touchstart').addListener('touchend');

        this.battle_ui = this.add.dom(0,0).createFromCache('battle_ui').setOrigin(0,0);
        this.battle_ui.addListener('click').addListener('pointerdown').addListener('pointerup').addListener('pointerenter').addListener('pointerover').addListener('pointerout').addListener('touchstart').addListener('touchend');

        this.global_ui = this.add.dom(0,0).createFromCache('global_ui').setOrigin(0,0);
        this.global_ui.addListener('click').addListener('pointerdown').addListener('pointerup').addListener('pointerenter').addListener('pointerover').addListener('pointerout').addListener('touchstart').addListener('touchend');

		this.menu_ui = this.add.dom(0,0).createFromCache('menu_global').setDepth(97).setOrigin(0,0);
		this.menu_ui.parent.classList.add("uiContainer");
        this.menu_uiID = getElement('menuUI');
        this.menu_ui.addListener('click').addListener('pointerdown').addListener('pointerup').addListener('pointerenter').addListener('pointerover').addListener('pointerout').addListener('touchstart').addListener('touchend');

		draggableElement("[data-draggable='true']");
		setDrag("[data-draggable='true']");

		this.global_ui.on('pointerdown', function (event) {
			let classList = event.target.classList.value;
			if (classList.includes('menu-trigger')){
				let menu = event.target.dataset.target;
                let trigger = event.target.dataset.trigger;
                switch(trigger){
                	case 'menu':
                		scene.triggerNewMenu(menu);
                	break;
                }
            }
	    });

		this.battle_ui.on('pointerdown', function (event) {
			let classList = event.target.classList.value;
            let editingStatus = getElement('characterStatus-dialog').dataset.editing == 'true' ? true : false;

			if (classList.includes('characterListItem')){
                let name = event.target.dataset.name;
                scene.triggerCharacterSwitch({'name':name});
            }
			if (editingStatus && ((classList.includes('skill') && classList.includes('item')) || classList.includes('slot'))){
                skillSelect(event);
            }
			if (editingStatus && (classList.includes('item__remove') && event.target.dataset.index)){
                clearInventoryItem(event);
            }
			if (classList.includes('menu-trigger')){
				let menu = event.target.dataset.target;
                let trigger = event.target.dataset.trigger;
                switch(trigger){
                	case 'close':
                		scene.triggerNewMenu(menu);
                	break;
                }
            }
	    });

		this.battle_ui.on('touchstart', function (event) {
			var classList = event.target.classList.value;
			if (classList.includes('skill') && classList.includes('item')){
				activateTooltip(event);
			}
	    });

		this.battle_ui.on('touchend', function (event) {
			var classList = event.target.classList.value;
			if (classList.includes('skill') && classList.includes('item')){
				deactivateTooltip(event);
			}
	    });

		this.battle_ui.on('pointerover', function (event) {
			var classList = event.target.classList.value;
			if (classList.includes('skill') && classList.includes('item')){
				activateTooltip(event);
			}
	    });

		this.battle_ui.on('pointerout', function (event) {
			var classList = event.target.classList.value;
			if (classList.includes('skill') && classList.includes('item')){
				deactivateTooltip(event);
			}
	    });

		this.menu_ui.on('pointerdown', function (event) {
			let classList = event.target.classList.value;
			let selectedMenuID = event.target.id;
            if (classList.includes('panelContainer')){
            	//get the id of the menu clicked
                this.scene.triggerMenu(null, selectedMenuID);
            }
            if (classList.includes('itemCharacter')){
            	//get the id of the menu clicked
                this.scene.triggerSlide(selectedMenuID);
            }
			if (classList.includes('menu-trigger')){
				let menu = event.target.dataset.target;
                let trigger = event.target.dataset.trigger;
                switch(trigger){
		        	case 'panel-switch':
		        		this.scene.triggerMenu(null, selectedMenuID);
		        	break;
		        	case 'character-switch':
		        		this.scene.triggerSlide(selectedMenuID);
		        	break;
		        	case 'save-setting':
		        		console.log('save setting');
		        	break;
		        	case 'load':
		        		console.log('load');
		        	break;
		        	case 'save':
		        		console.log('save');
		        	break;
		        	case 'read':
		        		console.log('read');
		        	break;
		        	case 'resetui':
		        		resetDraggableElement(menu);
		        	break;
                	case 'close':
                		this.scene.triggerNewMenu(menu);
                	break;
                	default:
                		this.scene.triggerNewMenu(menu);
                	break;
                }
            }
	    });

	}
	triggerNewMenu(menu){
		let menuDialogue = querySelector(menu);
		let menus = querySelectorAll(`.menu-dialog`);
		let menuTriggers = querySelectorAll(`[data-target='${menu}']`);
		let activeStatus = getAttribute(menuDialogue, 'data-active');
		this.triggerMenuStatus(activeStatus,menuDialogue,menuTriggers);

		switch(menu){
			case '#characterStatus-dialog':
				//toggle editing on and off for characterstatus menu
				let battleActionDialogue = querySelector('#battleAction-dialog');
				let battleActionTriggers = querySelector(`[data-target='#battleAction-dialog']`);
				this.triggerEditing(activeStatus,battleActionDialogue,battleActionTriggers);
				this.triggerEditing(activeStatus,menuDialogue,menuTriggers);
			break;
			case '#battleAction-dialog':
				let targetDialogue = querySelector('#target-dialog');
				let heroDialogue = querySelector('#hero-dialog');
				let targetmenuTriggers = querySelector(`[data-target='#target-dialog']`);
				let heromenuTriggers = querySelector(`[data-target='#hero-dialog']`);
				this.triggerMenuStatus(activeStatus,targetDialogue,targetmenuTriggers);
				this.triggerMenuStatus(activeStatus,heroDialogue,heromenuTriggers);
			break;
		}
	}
	triggerEditing(activeStatus,menuDialogue,menuTriggers){
		if (activeStatus == 'false'){
			setAttribute(menuDialogue, 'data-editing', 'true');
		} else {
			setAttribute(menuDialogue, 'data-editing', 'false');
		}
	}
	triggerMenuStatus(activeStatus,menuDialogue,menuTriggers){
		if (activeStatus == 'false'){
			addToClass(menuDialogue, 'active');
			setAttribute(menuDialogue, 'data-active', 'true');
			if (menuTriggers) this.triggerTriggerStatus(activeStatus,menuTriggers);
		} else {
			removeToClass(menuDialogue, 'active');
			setAttribute(menuDialogue, 'data-active', 'false');
			if (menuTriggers) this.triggerTriggerStatus(activeStatus,menuTriggers);
		}
	}
	triggerTriggerStatus(activeStatus,menuTriggers){
		if (activeStatus == 'false'){
			for (const menuTrigger of menuTriggers) {
				setAttribute(menuTrigger, 'data-active', 'true');
				addToClass(menuTrigger, 'active');
			}
		} else {
			for (const menuTrigger of menuTriggers) {
				setAttribute(menuTrigger, 'data-active', 'false');
				removeToClass(menuTrigger, 'active');
			}
		}
	}
	triggerCharacterSwitch(data){
		document.querySelectorAll('#characterList .character.active').forEach((elem) => removeToClass(elem,'active'));
		document.querySelectorAll('#skill-panel .inventory.active').forEach((elem) => removeToClass(elem,'active'));

		addToClass(document.querySelector('#characterList .character[data-name='+data.name+']'), 'active');
		addToClass(document.querySelector('#skill-panel .inventory[data-name='+data.name+']'), 'active');
	}
	triggerSlide(menu){
		let oldMenu = querySelector('#teamGrid .itemCharacter.active');
		let selectedMenu = getElement(menu);
		if (menu == oldMenu.id){
			//
		} else {
			removeToClass(oldMenu, 'active');
			addToClass(selectedMenu, 'active');
		}
	}
	triggerMenu(scene, menu){
		//triggers the opening and closing of the menus based on the values provided. Also pauses and unpauses the scene underneath
		let oldMenu = querySelector('#menuUIPanels .panelContainer.active');
		let mainContainer = this.menu_ui;
		let menuContainerID = this.menu_uiID;

		//open menu because menu parameter was given
		if (menu){
			let selectedMenu = getElement(menu);
			if (oldMenu && oldMenu != selectedMenu) removeToClass(oldMenu, 'active');

			//open menu animation
			addToClass(menuContainerID, 'animate__slideInUp');
			mainContainer.setVisible(true);
			setTimeout(function() {
				addToClass(selectedMenu, 'active');
			}, 200);
			
			if (scene) {
				//this.currentScene = scene;
				this.currentScene.pause();
				this.currentScene.scene.input.keyboard.enabled = false;
			}
		} else {
			//close the menu becase no menu parameter was given
			//close menu animation
			removeToClass(menuContainerID, 'animate__slideInUp');
			addToClass(menuContainerID, 'animate__slideOutDown');
			setTimeout(function() {
				mainContainer.setVisible(false);
				removeToClass(menuContainerID, 'animate__slideOutDown');
			}, 200);
			if (this.currentScene) {
				this.currentScene.resume();
				this.currentScene.scene.input.keyboard.enabled = true;
			}
		}
	}
}