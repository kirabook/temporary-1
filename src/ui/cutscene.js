import CutsceneCharacter from '../objects/cutsceneCharacterEntities';
import CutsceneSpeechbubble from '../ui/cutsceneSpeechbubble';

export default class Cutscene extends Phaser.Scene {
	//to do: implement different color options

	constructor() {
    	super('Cutscene');
	}

	init(data){
		const camera = this.cameras.main;
		this.mainScene = this.scene.get('Game');

		this.chatData = data;
		this.panelData = this.cache.json.get('panels');
		this.locationData = this.cache.json.get('locations');

		this.dialogueData = this.cache.json.get('dialogue');
		this.dialogueDataX = this.dialogueData.x;
		this.dialogueDataY = this.dialogueData.y;

		this.objectTarget = new Phaser.Math.Vector2();

		this.textColor = "#000000";
	    this.textStrokeColor = "#FFFFFF";
 		this.pagenum = 0;
 		this.panelnum = 0;
 		this.dialoguenum = 0;

		this.configWidth = 1280;
		this.configHeight = 720;

		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.cutsceneScale = 1;

		//calculates the center of the cutscene. Is used to put the backdrop and cutscene panels in the proper place
		this.cutsceneX = (-camera.width / 2) + (this.configWidth * this.cutsceneScale) / 2;
		this.cutsceneY = (-camera.height / 2) + (this.configHeight * this.cutsceneScale) / 2;

		//cutscene dialogues
		this.cutsceneDialogueContainer = this.add.group();

	    //cutscene backdrop
    	this.cutsceneContainerBackdrop = this.add
	      .rectangle(
	        this.cutsceneX,
	        this.cutsceneY,
	        this.screenWidth * 2,
	        this.screenHeight * 2,
	        0x000000,
	        .8
	      )
	      .setOrigin(0,0)

		//The cutscene container and overlay group which stores the cutscene objects
	    this.cutsceneOverlays = this.add.group();
	    this.cutsceneContainer = this.add
	      .container(
	        ((this.configWidth * this.cutsceneScale) / 2) + 1,
	        ((this.configHeight * this.cutsceneScale) / 2) + 1
	      )
	      .setSize(this.configWidth, this.configHeight)
	      .setScale(this.cutsceneScale)
	      //.add(this.cutsceneDialogueContainer);

	    //Cutscene marker to have consistent points to reference
    	this.cutsceneContainerMark = this.add
	      .rectangle(
	        this.cutsceneContainer.x,
	        this.cutsceneContainer.y,
	        this.cutsceneContainer.width,
	        this.cutsceneContainer.height,
	        0x0000ff,
	        0
	      )
	      .setScale(this.cutsceneScale);

	    this.cutsceneLoop();
	    this.waitForClickCutscene();

	    //set the camera of this scene to center the cutscene
		camera.setOrigin(0,0).setBounds(this.cutsceneX, this.cutsceneY, this.cutsceneContainer.width, this.cutsceneContainer.height).fadeIn(500);
		console.log(this)
	}

	drawDialogue(dialogue,panelnum){
		const currentPanel = this.cutsceneContainer.getByName('panel_'+panelnum);
		const camera = this.cameras.main;
		const currentCharacterName = dialogue.character;
		const currentCharacterAnimation = dialogue.animation;
		const currentCharacterEndAnimation = dialogue.endAnimation;
		const currentCharacterDirection = dialogue.direction;

		//set the position of the character
		const isOnFloor = (dialogue.onFloor == true) ? "onFloor" : "treeTops";
		const characterPositionX = (dialogue.x != undefined) ? (this.locationData.positions.x[dialogue.x]) : this.currentPanel.x;
		const characterPositionY = (dialogue.y != undefined) ? (this.locationData.positions.y.object[isOnFloor][dialogue.y]) : this.locationData.positions.y.object["default"];

		if (this.currentPanel.getByName(currentCharacterName) == undefined){
			//add characters
			this.currentCharacter = new CutsceneCharacter(this, characterPositionX, characterPositionY, null, currentCharacterName, 'cutscene');
			this.currentCharacter.setName(currentCharacterName);
			this.currentPanel.add(this.currentCharacter);
		} else {
			this.currentCharacter = this.currentPanel.getByName(currentCharacterName);
		}

		//character animations if applicable
		if (currentCharacterAnimation != undefined && currentCharacterAnimation != null){
			this.currentCharacter.play(currentCharacterName+'-'+currentCharacterDirection+'-'+currentCharacterAnimation);
		} else {
			this.currentCharacter.play(currentCharacterName+'-'+currentCharacterDirection+'-idle');
		}

		//character movement from point A to point B
		if ((dialogue.movetoX != undefined && dialogue.movetoX != null) || (dialogue.movetoY != undefined && dialogue.movetoY != null)){
			const objectX = (dialogue.movetoX) ? this.locationData.positions.x[dialogue.movetoX] : this.currentCharacter.x;
			const objectY = (dialogue.movetoY) ? this.locationData.positions.y[dialogue.movetoY] : this.currentCharacter.y;
			const currentCharacter = this.currentCharacter;
			let characterMovement = this.tweens.add({
				targets: currentCharacter,
				x: objectX,
				y: objectY,
				duration: 3000,
				onStart: function () {
					console.log('animation started')
					this.parent.scene.disableClickCutscene();
				},
				onComplete: function(){
					console.log('animation completed');
					this.parent.scene.currentCharacter.play(currentCharacterName+'-'+currentCharacterDirection+'-'+currentCharacterEndAnimation);
					this.parent.scene.waitForClickCutscene();
				}
			});
		}

		//speechbubbles
		const coordinate = this.currentCharacter.getTopLeft();
		let currentSpeechbubbleX = (this.currentPanel.originalX + this.currentCharacter.x * this.scale) - this.panelBoundsX;
		let currentSpeechbubbleY = (this.currentPanel.originalY + coordinate.y * this.scale) - this.panelBoundsY;

		let speechBubbleX = this.closest(currentSpeechbubbleX, this.dialogueDataX)
		let speechBubbleY = this.closest(currentSpeechbubbleY, this.dialogueDataY)

		//determines if speech bubble should be rendered or not
		if (dialogue.text != null && dialogue.text != undefined){
			this.currentSpeechbubble = new CutsceneSpeechbubble(this, speechBubbleX, speechBubbleY, currentCharacterName, dialogue.text, null, null, this.currentPanel);
		};

	}

