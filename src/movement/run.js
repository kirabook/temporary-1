export default class RunState {

	constructor(player) {
		this.player = player;
	}

	enter() {
		const direction = this.player.orientation;
		const speed = 800;
		
		this.player.currentAnimation = 'run';
		this.player.play(this.player.name+'-'+direction+'-run');

		switch(direction){
			case 'left': 
				this.player.flipX = true;
				this.player.setVelocityX(-speed);
				break;
			case 'right':
				this.player.flipX = false;
				this.player.setVelocityX(speed);
				break;
		}
	}
}