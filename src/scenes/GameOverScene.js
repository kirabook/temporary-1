
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */

import button_ui from "../ui/button_ui";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.viewport = this.rexUI.viewport;
    
    const camera = this.cameras.main;
    const screenCenter = camera.width / 2;
    const width = camera.width;
    const height = camera.height;

    this.logo = this.add.image(screenCenter, camera.height / 4, "shinachikukosenlogo");
    //this.logo = this.add.image(342, 35, 'logo').setOrigin(0, 0);
    //this.logo.scale = 0.5;

    this.title = this.add.text(0, 0, 'Game Over', { fontSize: '40px', fill: '#fff' });
    this.zone = this.add.zone(camera.width / 2, camera.height / 2, camera.width, camera.height);

    Phaser.Display.Align.In.Center(this.title, this.zone);

    this.title.displayOriginY = 50;

    this.menuButton = new button_ui(this, screenCenter, camera.height / 2, 'Menu', 'primary', 'MainMenu').layout();


    console.log(this)
    console.log(this.menuButton)
  }
}