	drawPanel(panel,panelnum,dialogue){
		const camera = this.cameras.main;
		if (this.cutsceneContainer.getByName('panel_'+panelnum) == undefined){
			let panel_type = (panel.set) ? panel.set : "full";
			let music = panel.music;
			let sfx = panel.sfx;
			let characters = panel.characters;
			let background = (panel.background) ? panel.background : "background";
			let isOnFloor = (panel.onFloor == true) ? "onFloor" : "treeTops";

			//set currentspeech bubble to null if a new panel is being drawn.
			this.currentSpeechbubble = null;

			if (this.screenWidth <= 740 || this.screenHeight <= 740){
				panel_type = 'full';
				if (panel.scale < 1) { panel.scale = 1 };
			}

			this.scale = (panel.scale) ? panel.scale : this.panelData.panels[panel_type]["scale"];
			this.panelBoundsX = (panel.panelBoundsX) ? (this.locationData.positions.x[panel.panelBoundsX] * this.scale) : this.locationData.positions.x[0] * this.scale;
			this.panelBoundsY = (panel.panelBoundsY != null && panel.panelBoundsY != undefined) ? (this.locationData.positions.y.panel[isOnFloor][panel.panelBoundsY] * this.scale) : this.locationData.positions.y.panel["default"] * this.scale;

			let panelx = this.panelData.panels[panel_type]["panelx"],
				panely = this.panelData.panels[panel_type]["panely"];

			let panelAX = this.panelData.panels[panel_type]["pointAX"],
				panelAY = this.panelData.panels[panel_type]["pointAY"],
				panelBX = this.panelData.panels[panel_type]["pointBX"],
				panelBY = this.panelData.panels[panel_type]["pointBY"],
				panelCX = this.panelData.panels[panel_type]["pointCX"],
				panelCY = this.panelData.panels[panel_type]["pointCY"],
				panelDX = this.panelData.panels[panel_type]["pointDX"],
				panelDY = this.panelData.panels[panel_type]["pointDY"];

			//set the bounds of the focus of the panel

			let panelPoints = [panelAX,panelAY,panelBX,panelBY,panelCX,panelCY,panelDX,panelDY];
			let polygon = new Phaser.Geom.Polygon(panelPoints);
		    let currentPanelOverlay = this.add
		    	.graphics({ x: 0, y: 0 })
		    	.lineStyle(2, 0x000000)
		    	.fillStyle(0xffffff, 0)
		    	.fillPoints(polygon.points, true)
		    	.beginPath()

		    for (var i = 0; i < polygon.points.length; i++){
		        currentPanelOverlay.lineTo(polygon.points[i].x, polygon.points[i].y);
		    }

		    currentPanelOverlay.closePath().strokePath();
	      	currentPanelOverlay.setScale(this.cutsceneContainer._scaleX,this.cutsceneContainer._scaleY);

			let mask = currentPanelOverlay.createGeometryMask();
			this.currentPanelX = panelx - (1280 / 2) - this.panelBoundsX;
			this.currentPanelY = panely - (720 / 2) - this.panelBoundsY;
			this.currentPanel = this.add
				.container(this.currentPanelX, this.currentPanelY)
				.setName('panel_'+panelnum)

			//scale container based on needs
			this.currentPanel.scale = this.scale;
			this.currentPanel.originalX = panelx;
			this.currentPanel.originalY = panely;
			this.cutsceneContainer.add(this.currentPanel);
			this.cutsceneOverlays.add(currentPanelOverlay);

			let currentBackground = this.add.image(0, 0, background).setOrigin(0,0);

			this.currentPanel.setMask(mask);
			this.currentPanel.add(currentBackground);
			this.currentPanel.setDepth(this.currentPanel.depth + panelnum);

			//////////////// Add characters ////////////////
			characters.forEach((object, index) => {
				const currentCharacterName = object.character;
				const currentCharacterEmotion = object.emotion;
				const currentCharacterAnimation = object.animation;
				const currentCharacterDirection = object.direction;
				if (this.currentPanel.getByName(currentCharacterName) == undefined){
					//set the position of the character
					let isOnFloor = (object.onFloor == true) ? "onFloor" : "treeTops";
					let characterPositionX = (object.x != undefined) ? (this.locationData.positions.x[object.x]) : this.currentPanel.x;
					let characterPositionY = (object.y != undefined) ? (this.locationData.positions.y.object[isOnFloor][object.y]) : this.locationData.positions.y.object["default"];
			
					//add characters
					this.currentCharacter = new CutsceneCharacter(this, characterPositionX, characterPositionY, null, currentCharacterName, 'cutscene');
					this.currentCharacter.setName(currentCharacterName);
					this.currentPanel.add(this.currentCharacter);
				}
			});
		}

	}

