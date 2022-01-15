import AlignGrid from '../ui/grid';

import NPCs from "../objects/npcs";
import Followers from "../objects/followers";
import Character from '../objects/character';
import Object from '../objects/object';

import Exits from "../objects/exits";
import Doors from "../objects/doors";
import Stairs from "../objects/stairs";
import MapObject from "../objects/mapobjects";

/**
 * The world : map, npc, player
 */
export default class World {

	constructor(scene) {
		this.scene = scene;
		const { width, height } = scene.scale;

		// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    	scene.map = scene.make.tilemap({ key: scene.mapName });
		//scene.tileset = scene.map.addTilesetImage('base_soil-dirt-grass');
    	scene.tilesheet_1 = scene.map.addTilesetImage('tilesheet_1','tilesheet_1',64,64,0,0);
    	//scene.tileset2 = scene.map.addTilesetImage('tilesheet_2');
    	//scene.tileset3 = scene.map.addTilesetImage('tilesheet_2');

    	var background = scene.add.image(0, 0, scene.mapName).setOrigin(0,0);

		// Parameters: layer name (or index) from Tiled, tileset, x, y
    	//scene.buildingLayer = scene.map.createDynamicLayer("Buildings", scene.tileset1, 0, 0);
    	//scene.openingsLayer = scene.map.createDynamicLayer("Openings", scene.tileset2, 0, 0);
    	//scene.detailsLayer = scene.map.createDynamicLayer("Details", scene.tileset1, 0, 0);
    	//scene.roofLayer = scene.map.createDynamicLayer("Roof", scene.tileset1, 0, 0);
		scene.worldLayer = scene.map.createLayer("World", scene.tilesheet_1, 0, 0);
	    //scene.foilageLayer = scene.map.createDynamicLayer("Foilage", scene.tileset3, 0, 0);
	    //scene.aboveLayer = scene.map.createDynamicLayer("Above", scene.tileset1, 0, 0);

		scene.worldLayer.setCollisionByProperty({ collides: true });
	    scene.proximityZones = scene.physics.add.group();
		//scene.worldLayer.alpha = 0;
	    //scene.worldLayer.collideLeft = false;
	    //scene.worldLayer.collideRight = false;
	    //scene.worldLayer.collideDown = false;

	    // The aboye layer must be over all sprites, so it must be higher than the map height
	    //scene.aboveLayer.setDepth(scene.map.heightInPixels + 10);

	    // Define the world bound so characters don't go out of the map
	    scene.physics.world.TILE_BIAS = 64;
	    scene.physics.world.bounds.width = scene.map.widthInPixels;
	    scene.physics.world.bounds.height = scene.map.heightInPixels;

		//grid config
		var gridConfig = {
            'scene': scene,
            'cols': 12,
            'rows': 20,
            'width': scene.map.widthInPixels,
            'height': scene.map.heightInPixels
        }

        //scene.gameGrid = new AlignGrid(gridConfig);
        //scene.gameGrid.showNumbers();

		// create an instance of players and npcs 

		let playerX = (this.scene.registry.get('playerX')) ? this.scene.registry.get('playerX') : 150;
		let playerY = (this.scene.registry.get('playerY')) ? this.scene.registry.get('playerY') : scene.physics.world.bounds.height;

    	scene.followers = new Followers(scene);
		scene.player = new Character(
			scene, playerX, playerY, 
			null, 
			scene.mainCharacter.name, 
			'player', 
			null, null, null, null, 
			scene.registry.get(scene.mainCharacter+'_ryo'), 
			null, null, null, 
			scene.registry.get(scene.mainCharacter+'_level')
		);
		console.log(scene.physics.world.bounds.height)
		console.log(scene.player.y)
		console.log(scene.player.height)

	    scene.physics.add.collider(scene.player, scene.worldLayer);
		scene.player.active = true;
		scene.registry.set('playerActive', true);

		for (let i = 1; i < scene.partyListB.length; i += 1) {
			var data = {'name':scene.partyListB[i].name,'x':scene.player.x,'y':playerY,'level':scene.partyListB[i].level,'target':scene.player,'chat':scene.partyListB[i].chat,'cutscene':scene.partyListB[i].cutscene,'battle':scene.partyListB[i].battle};
			scene.followers.createFollower(data);
		}

    	// Create the interactive objects
    	scene.exits = new Exits(scene);
    	scene.doors = new Doors(scene);
    	scene.stairs = new Stairs(scene);
    	scene.mapobjects = new MapObject(scene);
    	scene.npcs = new NPCs(scene);
    	scene.exits.importFromJSON();
    	scene.doors.importFromJSON();
    	scene.stairs.importFromJSON();
    	scene.mapobjects.importFromJSON();
    	scene.mapobjects.importFromChapter();
    	scene.npcs.importFromJSON();
    	scene.npcs.importFromChapter();

      	//scene.physics.add.overlap(scene.player, scene.proximityZones);
      	scene.proximity_overlap = scene.physics.add.overlap(scene.player, scene.proximityZones);

    	// Find the player spawning point
		const objectLayer = scene.map.getObjectLayer('Objects');
		if (objectLayer){
			objectLayer.objects.forEach((object) => {
				if (object.type === 'entrance' && object.name == scene.mapFrom) {
	                scene.player.setPosition(object.x, object.y - (128 * scene.player.characterScale));
	                return;
	            } else if (object.type === 'door' && object.name == scene.mapFrom) {
	            	scene.player.setPosition(object.x, scene.worldLayer.height - scene.player.body.height + 64);
	            	return;
	            } else if (object.type === 'stairs' && object.name == scene.mapFrom) {
	            	scene.player.setPosition(object.x, scene.worldLayer.height - scene.player.body.height + 64);
	            	return;
	            }
	        });
	    }

	    // Camera settings
	    const camera = scene.cameras.main;
	    camera.roundPixels = true;
        camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels)
        	.startFollow(scene.player, true, 0.09, 0.09)
        	.setBackgroundColor('#0079ca')
        	//.fadeIn(1000, 0, 0, 0);

		// Add event listeners
    	this.addEvents();
	}

	// Add event listeners
	addEvents(){
		this.scene.followers.addEvents();
		this.scene.npcs.addEvents();
		this.scene.exits.addEvents();
		this.scene.doors.addEvents();
		this.scene.stairs.addEvents();
		this.scene.mapobjects.addEvents();
	}

	activateZones(){
    	this.scene.proximityZones.children.each((zone) => {
        	zone.enableZone();
  		});
	}

	deactivateZones(){
    	this.scene.proximityZones.children.each((zone) => {
        	zone.disableZone();
  		});
	}

	update(){
		this.scene.player.update();
		this.scene.followers.update();
    	this.scene.npcs.update();
    	this.scene.doors.update();
    	this.scene.mapobjects.update();
    	this.scene.proximityZones.children.each((zone) => {
        	zone.update();
  		});
	}
}