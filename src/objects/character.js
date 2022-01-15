import { getElement, setAttribute, getAttribute, querySelector, querySelectorAll } from '../dom/elementsHander';
import PlayerController from './playercontroller';
import { getPercentage, getOption, pathSpeed } from '../dom/globalFunctions';

export default class Character extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level, target) {
		super(scene, x, y, name)

		const camera = scene.cameras.main;
        scene = scene; this.scene = scene;
        this.commonUIScene = scene.scene.get('CommonUI');
        this.battleUI = scene.scene.get('BattleUI');
        this.mainScene = scene.scene.get('Game');
        
        this.lastCursorDirection = "center";
        this.cursors = scene.input.keyboard.addKeys('W,S,A,D,UP,LEFT,RIGHT,DOWN,SPACE');

        this.name = name;
        this.key = name;
	    this.role = role;
        this.pose = pose;
        this.orientation = (this.role == 'player' || this.role == 'hero') ? 'right' : (this.role == 'enemy') ? 'left' : getOption(['left','right']);

        this.jutsuList = {};
        this.rankJutsuList = {};

        this.menuItem = null;
        this.inventory = this.mainScene.inventories[name];

	    //set character stats
        this.living = true;
        this.buffed = false;
        this.debuffed = false;
        this.currentBuff;
        this.currentDebuff;
        this.buffCounter;
        this.debuffCounter;

    	var characterData = scene.registry.get('characterData');
	    this.characterChart = characterData[name].levels || {"hp":50,"chakra":25,"strength":5,"defense":5,"speed":5};
        this.level = level ? level : scene.registry.get(this.name+'_level') ? scene.registry.get(this.name+'_level') : 0;
        var levelChart = this.characterChart[this.level] || this.characterChart;

	    this.originalHP = hp ? hp : levelChart['hp'];
	    this.originalCP = chakra ? chakra : levelChart['chakra'];
	    this.originalDamage = strength ? strength : levelChart['strength'];
	    this.originalDefense = defense ? defense : levelChart['defense'];
        this.originalSpeed = speed ? speed : levelChart['speed'];

        this.hp = hp ? hp : levelChart['hp'];
        this.chakra = chakra ? chakra : levelChart['chakra'];
        this.ryo = scene.registry.get(this.name+'_ryo') ? scene.registry.get(this.name+'_ryo') : ryo ? ryo : 100;
        this.strength = scene.registry.get(this.name+'_strength') ? scene.registry.get(this.name+'_strength') : strength ? strength : levelChart['strength'];
        this.defense = scene.registry.get(this.name+'_defense') ? scene.registry.get(this.name+'_defense') : defense ? defense : levelChart['defense'];
        this.speed = scene.registry.get(this.name+'_speed') ? scene.registry.get(this.name+'_speed') : speed ? speed : levelChart['speed'];
        
		scene.registry.set(name+'_hp', this.hp);
		scene.registry.set(name+'_chakra', this.chakra);
		scene.registry.set(name+'_ryo', this.ryo);
		scene.registry.set(name+'_strength', this.strength);
        scene.registry.set(name+'_defense', this.defense);
        scene.registry.set(name+'_speed', this.speed);
        scene.registry.set(name+'_level', this.level);
	    
		scene.physics.add.existing(this);
		scene.add.existing(this);

