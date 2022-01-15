export default class WalkState {

	constructor(player) {
		this.player = player;
	}

	enter() {
		const direction = this.player.orientation;
		const speed = 500;

		this.player.currentAnimation = 'walk';
		this.player.play(this.player.name+'-'+direction+'-walk');

		switch(direction){
			case 'right':
				this.player.flipX = false;
				this.player.setVelocityX(speed);
				break;
			case 'left': 
				this.player.flipX = true;
				this.player.setVelocityX(-speed);
				break;
		}
	}
}