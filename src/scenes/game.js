import Chat from './chat';
import { Inventory, Slot, Item } from '../objects/inventory';
import World from './world';
import { BattleScene } from './Battle';

//find a better place to put all the style variables
var text1;
var text2;

export class Game extends Phaser.Scene {
	constructor() {
    	super({ key: "Game" });
	}

	init(data){
    	this.viewport = this.rexUI.viewport;
		this.commonUIScene = this.scene.get('CommonUI');
		this.battleUI = this.scene.get('BattleUI');
        this.commonMenu = this.scene.get('CommonMenu');

		this.fontSize = 20;
		this.buttonFontSize = 15;
		this.characterFontSize = 15;
		this.textStyle = { fontFamily: 'Arial', fontSize: this.fontSize, color: '#000000', align: 'center', colorHover: '#ffffff' };
	    this.buttonStyle = { paddingLeft: 20, paddingTop: 10, align: 'center', color: '0xffffff', borderColor: '0x000000', borderThickness: 4, colorHover: '0x000000' };

		this.locationsData = this.cache.json.get('locations');
		this.characterData = this.cache.json.get('abilities')['characters'];
		this.abilitiesData = this.cache.json.get('abilities')['abilities'];
		this.abilitiesDataDescriptions = this.cache.json.get('abilities')['descriptions'];

	    this.defaultAct = this.registry.get('act') || 0;
	    this.defaultChapter = this.registry.get('chapter') || 0;
	    this.defaultWeather = this.registry.get('weather') || 'sunny';
	    this.defaultMapName = this.registry.get('startMap') || "konoha_shinachiku_livingroom";
	    this.defaultMapFrom = this.registry.get('startMap') || "konoha_shinachiku_livingroom";
	    this.defaultPartyList = [{ "name":"uzumaki_shinachiku" }];
	    this.defaultMainCharacter =  { "name":"uzumaki_shinachiku" };

		this.act = (data.hasOwnProperty("act")) ? data.act : this.defaultAct;
		this.chapter = (data.hasOwnProperty("chapter")) ? data.chapter : this.defaultChapter;
		this.weather = (data.hasOwnProperty("weather")) ? data.weather : this.defaultWeather;
		this.mapName = (data.hasOwnProperty("mapName")) ? data.mapName : this.defaultMapName;
		this.mapFrom = (data.hasOwnProperty("mapFrom")) ? data.mapFrom : this.defaultMapFrom;
		this.parentMap = (data.hasOwnProperty("parentMap")) ? data.parentMap : this.mapName;

		// restarting the scene after the player died
		this.hasStartedOver = (data.hasOwnProperty("hasStartedOver")) ? data.hasStartedOver : false;
		this.commonMenu.currentScene = this.scene;
	}

	preload() {
    	//this.load.tilemapTiledJSON(this.mapName, "../assets/tilemaps/"+this.mapName+".json");
	}

	create(){
		// Camera's coordinates are always rounded, to prevent displayed object to be blurry
	    const camera = this.cameras.main;
		camera.roundPixels = true;

		this.chapterData = this.cache.json.get('chapter_'+this.chapter);
		this.actData = this.chapterData.acts[this.act];

		this.partyList = this.registry.get('partyList');
		this.partyListB = this.registry.get('partyListB') || this.defaultPartyList;
		this.mainCharacter = this.partyListB[0] || this.defaultMainCharacter;
		this.inventories = this.registry.get('inventories') || [];

		this.registry.set('mainCharacter',this.mainCharacter);
		this.registry.set('characterData',this.characterData);
		this.registry.set('abilitiesData',this.abilitiesData);
		this.registry.set('abilitiesDataDescriptions',this.abilitiesDataDescriptions);

        document.getElementById('battleUI').setAttribute('data-player', this.mainCharacter.name);
		if(!this.targetPanel) this.targetPanel = new Inventory(this,{'type':'target','id':'target-dialog','name':'target','slotCount':4});
		if(!this.heroesPanel) this.heroesPanel = new Inventory(this,{'type':'characters','id':'hero-dialog','name':'characters','slotCount':4});
		if(!this.inventories['all-inventory']) this.buildInventory(this,'skillInventory');
		for (const character of this.partyListB){
			if(!this.inventories[character.name+'-inventory']) this.buildInventory(this,'skills',8,{'name':character.name});
		};

		this.enterMap();

    	this.heroesPanel.clearSlots();
		this.heroesPanel.addItem({'index':0,'key':this.player.name,'category':this.player.role,'type':'characters','itemData':this.player});
		this.player.createCharacterHUD(this);

		this.resume();
		camera.fadeIn(500);

		text1 = this.add.text(500, 1000, '', { fill: '#00ff00' });
	}

