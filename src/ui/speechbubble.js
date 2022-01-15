import button_ui from "../ui/button_ui";

export default class Speechbubble {
	//to do: implement different color options
	constructor(scene) {
	    this.scene = scene;
	    this.fontStyleChara = { fontFamily: 'Arial', fontSize: this.scene.characterFontSize, color: '#000000', align: 'left' };
	    this.answers = scene.add.group();

		this.bubbleContainer = scene.rexUI.add.sizer({
            x: 0, y: 0,
            orientation: 'y'
        })
            //.addBackground( scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0, 0x4e342e, 0.5) )
            .add(
                this.createBubble(),// child
                1,                           // proportion, fixed width
                'center',                     // align vertically
                0,
                false,
                'content'
            )
            .add(
                this.createBubbleTail(),// child
                1,                           // proportion, fixed width
                'center',                     // align vertically
                {left: -100, top: -2},
                false,
                'bubbleTail'
            )
            .add(
                this.createAnswers(),// child
                1,                           // proportion, fixed width
                'center',                     // align vertically
                0,
                false,
                'answers'
            )


	    this.setVisible(false);
  	}

  	createBubble(){
  		this.bubbleBackground = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 0xffffff).setStrokeStyle(1, 0x565656);
	    this.characterName = this.scene.add.text(0, 0, '', this.fontStyleChara).setStroke('#FFFFFF', 5);
	    this.content = this.scene.add.text(0, 0, '', this.scene.textStyle).setWordWrapWidth(240);
	    this.bubbleContent = this.scene.rexUI.add.overlapSizer({
	    	x: 0, y: 0,
	    	anchor: 'center'
	    })
            .addBackground(
                this.bubbleBackground
            )
            .add(
                this.characterName, // child
                'characterName', // key
                'left-top', // align
                {top: -10, left: 10, right: 30}, // padding
                false // expand
            )
            .add(
                this.content, // child
                'content', // key
                'center', // align
                {top: 20, bottom: 20, right: 30, left: 30}, // padding
                false // expand
            )            
            .layout()

	    return this.bubbleContent;
  	}

  	createBubbleTail(){
	    this.bubbleTail = this.scene.add.triangle(0, 0, 40, 0, 40, 20, 20, 0, 0xffffff).setStrokeStyle(1, 0x565656, 0);
	    return this.bubbleTail;
  	}

  	createAnswers(text, characterName, question, object){
  		this.bubbleAnswers = this.scene.rexUI.add.sizer({
	    	x: 0, y: 0,
	    	anchor: 'center',
            orientation: 'x'
	    })   
	    .layout()

	    return this.bubbleAnswers;
  	}

	update(x, y, text, characterName, question, object){

		//this.createAnswers(text, characterName, question, object);

		if (question != null){
			question.forEach((question, index) => {
				var text = new button_ui(this.scene, 0, 0, question.text, 'primary');
				console.log(question.text);
		    	//text.setInteractive({ useHandCursor: true });

		    	if (question.chat != null){
		    		//start a chat with a different key
		    		//text.on('pointerdown', () => this.scene.talk.loadChat(object, question.chat));
		    		text.on('pointerdown', () => this.scene.startChat({'object':object,'trigger':question.chat}));
		    	} else if (question.cutscene != null){
		    		//start a cutscene
		    		//text.on('pointerdown', () => this.scene.talk.loadCutscene(question.cutscene));
		    		text.on('pointerdown', () => this.scene.startCutscene({'object':object,'trigger':question.cutscene}));
		    	} else {
		    		//continue the chat on the current key
		    		text.on('pointerdown', () => this.scene.chat.waitForClick());
		    	}
		    	
		    	this.bubbleAnswers.add(text, 1, 'center', {top: 5, left: 5, right: 5, bottom: 5}, false, 'answer_'+index)
		    	//this.answers.add(text);
			});

			this.bubbleAnswers.layout();
		}

		// Change the content and draw the speech bubble
		characterName = characterName.replaceAll('_', ' ');
		characterName = characterName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

		this.characterName.setText(characterName);
		this.content.setText(text);
		this.bubbleContent.layout();
		this.bubbleContainer.layout();

		this.bubbleContainer.x = x;
		//this.bubbleContainer.y = y;
		this.bubbleContainer.y = y - this.bubbleContainer.height / 3;



	   	/* this.scene.tweens.add({
	        targets: this.bubbleBackground,
	        y: this.bubbleBackground.y + 3,
	        duration: 3000,
	        ease: 'Sine.easeInOut',
	        yoyo: true,
	        repeat: -1
	    });
	    
	    this.scene.tweens.add({
	        targets: this.bubbleTail,
	        y: this.bubbleTail.y + 3,
	        duration: 3000,
	        ease: 'Sine.easeInOut',
	        yoyo: true,
	        repeat: -1
	    }); */
	}

	setVisible(value){
		this.bubbleContainer.setVisible(value);
		this.characterName.setVisible(value);
		this.content.setVisible(value);
		this.answers.setVisible(value);
	}

	setDepth(depth){
		this.bubbleContainer.setDepth(depth);
		this.characterName.setDepth(depth + 1);
		this.content.setDepth(depth + 2);
		this.answers.setDepth(depth + 3);
	}

	resetText(){
		this.bubbleAnswers.clear(true);
	}
}
