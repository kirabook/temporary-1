import { Message, SkillMenu, HeroMenu, TargetMenu } from '../ui/battle_menu_elements';
import { Inventory, Slot, Item } from '../objects/inventory';

export default class CommonUI extends Phaser.Scene {
	//to do: implement different color options

	constructor() {
    	super('CommonUI'); 
	}

	init(data){
		const camera = this.cameras.main;
        this.viewport = this.rexUI.viewport;
		this.mainScene = this.scene.get('Game');
    	this.battleUI = this.scene.get('BattleUI');
    	this.commonMenu = this.scene.get('CommonMenu');

        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            this.viewport = this.rexUI.viewport;
        });
		
		this.staticXJsPos = camera.x + 150;
		this.staticYJsPos = camera.height - 150;
		this.joystickConfig = {
			x: this.staticXJsPos,
			y: this.staticYJsPos,
			enabled: true
		};

		//calculates the center of the uioverlay. Is used to put the backdrop and uioverlay panels in the proper place
		this.uioverlayScale = 1;
		this.uioverlayX = (-camera.width / 2) + (camera.width * this.uioverlayScale) / 2;
		this.uioverlayY = (-camera.height / 2) + (camera.height * this.uioverlayScale) / 2;

	    //set the camera of this scene to center the uioverlay
		camera.setOrigin(0,0) .setBounds(this.uioverlayX, this.uioverlayY, camera.width, camera.height) .fadeIn(500);

	}

	create(){
        var scene = this;
		const camera = this.cameras.main;
        this.updateMapState();
        
        // the message describing the current action
        this.message = new Message(this, 0, 0, undefined, undefined, 'y', undefined, this.mainScene.events);
        this.add.existing(this.message);
	   
	   //character UI and map
       	this.topHUD = this.rexUI.add.sizer({
            x: this.viewport.centerX, y: this.viewport.y + this.viewport.height / 2,
            width: this.viewport.width - 32, height: this.viewport.height,
            orientation: 'x',
            anchor: 'top',
            space: { left: 10, right: 10, top: 10, bottom: 10 },
            expand: false
        })
            .add( this.message, 9.5, 'top', 0, false, '' )
            .add( this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined), 1.5, 'top', 0, false, 'end_column' )
            .layout()
            .drawBounds(this.add.graphics(), 0xff0000);

        //bottom ui such as the joy stick and other mobile buttons
		this.bottomHUD = this.rexUI.add.sizer({
            x: this.viewport.centerX, y: this.viewport.y + this.viewport.height / 2,
            width: this.viewport.width - 32, height: this.viewport.height,
            orientation: 'x',
            anchor: 'bottom',
            space: { left: 0, right: 0, top: 0, bottom: 10 },
            expand: false
        })
            .add( this.createJoystick(this), 2.5, 'bottom', { left: 32, bottom: 32 }, false, 'joystick' )
            .add( this.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined), 6, 'bottom' )
            .add( this.createActionButtons(this), 2.5, 'bottom', 0, false, 'action_buttons' )
            .layout()
            .drawBounds(this.add.graphics(), 0xff0000);

        this.createMiniMap(this, this.topHUD.childrenMap['end_column'].x, 30, 150, 'create');

        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            scene.uiResize(scene);
        });
	}

    uiResize(scene){        
        this.viewport = this.rexUI.viewport;

        scene.topHUD.setPosition(this.viewport.centerX, this.viewport.y + this.viewport.height / 2);
        scene.topHUD.setMinSize(this.viewport.width, this.viewport.height);
		scene.topHUD.layout();
        
        scene.bottomHUD.setPosition(this.viewport.centerX, this.viewport.y + this.viewport.height / 2);
        scene.bottomHUD.setMinSize(this.viewport.width, this.viewport.height);
		scene.bottomHUD.layout();

		this.createMiniMapMask(this.topHUD.childrenMap['end_column'].x, 30);
		this.updateMiniMap(this.topHUD.childrenMap['end_column'].x, 30);
    }

	createActionButtons(scene){
 		this.turnaroundIcon = scene.add.image(0, 0, 'turnaround_icon').setDisplaySize(64,64).setOrigin(0).setInteractive({ useHandCursor: true });
 		this.jumpIcon = scene.add.image(0, 0, 'jump_icon').setDisplaySize(64,64).setOrigin(0).setInteractive({ useHandCursor: true });

		this.turnaroundIcon.on('pointerup', function (pointer) {
 			scene.parentMap = scene.mainScene.registry.get('parentMap');
			scene.updateMapState();
	        if(scene.mapSides >= 1 && scene.currentMapSide <= scene.mapSides){
	        	scene.currentMapSide++;
	        	scene.currentMap = scene.parentMap+'_'+scene.currentMapSide;
	        } else if(scene.currentMapSide != 1) {
	        	scene.currentMapSide = 1;
	        	scene.currentMap = scene.parentMap;
	        }

        	scene.mainScene.registry.set('currentMapSide',scene.currentMapSide);
        	scene.mainScene.registry.set('currentMap',scene.currentMap);
	        scene.mainScene.rotateRoom({'mapName':scene.currentMap});
	    });

		this.jumpIcon.on('pointerup', function (pointer) {
	        if (scene.mainScene.player.active == true){ scene.mainScene.player.jump(0); }
	    });

		if (!this.mapSides) this.turnaroundIcon.setVisible(false);
		this.actionButtons = scene.rexUI.add.overlapSizer()
        .add(
        	this.turnaroundIcon, // child
            'turnaroundIcon',
            'right-bottom', // align
            { right: 175, bottom: 50 },
            false
        )
        .add(
        	this.jumpIcon, // child
            'jumpIcon',
            'right-bottom', // align
            { right: 75, bottom: 150 },
            false
        );

        return this.actionButtons;
	}

	createJoystick(scene){
		var joyStickBase = scene.add.image(0, 0, 'base').setDisplaySize(200, 200);
		var joyStickThumb = scene.add.image(0, 0, 'thumb').setDisplaySize(50, 50);
		this.joyStick = scene.plugins.get('rexVirtualJoystick').add(
		    scene,
		    Object.assign({}, this.joystickConfig, {
		        radius: 64,
		        base: joyStickBase,
		        thumb: joyStickThumb
		    })
		).on('update', scene.updateJoystickState, scene);

		this.input.on('pointerup', pointer => {
		    scene.mainScene.player.lastCursorDirection = "center";
		}); 

		this.cursorKeys = this.joyStick.createCursorKeys();
		this.joyStickContainer = scene.rexUI.add.overlapSizer({
	        orientation: 'x'
	    })
        .addBackground(
            scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined)
        )
        .add(
        	joyStickBase, // child
            'joyStickBase',
            'left-bottom', // align
            0,
            false
        )
        .add(
        	joyStickThumb, // child
            'joyStickThumb',
            'left-bottom', // align
            {left: 75, bottom: 75},
            false
        )

        return this.joyStickContainer;
	}

	createMiniMap(scene, x, y, width, method){
		this.mapContainer = scene.add.container(0, 0);
		var mapScale = .5;
		var mapSize = width;
		var mapHalfSize = mapSize / 2;
		var mapPlacementX = 0 + x - mapHalfSize;
		var mapPlacementY = 0 + y + mapHalfSize;

		this.ui_map_circle = scene.add.image(0, 0, 'ui_character_circle').setOrigin(0).setDisplaySize(mapSize + 32, mapSize + 32);
		this.miniMap = scene.add.image(0, 0, 'map_'+this.mapLocation).setOrigin(0).setDepth(0).setScale(mapScale);
		this.currentCharacterMarker = scene.add.image(0, mapPlacementY, this.currentMainCharacter+'_mapicon').setScale(mapScale);

		this.mapContainer.add(this.ui_map_circle);
		this.mapContainer.add(this.miniMap);
		this.mapContainer.add(this.currentCharacterMarker);

		this.createMiniMapMask(x, y);

		this.miniMap.depth = 0;
		this.ui_map_circle.depth = -1;

		this.ui_map_circle.setPosition(x - mapHalfSize - 16, y - 16);
		this.miniMap.setPosition(mapPlacementX - (this.currentMapPointX * mapScale) + mapHalfSize, mapPlacementY - (this.currentMapPointY * mapScale));
		this.currentCharacterMarker.setPosition(mapPlacementX + mapHalfSize, mapPlacementY);

	}

	createMiniMapMask(x, y){
		var mapSize = 150;
		var mapHalfSize = mapSize / 2;
		var mapPlacementX = 0 + x - mapHalfSize;
		var mapPlacementY = 0 + y + mapHalfSize;

		if (this.mapCircle) this.mapCircle.destroy()
		this.mapCircle = this.add.graphics();

		this.mapCircle.fillStyle(0xFFFFFF, 1.0);
		this.mapCircle.beginPath();
		this.mapCircle.fillCircle(mapPlacementX + mapHalfSize, mapPlacementY, mapHalfSize);
		this.mapCircle.strokeCircle(mapPlacementX + mapHalfSize, mapPlacementY, mapHalfSize);
		this.mapCircle.setAlpha(.2);

		this.miniMapMask = this.mapCircle.createGeometryMask();
		this.miniMap.setMask(this.miniMapMask);
		this.currentCharacterMarker.setMask(this.miniMapMask);

		this.mapContainer.add(this.mapCircle);
	}

	updateJoystickState() {
		let direction = '';
		for (let key in this.cursorKeys) {
		  if (this.cursorKeys[key].isDown) {
		    direction += key;
		  }
		}

		// If no direction if provided then stop the player animations and exit the method
		if(direction.length === 0) { 
		  //this.mainScene.player.stopAnimations();
		  return;
		}

		// If last cursor direction is different the stop all player animations
		if (this.mainScene.player.lastCursorDirection !== direction) {
		  this.mainScene.player.stopAnimations();
		}

		// Set the new cursor direction
		this.mainScene.player.lastCursorDirection = direction;
	}

	updateMapState(){
		this.currentMainCharacter = this.mainScene.registry.get('mainCharacter').name;
		this.currentWeather = this.mainScene.registry.get('weather');
		this.currentMap = this.mainScene.registry.get('mapName');
		this.currentMapSide = (this.mainScene.registry.get('currentMapSide')) ? this.mainScene.registry.get('currentMapSide') : 1;
		this.currentMapPointX = (this.mainScene.registry.get('mapPointX')) ? this.mainScene.registry.get('mapPointX') : 300;
		this.currentMapPointY = (this.mainScene.registry.get('mapPointY')) ? this.mainScene.registry.get('mapPointY') : 300;
		this.currentMapTitle = this.mainScene.registry.get('mapTitle');
		this.mapLocation = this.mainScene.registry.get('mapLocation');
		this.mapTitle = this.mainScene.registry.get('mapTitle');
		this.mapSides = this.mainScene.registry.get('mapSides');

	}

	updateMiniMap(x, y){
		var mapScale = .5;
		var mapSize = 150;
		var mapHalfSize = mapSize / 2;
		var mapPlacementX = 0 + x - mapHalfSize;
		var mapPlacementY = 0 + y + mapHalfSize;

		this.ui_map_circle.setPosition(x - mapHalfSize - 16, y - 16);
		this.miniMap.setPosition(mapPlacementX - (this.currentMapPointX * mapScale) + mapHalfSize, mapPlacementY - (this.currentMapPointY * mapScale));
		this.currentCharacterMarker.setPosition(mapPlacementX + mapHalfSize, mapPlacementY);
	}

	update(){
		this.updateMapState();
		this.updateMiniMap(this.topHUD.childrenMap['end_column'].x, 30);
	}
}