	update(){
		if (!this.isPaused){
	      	this.world.update();
	    }

	    var pointer = this.input.activePointer;
	    text1.setText([
	        'x: ' + pointer.worldX,
	        'y: ' + pointer.worldY
	    ]);
	}

	// Only pause physics, animation and update function
	pause() {
		this.isPaused = true;
		this.physics.pause();
		this.anims.pauseAll();
		this.registry.set('isPaused', true);
	}

	resume() {
		this.isPaused = false;
		this.physics.resume();
		this.anims.resumeAll();
		this.registry.set('isPaused', false);
	}
	buildInventory(scene,type='skills',slotcount=10,data){
		var characterList = document.querySelector('#characterList');
		var slotCount = 0;
		var slotCounter = 0;

		switch(type){
			case 'skills':
				var defaultSlot0 = this.abilitiesData['taijutsu'][1];
				var defaultSlot1 = this.abilitiesData['taijutsu'][2];
				this.inventories[data.name+'-inventory'] = new Inventory(scene,{'type':type,'id':'skill-panel','name':data.name,'slotCount':slotcount});
				this.inventories[data.name+'-inventory'].addItem({'index':0,'itemData':defaultSlot0});
				this.inventories[data.name+'-inventory'].addItem({'index':1,'itemData':defaultSlot1});

				this.inventories[data.name+'-inventory'].characterProfile = this.inventories[data.name+'-inventory'].characterProfile ? this.inventories[data.name+'-inventory'].characterProfile : new DOMParser().parseFromString(`<div class="character characterListItem menu-trigger" data-name="${data.name}"><div class="characterHeader"></div><div class="characterAttributes"><div class="characterStats"><div class="stat"><span class="characterName"></span></div><div class="stat"><div class="label">LEVEL</div><div class="value">10</div></div><div class="stat"><div class="label">STRENGTH</div><div class="value">10</div></div><div class="stat"><div class="label">DEFENSE</div><div class="value">10</div></div></div></div></div>`, 'text/html').body.firstChild;
				characterList.appendChild(this.inventories[data.name+'-inventory'].characterProfile);
				//this.commonMenu.triggerCharacterSwitch({'name':this.partyList[0]});
				this.commonMenu.triggerCharacterSwitch({'name':this.partyListB[0].name});

				window.inventories = this.inventories;
			break;
			case 'skillInventory':
				for (const category in this.abilitiesData) { for (const ability in this.abilitiesData[category]) { slotCount++; } }
				this.inventories['all-inventory'] = new Inventory(scene,{'type':'skills','id':'allSkills','name':'all','character':'all','slotCount':slotCount});

				for (const category in this.abilitiesData) {
					for (const ability in this.abilitiesData[category]) {
						var itemData = this.abilitiesData[category][ability];
						this.inventories['all-inventory'].addItem({'index':slotCounter,'key':itemData.key,'name':itemData.name,'category':category,'itemData':itemData});
						slotCounter++;
					}
				}
			break;
		}

    	this.registry.set('itemsSelected',0);
		this.registry.set('inventories', this.inventories);
	}

	enterMap(){
		this.isPaused = true;

		this.chapterData = this.cache.json.get('chapter_'+this.chapter);
		this.locationsData = this.cache.json.get('locations');

		this.registry.set('act',this.act);
		this.registry.set('chapter',this.chapter);

		this.registry.set('mapName',this.mapName);
		this.registry.set('mapFrom',this.mapFrom);
		this.registry.set('parentMap',this.parentMap);
		this.registry.set('mapTitle',this.locationsData.map[this.mapName].title);
		this.registry.set('mapSides',this.locationsData.map[this.mapName].sides);
		this.registry.set('mapPointX',this.locationsData.map[this.mapName].x);
		this.registry.set('mapPointY',this.locationsData.map[this.mapName].y);
		this.registry.set('mapLocation',this.locationsData.map[this.mapName].village);		

		this.world = new World(this);
		this.chat = new Chat(this);

		//this.resume();
		//camera.fadeIn(500);
	}

	// Go to a new map
	exitMap(data) {
		this.pause();

		const camera = this.cameras.main;
		camera.fadeOut(300);
		camera.once('camerafadeoutcomplete',() => {
			this.scene.restart({mapName:data,mapFrom:this.mapName,parentMap:data});
		});
	}

	// rotate current room
	rotateRoom(data) {
		this.pause();

		const camera = this.cameras.main;
		camera.fadeOut(200);
		camera.once('camerafadeoutcomplete',() => {
			this.registry.set('playerX', this.player.x);
			this.scene.restart({mapName:data.mapName,mapFrom:this.mapName,parentMap:this.parentMap});
		});
	}

