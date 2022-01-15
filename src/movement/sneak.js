export default class SneakState {

	constructor(player)	{
		this.player = player;
	}

	enter()	{
		const direction = this.player.orientation;
		const speed = 200;

		this.player.currentAnimation = 'sneak';
		this.player.play(this.player.name+'-'+direction+'-sneak');

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