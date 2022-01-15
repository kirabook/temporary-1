export default class SpriteObject extends Phaser.Physics.Arcade.Sprite {

	constructor(scene, x, y, grid, width, height, name, role, trigger, pose, newMapName, hp, chakra, ryo, strength, defense, speed, level) {
		super(scene, x, y, name)

		this.scene = scene;
	    this.name = name;
	    this.role = role;
		this.objectScale = 1;

	    this.originalHP = hp ? hp : 100;
	    this.originalCP = chakra ? chakra : 100;
	    this.originalDamage = strength ? strength : 100;
	    this.originalDefense = defense ? defense : 100;
	    this.originalspeed = speed ? speed : 100;

	    this.hp = hp ? hp : 100;
	    this.chakra = chakra ? chakra : 100;
	    this.ryo = ryo ? ryo : 0;
	    this.strength = strength ? strength : 100;
	    this.defense = defense ? defense : 100;
	    this.speed = speed ? speed : 100;

		scene.registry.set(name+'_hp', this.hp);
		scene.registry.set(name+'_chakra', this.chakra);
		scene.registry.set(name+'_ryo', this.ryo);
		scene.registry.set(name+'_strength', this.strength);
		scene.registry.set(name+'_defense', this.defense);
		scene.registry.set(name+'_speed', this.speed);

		scene.physics.add.existing(this);
		scene.add.existing(this);

		const mapName = this.scene.mapName;
		const locationType = this.scene.locationsData.map[mapName].type;

		this.setSize(width, height).setOrigin(0, 0).setPosition(x, y).setScale(this.objectScale);
        this.body.setSize(width, height).setOffset(0, 0);

		if (grid){
        	scene.gameGrid.placeAtIndex(grid, this);
		}

		scene.anims.create({
			key: name+'_closed',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'_open',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 5 })
		})

		if (name){
			this.play(name+'_closed');
		}
	}

	update(time, delta) {
		super.update(time, delta);
	}

	playAnimation(direction, animation){
		direction ? direction : 'idle';
		this.play(name+'-'+direction+'-'+animation);
	}

	getTrueCenter() {
	    const x = this.x + (0.5 - this.originX) * this.width;
	    const y = this.y + (0.5 - this.originY) * this.height;
	    return new Phaser.Math.Vector2(x,y);
	}

	getTopCenter() {
	    const width = (this.sprite) ? this.sprite.displayWidth : this.width;
	    const height = (this.sprite) ? this.sprite.displayHeight : this.height;
	    const x = this.x + (0.5 - this.originX) * width;
	    const y = this.y - this.originY * height;
	    return new Phaser.Math.Vector2(x,y);
	}

	getTopLeft() {
	    const width = (this.sprite) ? this.sprite.displayWidth : this.width;
	    const height = (this.sprite) ? this.sprite.displayHeight : this.height;
	    const x = this.x + (1 - this.originX) * width;
	    const y = this.y - this.originY * height;
	    return new Phaser.Math.Vector2(x,y);
	}

	setOrientation(orientation) {
	    if (orientation != this.orientation) {
	      	this.orientation = orientation;
	    }
	}

	lookAt(target) {
	    this.lookAtVector(target.x - this.x, target.y - this.y);
	}

	lookAtVector(varX, varY) {
	    let orientation;
	    if (Math.abs(varX) > Math.abs(varY)) {
	      if (varX < 0) {
	        orientation = "left";
	      } else {
	        orientation = "right";
	      }
	    } else {
	      if (varY < 0) {
	        //orientation = "up";
	      } else {
	        //orientation = "down";
	      }
	    }
	    this.setOrientation(orientation);
	}

    // when the associated enemy or player unit is killed
    unitKilled() {
        this.menuItem.active = false;
        this.menuItem.hidden = true;
        this.menuItem.visible = false;
    }

    buff(target, data, activeTeam){
        this.scene.events.emit('battleMessage', `${this.name} buffs ${target.name}`, activeTeam);
    }

    selfbuff(target, data, activeTeam){
        this.scene.events.emit('battleMessage', `${this.name} selfbuffs ${target.name}`, activeTeam);
    }

    debuff(target, data, activeTeam){
        this.scene.events.emit('battleMessage', `${this.name} debuffs ${target.name}`, activeTeam);
    }

    defend(turn, data, activeTeam){
    	this.scene.events.emit('battleMessage', `${this.name} defends`, activeTeam);
    }

	attack(target, data, activeTeam) {
	    if (target.living) {
            this.scene.events.emit('battleMessage', `${this.name} used ${data.name}`, this.role, 'attacker');

            //damage calculation
            var damage = data.attack ? data.attack : 5;
            var damageCalc = Math.floor((this.strength + damage) * ( 100 / (100 + target.defense )));

            //chakra cost caculation
            this.chakra -= data.chakra_cost;
            this.chakra = Math.max(0, this.chakra);
            var percentageDecrease = 1 - ((this.originalCP - this.chakra) / this.originalCP);
            this.charaterMeterSet(percentageDecrease, 'chakra', this.battleSide);

            //health cost calculation
            this.hp -= data.hp_cost;
            this.hp = Math.max(0, this.hp);
            var percentageDecrease = 1 - ((this.originalHP - this.hp) / this.originalHP);
            this.charaterMeterSet(percentageDecrease, 'hp', this.battleSide);


            //animation
            this.playAnimation(this.name, this.orientation, 'damaged');
            this.once("animationrepeat", () => {
                this.stopAnimations();
            });

            //damage target
            target.takeDamage(damageCalc);

            //this.scene.events.emit('Message', `${this.name} used ${target.name} for ${damageCalc} damage`, activeTeam);
            this.scene.events.emit('battleMessage', `${damageCalc} damage`, target.role, 'target');
	    }
    }

    replenishHP(replenish){
    	
    }

    replenishChakra(replenish){
    	
    }

  	takeChakra(damage){

  	}

    takeDamage(damage) {
		this.hp -= damage;
		if (this.hp <= 0) {
			this.hp = 0;
			this.unitKilled();
			this.living = false;
			this.visible = false;
			this.menuItem = null;
		}

        var percentageDecrease = 1 - ((this.originalHP - this.hp) / this.originalHP);
		this.charaterMeterSet(percentageDecrease, 'hp', this.battleSide);
        this.playAnimation(this.name, this.orientation, 'damaged');
        this.once("animationrepeat", () => {
            this.stopAnimations();
        });
    }
}