	// Starts over the scene, usually once the player died
	startOver() {
		this.pause();

		const camera = this.cameras.main;
		camera.shake(300, 0.005);
		camera.fadeOut(500);
		camera.once('camerafadeoutcomplete',() => {
			this.scene.restart({mapName:this.mapName,mapFrom:this.mapFrom,parentMap:this.mapName,hasStartedOver:true});
		});
	}

	startBattle(data){
		const camera = this.cameras.main;
		//camera.flash(300).shake(300).fadeOut(300);

	    this.scene.add('BattleScene', BattleScene);
	    this.scene.sleep('Game');
	    this.scene.launch('BattleScene', { "battle":data.trigger });
        this.battleScene = this.scene.get('BattleScene');
        this.battleUI = this.scene.get('BattleUI');

        document.getElementById('battleUI').setAttribute('data-battle', true);
        if (document.getElementById('battleAction-dialog').getAttribute('data-active') == 'false'){ this.commonMenu.triggerNewMenu('#battleAction-dialog'); }

	    this.playerUIController('hide');
	}

	endBattle(data){
	    // clear state, remove sprites
	    this.battleScene.heroes = [];
	    this.battleScene.enemies = [];

	    for (let i = 0; i < this.battleScene.units.length; i += 1) {
	      // link item
	      this.battleScene.units[i].destroy();
	    }

	    this.battleScene.units.length = 0;
	    this.battleScene.index = -1;

	    switch(data.result){
	      case 'gameOver':
	        this.scene.wake('Game');
	        this.playerUIController('show');
	        this.battleUI.events.emit('Message', "You lost!");
	      break;
	      case 'victory':
	        this.scene.wake('Game');
	        this.playerUIController('show');   
	        this.battleUI.events.emit('Message', "You won!");   
	      break;
	      case 'escape':
	        this.scene.wake('Game');
	        this.playerUIController('show');
	        this.battleUI.events.emit('Message', "Everyone escaped!");
	      break;
	      default:
	      break;
	    }

	    this.battleUI.heroMenu.clearSlots();
	    this.battleUI.targetMenu.clearSlots();
	    this.battleUI.skillMenu.deselectAll();
	    this.battleUI.skillMenu.resetList(data);
		this.heroesPanel.addItem({'index':0,'key':this.player.name,'category':this.player.role,'type':'characters','itemData':this.player});
		this.player.createCharacterHUD(this);

	    this.scene.stop('BattleScene');
	    this.scene.remove('BattleScene');

	    document.getElementById('battleUI').setAttribute('data-battle', false);
	    if (document.getElementById('battleAction-dialog').getAttribute('data-active') == 'true'){ this.commonMenu.triggerNewMenu('#battleAction-dialog'); }
	    this.commonMenu.currentScene = this;
	}

	startCutscene(data){
		const cutsceneObject = this.chapterData.cutscenes;

 		this.endChat();
		this.world.deactivateZones();
 		this.player.playerDeactivate();
        this.playerUIController('hide');

        //start cutscene
		this.scene.launch('Cutscene', cutsceneObject[data.trigger]['pages']);
		this.registry.set('cutsceneActive', true);
	}

	endCutscene(data){
		var currentCutscene = this.scene.get('Cutscene');
		const camera = currentCutscene.cameras.main;
		this.input.off('pointerdown', this.chat.keepChatting);

		camera.fadeOut(500);
		camera.once('camerafadeoutcomplete',() => {
			//Get the talk scene to reactivate the player 
			this.player.playerActive();
        	this.playerUIController('show');

			//Stop the cutscene
			this.scene.stop('Cutscene');
		});
	}

	startChat(data){
		const coordinate = data.object.getTopLeft();
		const chatObject = this.chapterData.chats;

 		this.chatnum = 0;
	    this.chatData = chatObject[data.trigger]['dialogue'];

		this.registry.set('chatActive', true);
		this.world.deactivateZones();
 		this.player.playerDeactivate();
	    this.chat.keepChatting();
	}

	endChat(data){
		this.input.off('pointerdown', this.chat.keepChatting);
		this.input.keyboard.off('keydown_ENTER', this.chat.keepChatting);
	    this.chat.speechBubble.resetText();
		this.chat.speechBubble.setVisible(false);
	    this.chatnum = 0;

		this.registry.set('chatActive', false);
		this.world.activateZones();
	    this.player.playerActive();
	}

	startMinigame(data){
		
	}

	endMinigame(data){

	}

	playerUIController(status){
		switch(status){
			case 'hide':
				this.scene.bringToTop('CommonUI');
				this.commonUIScene.topHUD.setVisible(false);
				this.commonUIScene.bottomHUD.setVisible(false);
				this.commonUIScene.mapContainer.setVisible(false);

			break;
			default:
				this.commonUIScene.topHUD.setVisible(true);
				this.commonUIScene.bottomHUD.setVisible(true);
				this.commonUIScene.mapContainer.setVisible(true);
			break;
		}
	}
}