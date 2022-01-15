import OBJ from "../objects/obj";
import Proximity from '../objects/proximityzone'

/**
 * Group that contains all the doors
 */
export default class Stairs extends Phaser.GameObjects.Group  {
	constructor(scene, x, y, name) {
		super(scene);
	  	this.classType = OBJ;
	}

	// Create all objs listed in the TMX file
	importFromJSON(){
		const objectLayer = this.scene.map.getObjectLayer('Objects');
		if (objectLayer){
			objectLayer.objects.forEach((object) => {
				if (object.type === 'stairs') {
					//get door type instead of placeholder
					const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, 'stair_graphic', object.type, null, null, object.name);
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
		const actobjs = this.scene.chapterData.acts[this.scene.act].objs;
		const chapterobjs = this.scene.chapterData.objs;
		if (actobjs){
			actobjs.forEach((object) => {
				if (object.map == this.scene.mapName){
					if (object.type === 'stairs') {
						const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, 'stair_graphic', object.type, null, null, object.name);
						this.add(obj);

						obj.body.setImmovable();
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
					if (object.type === 'stairs') {
						const obj = new OBJ(this.scene, object.x, object.y, null, object.width, object.height, 'stair_graphic', object.type, null, null, object.name);
						this.add(obj);

						obj.body.setImmovable();
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
