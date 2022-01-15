import Speechbubble from "../ui/speechbubble";

export default class Chat {

	 constructor(scene) {
	    this.scene = scene;

	    // Create the speech bubble
	    this.speechBubble = new Speechbubble(this.scene);
	    this.speechBubble.setDepth(this.scene.map.heightInPixels + 20);
	}

	keepChatting(){
		// Remove input listener of previous chat
		this.scene.input.off('pointerdown', this.keepChatting);
		this.scene.input.keyboard.off('keydown_ENTER', this.keepChatting);

		// Hide the text
		this.speechBubble.setVisible(false);

		if (this.scene.chatData.length > 0){
			let step = this.scene.chatData[this.scene.chatnum];

			switch(step.type){
				case 'question':
					this.scene.npcs.getChildren().forEach((object, index) => {
						if (object.name == step.character){

							const coordinate = object.getTopLeft();
							const answers = step.answers;

							this.speechBubble.update(coordinate.x - (object.width / 2), coordinate.y, step.text, step.character, answers, object);

							this.speechBubble.setVisible(true);
							this.scene.chatnum++;
							
							return;
						}
					});
				break;
				case 'dialogue':
					// we search for the character with the corresponding name
		    		this.speechBubble.resetText();
					this.scene.npcs.getChildren().forEach((object, index) => {
						if (object.name == step.character){
							const coordinate = object.getTopLeft();

							this.speechBubble.update(coordinate.x - (object.width / 2), coordinate.y, step.text, step.character);

							this.speechBubble.setVisible(true);
							this.scene.chatnum++;
							this.waitForClick();

							return;
						}
					});

					if (this.scene.player.name == step.character){
						const coordinate = this.scene.player.getTopLeft();

						this.speechBubble.update(coordinate.x - (this.scene.player.width / 2), coordinate.y, step.text, step.character);

						this.speechBubble.setVisible(true);
						this.scene.chatnum++;
						this.waitForClick();

						return;
					}
				break;
				case 'end':
					// end of the conversation
					this.scene.endChat();
				break;
				default:
				break;

			}
		} else {
			// end of the conversation
			this.scene.endChat();
		}
	}

	// Wait for the click to display the next chat
	waitForClick(){
	    this.scene.input.once('pointerdown', this.keepChatting, this);
	    this.scene.input.keyboard.once('keydown_ENTER', this.keepChatting, this);
	}
}