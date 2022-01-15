/**
 * Group
 */
export default class Group extends Phaser.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
    	this.scene = scene;
	}

	update(){
		//..
	}

	addEvents(){
		//,,
	}

  // get a property from an object defined in the JSON map
  getObjectProperty(property, object){
    let value;
		if(object.properties){
		    object.properties.forEach((item, index) => {
		      if (item.name === property) {
		        value = item.value;
		        return;
		      }
		    });
		}
    return value;
  }
}
