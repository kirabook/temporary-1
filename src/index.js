import Phaser from "phaser";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin.js';
import { PhaserNavMeshPlugin } from "phaser-navmesh";
//import { PhaserNavMeshPlugin } from "../phaser-navmesh-plugin";
import Preloader from "./scenes/preloader";
import ChapterPreloader from "./scenes/chapterpreloader";
import MainMenu from "./scenes/mainmenu";
import { Game } from "./scenes/game";
import Cutscene from "./ui/cutscene";
import CommonUI from "./ui/common_ui";
import BattleUI from "./ui/battle_ui";
import CommonMenu from "./ui/common_menus";
import GameOverScene from './scenes/GameOverScene';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
let SCALE_MODE = 'SMOOTH' // FIT OR SMOOTH

let config = {
  type: Phaser.AUTO,
  backgroundColor: '#333333',
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.NONE,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [ 
    Preloader,
    CommonMenu,
    MainMenu,
    ChapterPreloader,
    Game,
    Cutscene,
    CommonUI,
    BattleUI,
    GameOverScene
  ],
  render: {
    pixelArt: false
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 2600 },
      fps: 60
    }
  },
  plugins: {
    scene: [{
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI'
    },
    { 
      key: "NavMeshPlugin", 
      plugin: PhaserNavMeshPlugin, 
      mapping: "navMeshPlugin", 
      start: true 
    }],
    global: [{
      key: 'rexVirtualJoystick',
      plugin: VirtualJoystickPlugin,
      start: true
    }]
  },
  dom: {
      createContainer: true
  }
};

var styles = `
html, body { 
    background-color: #333333;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}`;

var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const resize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;
  let maxWidth = MAX_WIDTH;
  let maxHeight = MAX_HEIGHT;
  let scaleMode = SCALE_MODE;

  let scale = Math.min(w / width, h / height);
  let newWidth = Math.min(w / scale, maxWidth);
  let newHeight = Math.min(h / scale, maxHeight);

  let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT;
  let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT;
  let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT;

  // smooth scaling
  let smooth = 1
  if (scaleMode === 'SMOOTH') {
    const maxSmoothScale = 1.15
    const normalize = (value, min, max) => {
      return (value - min) / (max - min)
    }
    if (width / height < w / h) {
      smooth =
        -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
    } else {
      smooth =
        -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
    }
  }

  // center the game with css margin
  game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`;
  game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`;

  // resize the game
  game.canvas.style.width = newWidth * scale + 'px';
  game.canvas.style.height = newHeight * scale + 'px';
  game.scale.resize(newWidth * smooth, newHeight * smooth);

}

window.addEventListener('load', () => {
  window.game = new Phaser.Game(config); 
    window.addEventListener('resize', event => {
      console.log('resize event');
      resize();
    });
  console.log('resize at start');
  resize();
});