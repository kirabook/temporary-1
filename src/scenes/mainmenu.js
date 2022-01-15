import AlignGrid from '../ui/grid';
import { createElement, getElement, setInner, addToClass, removeToClass, appendChild, appendChildren, createDOMElement, setAttribute, querySelector } from '../dom/elementsHander';

const MainMenuConsts = {
	options: [
	'CHAPTER 0 Start',
	'CHAPTER SELECT',
	'LOAD',
	'OPTIONS',
	'CONTROLS',
	'CREDITS'
	],
};

export default class MainMenu extends Phaser.Scene {

	constructor() {
    	super('MainMenu');
	}
    init(){
    	this.commonMenu = this.scene.get('CommonMenu');    	
    }
	create() {		
		
    	const screenCenter = this.cameras.main.width / 2;
	    const width = this.cameras.main.width;
	    const height = this.cameras.main.height;
	    const speed = 2000;

		this.background = this.add
		.sprite(0,0,'background')
		.setScale(Math.max(this.cameras.main.height / 600, 1))
		.setOrigin(0,0);

	    //grid config
		var gridConfig = {
            'scene': this,
            'cols': 12,
            'rows': 20,
            'width': this.cameras.main.width,
            'height': this.cameras.main.height
        }

        this.gameGrid = new AlignGrid(gridConfig);
        //this.gameGrid.showNumbers();

		const logo = this.add.image(0, 0, "shinachikukosenlogo");
		const title = this.add.bitmapText(0, 0, 'standard-0753', 'SHINACHIKU KOSEN', 20);
		this.gameGrid.placeAtIndex(38, logo);
		this.gameGrid.placeAtIndex(157, title);

	    this.selectedOption = 0;
	    this.optionTexts = [];
	    let ypos = height / MainMenuConsts.options.length + 34;
	    for (const [i, option] of MainMenuConsts.options.entries()) {
	      	const text = this.add.bitmapText(screenCenter - 100, 100 + 50 * i, 'standard-0753', option, 30);
	    	text.setInteractive({ useHandCursor: true });
	    	text.on('pointerdown', () => this.chooseOption(i));
	      	this.optionTexts.push(text);
	    }

	    //this.tweens.add({targets: title, x: screenCenter - 100, y: 200, speed, ease: 'Bounce.easeI', repeat: 0});
		/*this.tweens.add({
			targets: logo,
			y: 500,
			duration: 2000,
			ease: "Power2",
			yoyo: true,
			loop: -1
		});*/

    	//this.playIntro(screenCenter);
    	this.cursors = this.input.keyboard.addKeys('W,S,A,D,UP,LEFT,RIGHT,DOWN,SPACE,ENTER');
	}

	update() {
    	super.update();
	    for (const [i, option] of this.optionTexts.entries()) {
	      	option.on('pointerover', () => option.tint = 0x000000);
	    	option.on('pointerout', () => option.tint = 0xFFFFFF);
	    }

	    this.handleInput();
	}

	handleInput() {
	    if (this.cursors.UP.isDown) {
			this.selectedOption--;
			console.log('up');
			//this.audio.play(this.audio.sfx.hero.punch, 2);
	    }
	    else if (this.cursors.DOWN.isDown) {
			this.selectedOption++;
			console.log('down');
			//this.audio.play(this.audio.sfx.hero.punch, 1);
	    }
	    else if (this.cursors.SPACE.isDown || this.cursors.ENTER.isDown) {
	     	console.log('left');
	      	this.chooseOption(this.selectedOption);
	  	}

	    if (this.selectedOption < 0)
	      this.selectedOption = 0;
	    if (this.selectedOption >= MainMenuConsts.options.length)
	      this.selectedOption = MainMenuConsts.options.length - 1;
	}

	 chooseOption(selectedOption) {
	    // start play scene
	    if (selectedOption == 0) {
	    	let selectedLevel = selectedOption;
	    	this.registry.set('chapter', selectedLevel);
	    	this.scene.start('ChapterPreloader', {"chapter":selectedLevel, "act":0});
	      // play sfx
	      //this.audio.play(this.audio.sfx.go);
		
		//this.scene.start('loading', true, false, 'intro');
		}

	    // 
	    if(selectedOption == 1) {
	    	this.commonMenu.triggerMenu(this.scene, 'chaptersContainer');
	      //this.audio.play(this.audio.sfx.hero.punch, 2);
	      //this.scene.start('options');
	    }

	    // 
	    if (selectedOption == 2) {
	    	this.commonMenu.triggerMenu(this.scene, 'saveContainer');
	      //this.audio.play(this.audio.sfx.hero.punch, 2);
	      //this.scene.start('options-audio');
	    }

	    // start option scene
	    if (selectedOption == 3) {
	    	this.commonMenu.triggerMenu(this.scene, 'optionsContainer');
	      //this.audio.play(this.audio.sfx.hero.punch, 2);
	      //this.scene.start('options-audio');
	    }

	    // start credits scene
	    if(selectedOption == 4) {
	    	this.commonMenu.triggerMenu(this.scene, 'optionsContainer');
	      //this.audio.play(this.audio.sfx.hero.punch, 2);
	      //this.scene.start('credits');
	    }
	}
}