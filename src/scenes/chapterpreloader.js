export default class ChapterPreloader extends Phaser.Scene {

  constructor() {
      super('ChapterPreloader');
  }

  preload(data) {  
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;  

    this.selectedChapter = this.registry.get('chapter') || 0;
    this.selectedAct = this.registry.get('act') || 0;

    this.load.json("chapter_"+this.selectedChapter,'src/chapters/chapter_'+this.selectedChapter+'.json');
    this.load.pack('chapter_'+this.selectedChapter+'_pack', 'src/loaders/chapter_'+this.selectedChapter+'_pack.json');

    //create a background and prepare loading bar
    this.fullBar = this.add.graphics();
    this.fullBar.fillStyle(0xdddddd, 1);
    this.fullBar.fillRect((width / 4)-2,(height /2) - 28, (width / 2) + 4, 30);
    this.progress = this.add.graphics();

    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "chapter_"+this.selectedChapter,
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

      //chapter data
      this.chapterData = this.cache.json.get('chapter_'+this.selectedChapter);
      this.actData = this.chapterData.acts[this.selectedAct];

      for (const [key, value] of Object.entries(this.actData)) {
        typeof(value) === 'object' ? this.registry.set(`${key}`, value) : this.registry.set(`${key}`, `${value}`);
      }

      //set act information
      this.startMap = this.registry.get('startMap');
      this.weather = this.registry.get('weather');

      this.scene.start('Game', {"chapter":this.selectedChapter,"act":this.selectedAct,"mapName":this.startMap,"weather":this.weather});
      this.scene.launch('CommonUI');
      this.scene.launch('BattleUI');
      
    }, this);

  }
}