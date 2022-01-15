export default class CutsceneSpeechbubble extends Phaser.GameObjects.GameObject {
	//to do: implement different color options
	constructor(scene, x, y, characterName, quote, question, object, panel) {
		super(scene, 'speechbubble')

	    // Create variables
	    this.scene = scene;
	    this.bubbleWidth;
	    this.bubbleHeight;
	    this.arrowHeight = 20;
	    this.bubblePadding = 10;

	    this.textColor = "#000000";
	    this.textStrokeColor = "#FFFFFF";
	    this.bubbleColor = 0xffffff;
	    this.bubbleStrokeColor = 0x565656;
		
		// Create visible elements
	    this.bubble = this.scene.add.graphics().setName('speechbubble');
	    this.answers = this.scene.add.group().setName('answers');
	    this.currentCharacterName = this.scene.add.text(0, 0, characterName, { fontFamily: 'Arial', fontSize: 16, color: this.textColor, align: 'left' });
	    this.content = this.scene.add.text(0, 0, quote, { fontFamily: 'Arial', fontSize: 20, color: this.textColor, align: 'center' });

	    this.currentCharacterName.setStroke(this.textStrokeColor, 10);

	    //Adding bubble elements to the cutsceneDialogueContainer group so that it will be cleaned up when a page turns
	    this.scene.cutsceneDialogueContainer.add(this.bubble).add(this.answers).add(this.currentCharacterName).add(this.content);

	    // The width depends on the quote length
		if (quote.length < 10 && this.currentCharacterName.length < 10){
			this.content.setWordWrapWidth();
			this.bubbleWidth = (100) + ( this.bubblePadding );
		} else {
			this.content.setWordWrapWidth(100);
			this.bubbleWidth = (125) + ( this.bubblePadding );
		}

		if (question != null){
			question.forEach((question, index) => {
				const text = this.scene.add.text(0, 0, question.text, { fontFamily: 'Arial', fontSize: 20, color: this.textColor, align: 'center' });
		    	text.setInteractive({ useHandCursor: true });

		    	if (question.chat != null){
		    		//chat a chat with a different key
		    		//text.on('pointerdown', () => this.scene.talk.loadChat(object, question.chat));
		    		text.on('pointerdown', () => this.scene.chat.startChat({'object':object,'trigger':question.chat}));
		    	} else if (question.cutscene != null){
		    		//chat a cutscene
		    		//text.on('pointerdown', () => this.scene.talk.loadCutscene(object, question.cutscene));
		    		text.on('pointerdown', () => this.scene.chat.startCutscene({'object':object,'trigger':question.cutscene}));
		    	} else {
		    		//continue the chat on the current key
		    		text.on('pointerdown', () => this.scene.chat.waitForClick());
		    	}
		    	
		    	this.answers.add(text);
			});
		}

		// Change the content and draw the speech bubble
		characterName = characterName.replaceAll('_', ' ');
		characterName = characterName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

		this.currentCharacterName.setText(characterName);
		this.content.setText(quote);
		this.drawBubble();

		// Set the position
		var b = this.content.getBounds();

		this.bubble.x = x - Math.floor(this.bubbleWidth / 7);
		this.bubble.y = y - Math.floor(this.bubbleHeight + this.arrowHeight);

		this.currentCharacterName.setPosition(this.bubble.x - 20, this.bubble.y - 16);
		this.content.setPosition(Math.floor(this.bubble.x + (this.bubbleWidth / 2) - (b.width / 2)), Math.floor(this.bubble.y + (this.bubbleHeight / 2) - (b.height / 2)));

		if (question != null){
			this.answers.getChildren().forEach((answer, index) => {
				answer.setPosition(this.bubble.x, Math.floor(this.bubble.y + (this.bubbleHeight / 2) - (b.height / 2)) + this.bubbleHeight + (20 * index));
			});
		}
  	}

	update(x, y){
		var b = this.content.getBounds();

		this.bubble.x = x - Math.floor(this.bubbleWidth / 7);
		this.bubble.y = y - Math.floor(this.bubbleHeight + this.arrowHeight);

		this.currentCharacterName.setPosition(this.bubble.x - 20, this.bubble.y - 16);
		this.content.setPosition(Math.floor(this.bubble.x + (this.bubbleWidth / 2) - (b.width / 2)), Math.floor(this.bubble.y + (this.bubbleHeight / 2) - (b.height / 2)));
	}

	drawBubble(){
		// Roundrectangle shape here: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shape-roundrectangle/
		const color = new Phaser.Display.Color();
		color.random(50);


		var b = this.content.getBounds();
		this.bubbleHeight = b.height + (3 * this.bubblePadding);

		this.bubble.clear();

		//  Bubble shadow
		//this.bubble.fillStyle(0x222222, 0.5);
		//this.bubble.fillRoundedRect(6, 6, this.bubbleWidth, this.bubbleHeight, 30);

		//  Bubble color
		//this.bubble.fillStyle(this.bubbleColor, 1);
		this.bubble.fillStyle(color.color, 1);

		//  Bubble outline line style
		this.bubble.lineStyle(2, this.bubbleStrokeColor, 1);

		//  Bubble shape and outline
		this.bubble.strokeRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 30);
		this.bubble.fillRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 30);

		//  Calculate arrow coordinates
		var point1X = Math.floor(this.bubbleWidth / 3);
		var point1Y = this.bubbleHeight;
		var point2X = Math.floor((this.bubbleWidth / 4) * 2);
		var point2Y = this.bubbleHeight;
		var point3X = Math.floor(this.bubbleWidth / 3);
		var point3Y = Math.floor(this.bubbleHeight + this.arrowHeight);

		//  Bubble arrow shadow
		//this.bubble.lineStyle(4, 0x222222, 0.5);
		//this.bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

		//  Bubble arrow fill
		this.bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
		this.bubble.lineStyle(2, this.bubbleStrokeColor, 1);
		this.bubble.lineBetween(point2X, point2Y, point3X, point3Y);
		this.bubble.lineBetween(point1X, point1Y, point3X, point3Y);
	}
}
