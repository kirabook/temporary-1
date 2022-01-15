export default class UpState {
	
	constructor(player)	{
		this.player = player;
	}

	enter()	{
		const direction = this.player.orientation;
		const speed = 1000;

		this.player.currentAnimation = 'up';
		this.player.play(this.player.name+'-'+direction+'-up');
		this.player.setVelocityY(-(speed * 2));
	}
}