	drawPage(page,pagenum){
		const camera = this.cameras.main;
	    if (this.cutsceneContainer.getByName('page_'+pagenum) == undefined){
	    	let currentPage = this.add
		      .rectangle(0, 0,
		        this.cutsceneContainer.width,
	        	this.cutsceneContainer.height,
		        0x00ff00,
		        .5
		      )
		      .setStrokeStyle(2, 0xff0000, 1)
		      //.setScrollFactor(0)
		      .setName('page_'+pagenum);
		
			this.cutsceneContainer.add(currentPage);
		}
	}

	cutsceneLoop(){
		if (this.chatData.length > 0){
			let page = this.chatData[this.pagenum];

			if (page != undefined){
				this.drawPage(page,this.pagenum);
				let panel = page['panels'][this.panelnum];
				if (panel != undefined){
					let dialogue = panel.dialogue[this.dialoguenum];
					this.drawPanel(panel,this.panelnum,dialogue);

					if (dialogue != undefined){
						this.drawDialogue(dialogue,this.panelnum);
						this.dialoguenum++;
					} else {
						this.dialoguenum = 0;
						this.panelnum++;

						if (this.screenWidth <= 740 || this.screenHeight <= 740){
							this.cutsceneDialogueContainer.clear(false,true);
						}
					}
				} else {
					this.dialoguenum = 0;
					this.panelnum = 0;
					this.pagenum++;
					if (this.chatData[this.pagenum]){
						this.clearPage();
					} else {
						this.mainScene.endCutscene();
					}
				}
				return;
			} else {
				this.mainScene.endCutscene();
			}
		} else {
			this.mainScene.endCutscene();
		}
	}

	waitForClickCutscene(){
	    this.input.on('pointerdown', this.cutsceneLoop, this);
	}

	disableClickCutscene(){
	    this.input.removeListener('pointerdown', this.cutsceneLoop, this);
	}

	//Clear the cutscene of panels and objects
	clearPage(){
		this.cutsceneContainer.removeAll(true);
		this.cutsceneOverlays.clear(false,true);
		this.cutsceneDialogueContainer.clear(false,true);
	}

	closest(num, dialogueArr) {
	    return dialogueArr.reduce((a, b) => {
	        let aDiff = Math.abs(a - num);
	        let bDiff = Math.abs(b - num);

	        if (aDiff == bDiff) {
	            return a > b ? a : b;
	        } else {
	            return bDiff < aDiff ? b : a;
	        }
	    });
	}

	update(){
		//update speechbubble based on position.
		/*const coordinate = this.currentCharacter.getTopLeft();
		let currentSpeechbubbleX = (this.currentPanel.originalX + this.currentCharacter.x * this.scale) - this.panelBoundsX;
		let currentSpeechbubbleY = (this.currentPanel.originalY + coordinate.y * this.scale) - this.panelBoundsY;

		let speechBubbleX = this.closest(currentSpeechbubbleX, this.dialogueDataX)
		let speechBubbleY = this.closest(currentSpeechbubbleY, this.dialogueDataY)

		if (this.currentSpeechbubble != null){
			this.currentSpeechbubble.update(speechBubbleX,speechBubbleY);
		}*/
	}
}
