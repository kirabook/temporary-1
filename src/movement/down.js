export default class DownState {

	constructor(player)	{
		this.player = player;
	}

	enter()	{
		const direction = this.player.orientation;
		const speed = (this.player.body.onFloor()) ? 0 : 1000;

		this.player.currentAnimation = 'down';
		this.player.play(this.player.name+'-'+direction+'-down');
		this.player.setVelocityY(speed);
	}
}