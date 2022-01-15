import Character from "../objects/character.js";

/**
 * Non Playable Character
 */
export class NPC extends Character {
  constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level, target) {
    super(scene, x, y, grid, name, 'npc', trigger, pose, hp, chakra, ryo, strength, defense, speed, level, target);
    this.trigger = trigger;

    this.setScale(this.characterScale);
    this.setPosition(x, scene.worldLayer.height - this.body.height + 64);
    this.setDepth(scene.map.heightInPixels + 9);
    this.play(name+'-idle');
    
  }

  chat(){
    this.scene.startChat({'object':this,'trigger':this.trigger});
  }

  cutscene(){
    this.scene.startCutscene({'object':this,'trigger':this.trigger});
  }

  battle(){
    this.scene.scene.start('Battle', {"battle":this.trigger, "y":scene.player.y});
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

export class Follower extends Character {
  constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level, target) {
    super(scene, x, y, grid, name, 'npc', trigger, pose, hp, chakra, ryo, strength, defense, speed, level, target);
    this.trigger = trigger;
    this.target = target;

    this.setScale(target.characterScale);
    this.setPosition(target.x, scene.worldLayer.height - this.body.height + 64);
    this.setDepth(scene.map.heightInPixels + 9);
    this.play(name+'-idle');
    
  }

  chat(){
    this.scene.startChat({'object':this,'trigger':this.trigger});
  }

  cutscene(){
    this.scene.startCutscene({'object':this,'trigger':this.trigger});
  }

  battle(){
    this.scene.scene.start('Battle', {"battle":this.trigger, "y":scene.player.y});
  }
  update(){
    let t = {};
    let distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    this.targetMoving = false;

    if (this.target.history !== undefined && this.target.history.length) {
      // This target has a history so go towards that
      t = this.target.history[0];

      if ((this.target.body.velocity.x !== 0 || this.target.body.velocity.y !== 0) && distance > this.MIN_DISTANCE) {
        this.targetMoving = true;
      }
    } else {
      // This target doesn't have a history defined so just
      // follow its current x and y position
      t = { a: this.target.x, b: this.target.y };
      //this.setTargetAngle();

      // Calculate distance to target
      // If the position is far enough way then consider it "moving"
      // so that we can get this Follower to move.
      let distance = Phaser.Math.Distance.Between(this.x, this.y, t.a, t.b);
      if (distance > this.MIN_DISTANCE) {
        this.targetMoving = true;
      }
    }

    // If the distance > MIN_DISTANCE then move
    if (this.targetMoving) {

      // Add current position to the end of the history array
      const { x, y } = this;
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        this.history.push({ a: x, b: y });
      }

      // If the length of the history array is over a certain size
      // then remove the oldest (first) element
      if (this.history.length > this.HISTORY_LENGTH) {
        this.history.shift();
      }

      this.setOrientation(this.target.orientation);
      this.playerController.setState(this.target.currentAnimation);
    }
     else {
      this.setOrientation(this.target.orientation);
      this.playerController.setState('idle');
     }
  }
}
