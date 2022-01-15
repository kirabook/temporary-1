import OBJ from "../objects/obj";
import Proximity from '../objects/proximityzone'

/**
 * Group that contains all the doors
 */
export default class MapObject extends Phaser.GameObjects.Group  {
	constructor(scene, x, y, name) {
		super(scene);
	  	this.classType = OBJ;
	}

	// Create all objs listed in the TMX file
	importFromJSON(){
		const objectLayer = this.scene.map.getObjectLayer('Objects');
		if (objectLayer){
			objectLayer.objects.forEach((object) => {
				if (object.type === 'object' || object.type === 'battleObject' || object.type === 'cutsceneObject' || object.type === 'chatObject' || object.type === 'objectiveObject') {
					const objectTrigger = (object.type === 'battleObject') ? object.battle : (object.type === 'cutsceneObject') ? object.cutscene : (object.type === 'chatObject') ? object.chat : null;
					const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, object.name, object.type, objectTrigger, null, null, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);
						
					obj.body.setAllowGravity(false);
					obj.body.setImmovable(true);
					this.add(obj);

					let zone = new Proximity(this.scene, obj, object.width, object.height);
					this.scene.proximityZones.add(zone);
					zone.body.setAllowGravity(false);
				}
			});
		}
	}

	importFromChapter(){
		const actobjs = this.scene.chapterData.acts[this.scene.act].objects;
		const chapterobjs = this.scene.chapterData.objects;
		if (actobjs){
			actobjs.forEach((object) => {
				if (object.map == this.scene.mapName){
					if (object.type === 'object' || object.type === 'battleObject' || object.type === 'cutsceneObject' || object.type === 'chatObject' || object.type === 'objectiveObject') {
						const objectTrigger = (object.type === 'battleObject') ? object.battle : (object.type === 'cutsceneObject') ? object.cutscene : (object.type === 'chatObject') ? object.chat : null;
						const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, object.name, object.type, objectTrigger, null, null, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);

						obj.body.setAllowGravity(false);
						obj.body.setImmovable(true);
						this.add(obj);

						let zone = new Proximity(this.scene, obj, object.width, object.height);
						this.scene.proximityZones.add(zone);
						zone.body.setAllowGravity(false);
					}
				}
			});
		}
		if (chapterobjs){
			chapterobjs.forEach((object) => {
				if (object.map == this.scene.mapName){
					if (object.type === 'object' || object.type === 'battleObject' || object.type === 'cutsceneObject' || object.type === 'chatObject' || object.type === 'objectiveObject') {
						const objectTrigger = (object.type === 'battleObject') ? object.battle : (object.type === 'cutsceneObject') ? object.cutscene : (object.type === 'chatObject') ? object.chat : null;
						const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, object.name, object.type, objectTrigger, null, null, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);

						obj.body.setAllowGravity(false);
						obj.body.setImmovable(true);
						this.add(obj);

						let zone = new Proximity(this.scene, obj, object.width, object.height);
						this.scene.proximityZones.add(zone);
						zone.body.setAllowGravity(false);
					}
				}
			});
		}
	}

	update(){
		this.children.each((obj) => {
			if (obj.active){
				obj.update();
			}
		});
	}

	addEvents(){
	    // objs can't go through walls and floors
	    this.scene.physics.add.collider(this, this.scene.worldLayer);
	}
}
