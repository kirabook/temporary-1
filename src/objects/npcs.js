import Group from "../objects/group";
import { NPC } from "../objects/npc";
import Proximity from '../objects/proximityzone'

/**
 * Group that contains all the npcs
 */
export default class NPCs extends Group {
	constructor(scene, x, y, name) {
		super(scene);
	  	this.classType = NPC;
	}

	// Create all NPCs listed in the TMX file
	importFromJSON(){
		const objectLayer = this.scene.map.getObjectLayer('NPCs');
		if (objectLayer){
			objectLayer.objects.forEach((object) => {
				const chatTrigger = object.chat;
				const cutsceneTrigger = object.cutscene;
				const battleTrigger = object.battle;
				const objectTrigger = (chatTrigger) ? chatTrigger : (cutsceneTrigger) ? cutsceneTrigger : (battleTrigger) ? battleTrigger : null;

				const npc = new NPC(this.scene, object.x, object.y, null, object.name, 'npc', objectTrigger, object.pose, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);
				this.add(npc);

				npc.body.setImmovable();
				let zone = new Proximity(this.scene, npc, null, null, 'talk_icon');
				this.scene.proximityZones.add(zone);
				zone.body.setAllowGravity(false);
			});
		}
	}

	importFromChapter(){
		const actNPCs = this.scene.chapterData.acts[this.scene.act].npcs;
		const chapterNPCs = this.scene.chapterData.npcs;
		if (actNPCs){
			actNPCs.forEach((object) => {
				if (object.map == this.scene.mapName){
					const chatTrigger = object.chat;
					const cutsceneTrigger = object.cutscene;
					const battleTrigger = object.battle;
					const objectTrigger = (chatTrigger) ? chatTrigger : (cutsceneTrigger) ? cutsceneTrigger : (battleTrigger) ? battleTrigger : null;

					const npc = new NPC(this.scene, object.x, object.y, object.grid, object.name, 'npc', object.chat, object.pose, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);
					this.add(npc);

					npc.body.setImmovable();
					let zone = new Proximity(this.scene, npc, null, null, 'talk_icon');
					this.scene.proximityZones.add(zone);
					zone.body.setAllowGravity(false);
				}
			});
		}
		if (chapterNPCs){
			chapterNPCs.forEach((object) => {
				if (object.map == this.scene.mapName){
					const array = object.name.split("_");
					const name = object.name;
					
					const chatTrigger = object.chat;
					const cutsceneTrigger = object.cutscene;
					const battleTrigger = object.battle;
					const objectTrigger = (chatTrigger) ? chatTrigger : (cutsceneTrigger) ? cutsceneTrigger : (battleTrigger) ? battleTrigger : null;

					const npc = new NPC(this.scene, object.x, object.y, object.grid, object.name, 'npc', object.chat, object.pose, object.hp, object.chakra, object.ryo, object.strength, object.defense, object.speed, object.level);
					this.add(npc);

					npc.body.setImmovable();
					let zone = new Proximity(this.scene, npc, null, null, 'talk_icon');
					this.scene.proximityZones.add(zone);
					zone.body.setAllowGravity(false);
				}
			});
		}
	}

	update(){
		this.children.each((npc) => {
			if (npc.active){
				npc.update();
			}
		});
	}

	addEvents(){
	    // NPCs can't go through walls and floors
	    this.scene.physics.add.collider(this, this.scene.worldLayer);
	}
}
