import SpriteObject from "../objects/object.js";

/**
 * Non Playable Character
 */
export default class OBJ extends SpriteObject {
  constructor(scene, x, y, grid, width, height, name, role, trigger, pose, newMapName, hp, chakra, ryo, strength, defense, speed, level) {
    super(scene, x, y, grid, width, height, name, role, trigger, pose, newMapName, hp, chakra, ryo, strength, defense, speed, level);
    this.trigger = trigger;
    this.mapName = newMapName;
  }

  chat(){
    this.scene.startChat({'object':this,'trigger':this.trigger});
  }

  cutscene(){
    this.scene.startCutscene({'object':this,'trigger':this.trigger});
  }

  battle(){
   this.scene.startBattle({'trigger':this.trigger});
  }

  useDoor(){
    var locationItemCache = this.scene.cache.json.entries.entries.map_locations.maps.files;
    var locationStatus = locationItemCache.find(locationItemCache => locationItemCache.key === this.mapName);
    var commonUI = this.scene.scene.get('CommonUI');
  	if (this.mapName && locationStatus){
      this.scene.player.playerDeactivate();
      this.scene.exitMap(this.mapName);
      //commonUI.onExit(this.mapName);
    } else {
      this.scene.events.emit('Message', "Can't go this way.");
      this.scene.player.playerActive();
    }
  }
}
