export default class Preloader extends Phaser.Scene {

  preload(){
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    //create a background and prepare loading bar
    this.fullBar = this.add.graphics();
    this.fullBar.fillStyle(0xdddddd, 1);
    this.fullBar.fillRect((width / 4)-2,(height /2) - 28, (width / 2) + 4, 30);
    this.progress = this.add.graphics();

    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '14px Arial',
        fill: '#dddddd'
      }
    });
    this.loadingText.setOrigin(0.5, 0.5);

    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 13,
      text: '0%',
      style: {
        font: '14px Arial',
        fill: '#dddddd'
      }
    });
    this.percentText.setOrigin(0.5, 0.5);

    this.assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 24,
      text: '',
      style: {
        font: '14px Arial',
        fill: '#dddddd'
      }
    });
    this.assetText.setOrigin(0.5, 0.5);

    //pass loading progress as value to loading bar and redraw as files load
    this.load.on('progress', function (value) {
      this.percentText.setText(parseInt(value * 100) + '%');
      this.progress.clear();
      this.progress.fillStyle(0x333333, 1);
      this.progress.fillRect((width / 4), (height /2) - 26, (width / 2) * value, 26);
    }, this);

    this.load.on('fileprogress', function (file) {
      this.assetText.setText(file.key);
    }, this);

    //cleanup our graphics on complete
    this.load.on('complete', function () {
      this.progress.destroy();
      this.fullBar.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
      this.assetText.destroy();
      this.scene.start('MainMenu');
      this.scene.start('CommonMenu');
    }, this);


    //########## Global Assets ############//
    this.load.pack('common_assets', 'src/loaders/common_assets.json');
    this.load.pack('skill_icons', 'src/loaders/skill_icons.json');
    this.load.bitmapFont('standard-0753', 'src/assets/fonts/standard-0753/standard-0753.png', 'src/assets/fonts/standard-0753/standard-0753.xml');

    //########## Characters ############//
    this.load.spritesheet('haruno_sakura', 'src/assets/characters/haruno_sakura.png', { frameWidth: 300, frameHeight: 450 });
    this.load.spritesheet('uzumaki_shinachiku', 'src/assets/characters/uzumaki_shinachiku.png', { frameWidth: 300, frameHeight: 390 });
    this.load.spritesheet('uzumaki_hanami', 'src/assets/characters/uzumaki_hanami.png', { frameWidth: 300, frameHeight: 390 });
    this.load.spritesheet('uzumaki_arashi', 'src/assets/characters/uzumaki_arashi.png', { frameWidth: 300, frameHeight: 390 });
    this.load.spritesheet('uzumaki_naruto', 'src/assets/characters/uzumaki_naruto.png', { frameWidth: 300, frameHeight: 450 });
    this.load.spritesheet('oldman', 'src/assets/characters/oldman.png', { frameWidth: 300, frameHeight: 450 });
    this.load.spritesheet('oldwoman', 'src/assets/characters/oldwoman.png', { frameWidth: 300, frameHeight: 450 });
    this.load.spritesheet('youngman', 'src/assets/characters/youngman.png', { frameWidth: 300, frameHeight: 390 });
    this.load.spritesheet('youngwoman', 'src/assets/characters/youngwoman.png', { frameWidth: 300, frameHeight: 390 });

    this.load.spritesheet('stair_graphic', 'src/assets/sprites/stair_graphic.png', { frameWidth: 400, frameHeight: 400 });
    this.load.spritesheet('door_placeholder', 'src/assets/sprites/door_placeholder.png', { frameWidth: 215, frameHeight: 340 });
    this.load.spritesheet('test_object', 'src/assets/sprites/test_object.png', { frameWidth: 96, frameHeight: 96 });

  }
}
