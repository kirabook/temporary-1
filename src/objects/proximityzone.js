/**
 * Zone that detect when the player is close to a object
 */
export default class Proximity extends Phaser.GameObjects.Zone {

  constructor(scene, object, objectWidth, objectHeight, icon) {
    const coordinate = object.getTrueCenter();
    const coordinate2 = object.getTopCenter();

    super(scene, coordinate.x, coordinate.y, 2*scene.map.tileWidth, 2*scene.map.tileHeight);
    this.scene = scene;
    this.object = object;
    this.iconReference = icon;
    this.role = object.role+"_zone"

    this.width = (objectWidth) ? objectWidth : this.object.body.width * this.object._scaleX;
    this.height = (objectHeight) ? objectHeight : this.object.body.height * this.object._scaleY;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.getCoordinates(this.object);

    // Add the icon
    this.icon = this.scene.add.image(0, 0, icon);
    this.icon.setDepth(this.scene.map.heightInPixels + 20).setOrigin(0.5, 1).setVisible(false);
    this.updateIcon(icon);

    this.setInteractive({ useHandCursor: true });
    this.setOrigin(0).setName(object.name+"_zone");
    this.body.setAllowGravity(false);

    this.setProximity();

  }

  update() {
    // Treat 'embedded' as 'touching' also
    if (this.body.embedded) this.body.touching.none = false;
    this.touching = !this.body.touching.none;
    this.wasTouching = !this.body.wasTouching.none;
    if (this.touching && !this.wasTouching) this.overlapIn();
    else if (!this.touching && this.wasTouching) this.overlapOut();

    this.body.debugBodyColor = this.body.touching.none ? 0x00ffff : 0xffff00;

    this.setProximity();
    this.getCoordinates(this.object);
    this.updateIcon(this.iconReference);
  }

  setProximity(){
    //position of the box
    if (this.object.role == 'player' || this.object.role == 'npc') {
      this.body.width = this.object.body.width;
      this.body.height = this.object.body.height;
      this.width = this.object.body.width;
      this.height = this.object.body.height;
      this.setPosition(this.object.body.position.x, this.object.body.position.y);
    } else {
      this.setPosition(this.object.x, this.object.y);
    }
  }

  updateIcon(icon){
    // Add the icon
    if (this.iconReference) {
      this.icon.setPosition(this.coordinate2.x , this.coordinate2.y - 20);
    }
  }

  getCoordinates(object){
    this.coordinate = object.getTrueCenter();
    this.coordinate2 = object.getTopCenter();
  }

  overlapIn(){
    if (this.iconReference) { this.icon.setVisible(true); }
    this.on('pointerdown', this.trigger);
    this.scene.input.keyboard.on('keydown', this.onKeyInput, this);

  }

  overlapOut(){
    //end all chats when you walk away from a character
    if (this.iconReference) { this.icon.setVisible(false); }
    this.off('pointerdown', this.trigger);
    this.scene.input.keyboard.off('keydown', this.onKeyInput, this);

    //if a cutscene or chat is active, then run "endChat"
    if ( this.scene.registry.get('cutsceneActive') == true || this.scene.registry.get('chatActive') == true ){
      this.scene.endChat();
    }
  }

  onKeyInput(event) {
    //cases for triggering events/doors
    switch(event.code){
      case 'Enter':
          this.trigger();
      break;
      default:
      break;
    }
  }

  disableZone(){
    this.disableInteractive()
  }

  enableZone(){
    this.setInteractive({ useHandCursor: true });
  }

  // If the player press the SPACE bar or enter while being in a proximity zone
  trigger(){
    if (this.iconReference) { this.icon.setVisible(false); }
    if (this.object.role == 'player' || this.object.role == 'npc') {
      this.object.lookAt(this.scene.player);
      this.object.chat();
    } else if (this.object.role == 'door' || this.object.role == 'stairs'){
      this.object.useDoor();
    } else if (this.object.role == 'cutsceneObject'){
      this.object.cutscene();
    } else if (this.object.role == 'battleObject') {
      this.object.battle();
    }
  }
}
