import Group from "../objects/group";
import { Follower } from "../objects/npc";
import Proximity from '../objects/proximityzone'

/**
 * Group that contains all the npcs
 */
export default class Followers extends Group {
	constructor(scene, x, y, name) {
		super(scene);
	  	this.classType = Follower;
	}

	// Create all NPCs listed in the TMX file
	createFollower(data){
		const chatTrigger = data.chat;
		const cutsceneTrigger = data.cutscene;
		const battleTrigger = data.battle;
		const dataTrigger = (chatTrigger) ? chatTrigger : (cutsceneTrigger) ? cutsceneTrigger : (battleTrigger) ? battleTrigger : null;

		const follower = new Follower(this.scene, data.x, data.y, null, data.name, 'follower', dataTrigger, data.pose, data.hp, data.chakra, data.ryo, data.strength, data.defense, data.speed, data.level, data.target);
		this.add(follower);

		let zone = new Proximity(this.scene, follower, null, null, 'talk_icon');
		this.scene.proximityZones.add(zone);
		zone.body.setAllowGravity(false);
	}

	update(){
		this.children.each((follower) => {
			if (follower.active){
				follower.update();
			}
		});
	}

	addEvents(){
	    // NPCs can't go through walls and floors
	    this.scene.physics.add.collider(this, this.scene.worldLayer);
	}
}