		scene.anims.create({
			key: name+'-idle',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'-down-idle',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'-up-idle',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'-left-idle',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'-right-idle',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 })
		})

		scene.anims.create({
			key: name+'-left-down',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-right-down',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-left-up',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-right-up',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-left-crouch',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 }),
		})

		scene.anims.create({
			key: name+'-right-crouch',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 0 }),
		})

		scene.anims.create({
			key: name+'-left-sneak',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-right-sneak',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-left-walk',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

		scene.anims.create({
			key: name+'-right-walk',
			frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
			frameRate: 10,
			repeat: -1
		})

        scene.anims.create({
            key: name+'-left-run',
            frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: name+'-right-run',
            frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: name+'-left-damaged',
            frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: name+'-right-damaged',
            frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        })

        //this.navMesh = navMesh;
	    this.path = null;
	    this.currentTarget = null;
        this.history = [{ a: x, b: y }];
        this.MIN_DISTANCE = 300;

        // diagonal movement
        this.body.velocity.normalize().scale(this.vel);
		if (grid){ scene.gameGrid.placeAtIndex(grid, this); }

		this.characterScale = 1;
        this.body.setOffset(0, 0 - 32);
		this.setCollideWorldBounds(true);

		// create an instance of PlayerController
		const locationType = (scene.locationsData) ? scene.locationsData.map[scene.mapName].type : null;
		switch(locationType){
			case 'room':
				this.characterScale = 1.5;
			break;
			case 'inside':
				this.characterScale = 1;
			break;
			case 'outside':
				this.characterScale = .5;
			break;
			default:
				this.characterScale = 1;
			break;
		}

		switch(role){
			case 'player':
				this.setScale(this.characterScale);
			 	this.setPosition(x, y - this.body.height + 99);
				this.setDepth(scene.map.heightInPixels + 10);
			break;
			case 'follower':
				this.setScale(this.characterScale);
			 	this.setPosition(scene.player.x, y - this.body.height + 99);
				this.setDepth(scene.map.heightInPixels + 10);
			break;
            case 'battle':
            case 'hero':
            case 'enemy':
                this.characterIndicator = scene.add.image(this.x, this.y, 'down_arrow_hover').setOrigin(0, 0).setDisplaySize(32, 32).setPosition(this.x, this.y);
            break;
			default:
				this.setScale(this.characterScale);
			 	this.setPosition(scene.player.x, y - this.body.height + 99);
				this.setDepth(scene.map.heightInPixels + 10);
			break;
		}

		this.setOrientation(this.orientation);
		this.play(name+'-'+this.orientation+'-idle');
		this.playerController = new PlayerController(this);
		this.playerController.setState('idle');
	}

    update(time, delta) {
        super.update(time, delta);

        if (this.role == 'player' && this.active == true){
            
            //Update joystick and key presses
            this.updateKeypress();
            this.commonUIScene.updateJoystickState();

            // all the ways the player can move.
            let left  = this.cursors.A.isDown || this.cursors.LEFT.isDown;
            let right = this.cursors.D.isDown || this.cursors.RIGHT.isDown;
            let up    = this.cursors.W.isDown || this.cursors.UP.isDown || this.cursors.SPACE.isDown;
            let down  = this.cursors.S.isDown || this.cursors.DOWN.isDown;

            if (left || this.lastCursorDirection === "left") {
                this.setOrientation('left');
                this.playerController.setState('walk');
            } else if (right || this.lastCursorDirection === "right") {
                this.setOrientation('right');
                this.playerController.setState('walk');
            } else if (down || this.lastCursorDirection === "down") {
                if (this.body.onFloor()){
                    this.playerController.setState('crouch');
                } else {
                    this.playerController.setState('down');
                }
            } else if (this.lastCursorDirection === "downleft") {
                this.setOrientation('left');
                if (this.body.onFloor()){
                    this.playerController.setState('sneak');
                }
            } else if (this.lastCursorDirection === "downright") {
                this.setOrientation('right');
                if (this.body.onFloor()){
                    this.playerController.setState('sneak');
                }
            } else {
                this.stopAnimations();
            }

            //double jump
            if (Phaser.Input.Keyboard.JustDown(this.cursors.W) || Phaser.Input.Keyboard.JustDown(this.cursors.UP) || Phaser.Input.Keyboard.JustDown(this.cursors.SPACE)) {
                let btnDuration = this.cursors.W.getDuration() + this.cursors.UP.getDuration() + this.cursors.SPACE.isDown + this.cursors.SPACE.getDuration();
                this.jump(btnDuration);
            }
        }

        if (Math.abs(this.body.velocity.x) > 0 || Math.abs(this.body.velocity.y) > 0) {
			const { x, y } = this;
			if (!Number.isNaN(x) && !Number.isNaN(y)) {
				this.history.push({ a: x, b: y });
				console.log(this.history[0].a);
			}

			// If the length of the history array is over a certain size
			// then remove the oldest (first) element
			if (this.history.length > 5) {
				this.history.shift();
			}
		}
    }

    loadAbilities(){
    	var abilitiesData = this.scene.registry.get('abilitiesData');
        for (const key in abilitiesData) {
            this.jutsuList[key] = [];
                for (const key2 in abilitiesData[key]) {
                    var users = abilitiesData[key][key2]['users'];
                    var level = abilitiesData[key][key2]['level'];
                    if ((users.includes(this.name) || users.includes('all')) && level <= this.level ) this.jutsuList[key].push(abilitiesData[key][key2]);
            }
        }
    }

    loadPrioritiesAbility(currentRank){
        for (const key in this.jutsuList) {
            this.rankJutsuList[key] = [];
            for (const key2 in this.jutsuList[key]) {
                var rank = this.jutsuList[key][key2]['rank'];
                if (rank == currentRank || (rank == 'S')) this.rankJutsuList[key].push(this.jutsuList[key][key2]);
                if (rank == currentRank || (rank == 'A' || rank == 'B')) this.rankJutsuList[key].push(this.jutsuList[key][key2]);
                if (rank == currentRank || (rank == 'C' || rank == 'D' || rank == 'E')) this.rankJutsuList[key].push(this.jutsuList[key][key2]);
            }
        }
    }

    createCharacterHUD(scene){
       //new character hud code 
       var battleUI = getElement('battleUI');
       this.characterHUD = battleUI.querySelectorAll(`.item[data-key="${this.name}"]`);
       this.hpVal = battleUI.querySelectorAll(`.item[data-key="${this.name}"] .health-val`);
       this.chakraVal = battleUI.querySelectorAll(`.item[data-key="${this.name}"] .chakra-val`);
       this.hpBar = battleUI.querySelectorAll(`.item[data-key="${this.name}"] .health-bar .bar`);
       this.chakraBar = battleUI.querySelectorAll(`.item[data-key="${this.name}"] .chakra-bar .bar`);
       this.characterPortrait = battleUI.querySelectorAll(`.item[data-key="${this.name}"] .character-portrait-image`);

       const originalHP = this.originalHP;
       const originalCP = this.originalCP;
       var hpPercentage = (1 - ((originalHP - this.hp) / originalHP)) * 100;
       var chakraPercentage = (1 - ((originalCP - this.chakra) / originalCP)) * 100;

       for (const hpVal of this.hpVal) { hpVal.innerHTML = `${this.hp}/${originalHP}`; }
       for (const hpBar of this.hpBar) { hpBar.style.width = `${hpPercentage}%`; }
       for (const chakraVal of this.chakraVal) { chakraVal.innerHTML = `${this.chakra}/${originalCP}`; }
       for (const chakraBar of this.chakraBar) { chakraBar.style.width = `${chakraPercentage}%`; }
    }

    charaterMeterSet(percent = 1, meter){
        switch(meter){
            case 'hp':
            	for (const hpVal of this.hpVal) { hpVal.innerHTML = `${this.hp}/${this.originalHP}`; }
            	for (const hpBar of this.hpBar) { hpBar.style.width = (percent*100)+"%"; }
                this.scene.registry.set(this.name+'_hp', this.hp);
                this.characterPortraitStatus(percent);
            break;
            case 'chakra':
            	for (const chakraVal of this.chakraVal) { chakraVal.innerHTML = `${this.chakra}/${this.originalCP}`; }
            	for (const chakraBar of this.chakraBar) { chakraBar.style.width = (percent*100)+"%" }
				this.scene.registry.set(this.name+'_chakra', this.chakra);
            break;
        }
    }

    characterPortraitStatus(percent){
        var characterStatus = percent <= .10 ? 'dead' : percent <= .35 ? 'danger' : percent <= .55 ? 'caution' : null;

        switch(characterStatus){
            case 'dead':
            case 'danger':
            case 'caution':
            	for (const characterHUD of this.characterHUD) { characterHUD.setAttribute('data-status', characterStatus); }
            	for (const characterPortrait of this.characterPortrait) { characterPortrait.src = `src/assets/characters/${this.name}_icon_${characterStatus}.png` }
            break;
            default:
            	for (const characterHUD of this.characterHUD) { characterHUD.setAttribute('data-status', "normal"); }
            	for (const characterPortrait of this.characterPortrait) { characterPortrait.src = `src/assets/characters/${this.name}_icon.png` }
            break;
        }
    }

    updateCharacterStats(){
    	//this updates the character values outside of battle. But it may be better to NOT do that. Keep battles as a mini game self contained
        this.hp = this.scene.registry.get(this.name+'_hp');
        this.chakra = this.scene.registry.get(this.name+'_chakra');
        this.ryo = this.scene.registry.get(this.name+'_ryo');
        this.strength = this.scene.registry.get(this.name+'_strength');
        this.defense = this.scene.registry.get(this.name+'_defense');
        this.speed = this.scene.registry.get(this.name+'_speed');
        this.level = this.scene.registry.get(this.name+'_level');

        this.charaterMeterSet(getPercentage(this.originalHP, this.hp), 'hp');
        this.charaterMeterSet(getPercentage(this.originalCP, this.chakra), 'chakra');
    }

	jump(btnDuration) {		
	    if (this.role == 'player'){
	    	if (this.body.onFloor() && btnDuration < 25) {
		        // player can only double jump if it is on the floor
		        this.canDoubleJump = true;
		        this.playerController.setState('up');
		    } else if (this.canDoubleJump) {
		        // player can only jump 2x (double jump)
		        //console.log('double jumping');
		        this.canDoubleJump = false;
		        this.playerController.setState('up');
		    }
		} else {

		}
	}

	updateKeypress() {
		let direction = '';
		for (let key in this.cursors) {
		  if (this.cursors[key].isDown) {
		    direction += key;
		  }
		}

		// If no direction if provided then stop 
		// the player animations and exit the method
		if(direction.length === 0) { 
		  //this.stopAnimations();
		  return;
		}

		// If last cursor direction is different
		//  the stop all player animations
		if (this.lastCursorDirection !== direction) {
		  this.stopAnimations();
		}

		// Set the new cursor direction
		this.lastCursorDirection = direction;

		// Handle the player moving
		//this.movePlayer();
	}

	playAnimation(name, direction, animation){
		animation ? animation : 'idle';
		direction ? direction : 'right';
		this.play(name+'-'+'left-'+animation);
	}

	stopAnimations(){
		this.anims.stop();
        if (this.playerController){ this.playerController.setState('idle'); }
	}

	playerActive(){
 		this.active = true;
		this.scene.registry.set('playerActive', true);
	}

	playerDeactivate(){
 		this.active = false;
 		this.setVelocity(0);
		this.scene.registry.set('playerActive', false);
	}

	getTrueCenter() {
	    const x = this.x + (0.5 - this.originX) * this.width * this._scaleX;
	    const y = this.y + (0.5 - this.originY) * this.height * this._scaleY;
	    return new Phaser.Math.Vector2(x,y);
	}

	getTopCenter() {
	    const width = (this.sprite) ? this.sprite.displayWidth : this.width * this._scaleX;
	    const height = (this.sprite) ? this.sprite.displayHeight : this.height * this._scaleY;
	    const x = this.x + (0.5 - this.originX) * width;
	    const y = this.y - this.originY * height;
	    return new Phaser.Math.Vector2(x,y);
	}

	getTopLeft() {
	    const width = (this.sprite) ? this.sprite.displayWidth : this.width * this._scaleX;
	    const height = (this.sprite) ? this.sprite.displayHeight : this.height * this._scaleY;
	    const x = this.x + (1 - this.originX) * width;
	    const y = this.y - this.originY * height;

	    return new Phaser.Math.Vector2(x,y);
	}

	setOrientation(orientation) {
	    if (orientation != this.orientation) {
	      	this.orientation = orientation;
	      	this.anims.play(this.name + '-' + this.orientation + '-idle', true);
	    }
	}

	lookAt(target) {
	    this.lookAtVector(target.x - this.x, target.y - this.y);
	}

	lookAtVector(varX, varY) {
	    let orientation;
	    if (Math.abs(varX) > Math.abs(varY)) {
            orientation = varX < 0 ? "left" : "right";
	    } else {
            orientation = varY < 0 ? "up" : "down";
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
        if (target.living) {
            switch(data.subtype){
                case 'heal':
                    this.hp += data.hp_restore;
                    this.hp = Math.min(this.originalHP, this.hp);
                    var percentageIncrease = getPercentage(this.originalHP, this.hp);

                    this.charaterMeterSet(percentageIncrease, 'hp', this.battleSide);

                    console.log(this.hp)
                    this.battleUI.events.emit('BattleMessage', `${this.name} buffs ${target.name}`, activeTeam);
                break;
                case 'chakra':
                    this.chakra += data.chakra_restore;
                    this.chakra = Math.min(this.originalCP, this.chakra);
                    var percentageIncrease = getPercentage(this.originalHP, this.hp);
                    this.charaterMeterSet(percentageIncrease, 'chakra', this.battleSide);

                    this.battleUI.events.emit('BattleMessage', `${this.name} buffs ${target.name}`, activeTeam);
                break;
                case 'cure':
                    this.battleUI.events.emit('BattleMessage', `${this.name} buffs ${target.name}`, activeTeam);
                break;
                default: 
                    this.buffed = true;
                    this.currentBuff = data.key;
                    this.buffCounter = data.counter;
                break;
            }
        }
    }

    selfbuff(target, data, activeTeam){
        this.battleUI.events.emit('BattleMessage', `${this.name} selfbuffs ${target.name}`, activeTeam);
    }

    debuff(target, data, activeTeam){
        this.debuffed = false;
        this.currentDebuff = null;
        this.debuffCounter = 0;
        this.battleUI.events.emit('BattleMessage', `${this.name} debuffs ${target.name}`, activeTeam);
    }

    defend(turn, data, activeTeam){
    	this.battleUI.events.emit('BattleMessage', `${this.name} defends`, activeTeam);
    }

	attack(target, data, activeTeam) {
	    if (target.living) {
            this.battleUI.events.emit('BattleMessage', `${this.name} used ${data.name}`, this.role, 'attacker');

            //damage calculation
            var damage = data.attack ? data.attack : 0;
            var damageCalc = Math.floor((this.strength + damage) * ( 100 / (100 + target.defense )));

            //chakra cost caculation
            this.chakra -= data.chakra_cost;
            this.chakra = Math.max(0, this.chakra);
            var percentageDecrease = getPercentage(this.originalCP, this.chakra);
            this.charaterMeterSet(percentageDecrease, 'chakra', this.battleSide);

            //health cost calculation
            this.hp -= data.hp_cost;
            this.hp = Math.max(0, this.hp);
            var percentageDecrease = getPercentage(this.originalHP,this.hp);
            this.charaterMeterSet(percentageDecrease, 'hp', this.battleSide);

            //animation
            this.playAnimation(this.name, this.orientation, 'damaged');
            this.once("animationrepeat", () => {
                this.stopAnimations();
            });

            //damage target
            target.takeDamage(damageCalc);

            //scene.events.emit('Message', `${this.name} used ${target.name} for ${damageCalc} damage`, activeTeam);
            this.battleUI.events.emit('BattleMessage', `${damageCalc} damage`, target.role, 'target');
	    }
    }

    takeDamage(damage) {
		this.hp -= damage;
		if (this.hp <= 0) {
			this.hp = 0;
			this.unitKilled();
			this.living = false;
			this.visible = false;
			//this.menuItem = null;
		}

        var percentageDecrease = getPercentage(this.originalHP, this.hp);
		this.charaterMeterSet(percentageDecrease, 'hp', this.battleSide);
        this.playAnimation(this.name, this.orientation, 'damaged');
        this.once("animationrepeat", () => {
            this.stopAnimations();
        });
    }
}
