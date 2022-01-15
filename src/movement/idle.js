export default class IdleState {

	constructor(player)	{
		this.player = player;
	}

	enter()	{
		const direction = this.player.orientation;
		this.player.currentAnimation = 'idle';

		this.player.play(this.player.name+'-'+direction+'-idle');
		this.player.setVelocityX(0);
	}
}