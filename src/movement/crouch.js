export default class CrouchState {

	constructor(player)	{
		this.player = player;
	}

	enter()	{
		const direction = this.player.orientation;
		const speed = 0;

		this.player.currentAnimation = 'crouch';
		this.player.play(this.player.name+'-'+direction+'-crouch');

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