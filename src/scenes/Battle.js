/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */

import { Hero, Enemy } from '../objects/battleCharacterEntities';
import { Inventory, Slot, Item } from '../objects/inventory';
import { getElement, setInner, addToClass, removeToClass } from '../dom/elementsHander';
import { getPercentageChance, getPercentage } from '../dom/globalFunctions';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    const camera = this.cameras.main;
    this.viewport = this.rexUI.viewport;
    this.mainScene = this.scene.get('Game');
    this.battleUI = this.scene.get('BattleUI');
    this.commonUIScene = this.scene.get('CommonUI');
    this.commonMenu = this.scene.get('CommonMenu');

    this.dataEnemy = data.enemy;
    this.playerY = data.y;

    this.chapter = this.registry.get('chapter');
    this.chapterData = this.cache.json.get('chapter_'+this.chapter);
    this.locationsData = this.cache.json.get('locations');
    this.abilitiesData = this.registry.get('abilitiesData');

    this.mapName = this.registry.get('mapName');
    this.battlesObject = this.chapterData.battles[data.battle];
    this.battleMode = this.battlesObject.mode;
    this.battleLocation = this.battlesObject.location ? this.battlesObject.location : this.mapName;

    this.turnCount = 0;
    this.activeTeam = 'hero';
    this.activeCharacter = '';
    this.heroes = [];
    this.enemies = [];
  }

  create() {
    var scene = this;

    this.battleBackground = this.add.image(0, 0, this.battleLocation).setOrigin(0,0);
    this.battleBackground.setPosition(0, this.viewport.y + this.viewport.height - this.battleBackground.height);

    this.leftCharacterStage = this.rexUI.add.overlapSizer({ orientation: 'x' });
    this.rightCharacterStage = this.rexUI.add.overlapSizer({ orientation: 'x' });

    this.battleStage = this.rexUI.add.sizer({
      x: this.viewport.centerX, y: this.viewport.height - 400,
      width: this.viewport.width - 64, height: 600,
      orientation: 'x',
      anchor: 'top',
      expand: false
    })
      .add( this.leftCharacterStage, 2, 'left', 0, false, 'battle_stage_left' )
      .add( this.rexUI.add.roundRectangle(250, 100, 100, 100, 30, undefined), 0.5, 'battle_stage_center', 0, true, '' )
      .add( this.rightCharacterStage, 2, 'right', 0, false, 'battle_stage_right' )
      .layout()
      .drawBounds(this.add.graphics(), 0xffff00);

    this.startBattle(this, this.dataEnemy);

    // on wake event we call startBattle too
    this.sys.events.on('wake', this.startBattle, this);
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
        scene.uiResize(scene);
    });
  }

  uiResize(scene){
    this.viewport = this.rexUI.viewport;
    this.battleBackground.setPosition(0, this.viewport.y + this.viewport.height - this.battleBackground.height);

    scene.battleStage.setMinSize(this.viewport.width - 64, 600);
    scene.battleStage.setPosition(this.viewport.centerX, this.viewport.height - 400);
    scene.battleStage.layout();
  }

  startBattle(scene, data) {
    var oppositeSide;
    const characterListHero = this.battlesObject['left'].characters;
    const characterListEnemy = this.battlesObject['right'].characters;

    characterListHero.forEach(function(character, index) {

      var characterLevel = character.level ? character.level : 0;
      var character = new Hero(scene, 0, 0, null, character.name, 'battle', null, null, character.hp, character.chakra, null, character.strenth, character.defense, character.speed, characterLevel);
      character.battleSide - 'left';
      oppositeSide = 'right';
      character.loadAbilities();
      character.playAnimation(character.name, 'left', 'idle');

      scene.heroes.push(character);
      scene.add.existing(character);
      scene.leftCharacterStage.add( character, character.name, oppositeSide+'-bottom', { right: 150 * index }, false );
    });

    characterListEnemy.forEach(function(character, index) {

      var characterLevel = character.level ? character.level : 0;
      var character = new Enemy(scene, 0, 0, null, character.name, 'battle', null, null, character.hp, character.chakra, null, character.strenth, character.defense, character.speed, characterLevel);
      character.battleSide = 'right';
      oppositeSide = 'left';
      character.loadAbilities();
      character.playAnimation(character.name, 'right', 'idle');

      scene.enemies.push(character);
      scene.add.existing(character);
      scene.rightCharacterStage.add( character, character.name, oppositeSide+'-bottom', { left: 150 * index }, false );
    });

    this.battleStage.layout();
    this.units = this.heroes.concat(this.enemies);
    this.index = -1;

    //this runs the create menu in the ui for all the huds and stuff
    this.battleUI.createMenu();

  }

  nextTurn() {
    const battleStatus = this.checkEndBattle();

    if (battleStatus.result === 'victory') {
      this.mainScene.endBattle(battleStatus);
      this.turnCount = 0;
      return;
    }

    if (battleStatus.result === 'gameOver') {
      this.mainScene.endBattle(battleStatus);
      this.turnCount = 0;
      return;
    }

    do {
      this.index += 1;
      // if there are no more units, we start again from the first one
      if (this.index >= this.units.length) {
        this.index = 0;
      }
    } while (!this.units[this.index].living);

    // if its player hero
    if (this.units[this.index] instanceof Hero) {
      //this.events.emit('PlayerSelect', this.index);
      this.battleUI.events.emit('PlayerSelect', 'heroMenu', this.index);

     if (this.activeTeam == 'enemy'){
      this.turnCount++;
      this.activeTeam = 'hero';
      console.log(this.turnCount);
     }
    } else {
      //pick random hero
      var r;
      var r2;
      var rankR = getPercentageChance(100);

      do {
        r = Math.floor(Math.random() * this.heroes.length);
      } while (!this.heroes[r].living);

      do {
        r2 = Math.floor(Math.random() * this.enemies.length);
      } while (!this.enemies[r2].living && this.units[this.index] == this.enemies[r2]);

      // call the enemy's attack function
      var enemyAlly = this.enemies[r2];
      var enemyAction = this.checkCharacterStatus(this.units[this.index], enemyAlly);
      var enemyAbilityList = this.units[this.index].jutsuList;
      var enemyTarget = enemyAction.target == 'ally' ? r2 : r;

      var chosenAbility = this.checkAbility(this.units[this.index], enemyAction, enemyAbilityList);

      console.log(enemyAction);
      console.log(chosenAbility);

      if (this.activeTeam == 'hero'){
        this.turnCount++;
        this.activeTeam = 'enemy';
        console.log(this.turnCount);
      }

      this.receivePlayerSelection(chosenAbility, r);

     // add timer for the next turn, so will have smooth gameplay
     //this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });

    }
  }

  checkCharacterStatus(character, ally){
    var actionChance = getPercentageChance(100);
    var characterHP = getPercentage(character.originalHP, character.hp);
    var characterChakra = getPercentage(character.originalCP, character.chakra);
    var allyHP = getPercentage(character.originalHP, character.hp);

    if (character.debuffed && actionChance > 50) return { type: 'buff', subtype: 'cure', target: 'self' };
    if (ally.debuffed && actionChance > 50) return { type: 'buff', subtype: 'cure', target: 'ally' };

    if (characterHP <= .25 && !character.buffed && actionChance > 50) return { type: 'buff', subtype: 'heal', target: 'self' };
    if (allyHP <= .25 && !ally.buffed && actionChance > 50) return { type: 'buff', subtype: 'heal', target: 'ally' };

    if (characterHP <= .33 && !character.buffed && actionChance > 50) return { type: 'buff', subtype: 'selfbuff', target: 'self' };

    return { type: 'attack', target: 'enemy' };
  }

  checkAbility(character, enemyAction, enemyAbilityList){
    var chance = getPercentageChance(100);
    var originalHP = character.originalHP;
    var characterHP = 1 - ((originalHP - character.hp) / originalHP);
    var rankList = this.battleMode == 'boss' ? ['SS','S','A','B','C','D','E'] : ['A','B','C','D','E'];
    var abilityList = {'attack':[],'buff':[],'defend':[]};

    var ability;
    var abilityRank;
    var i = 0;

    for (const key in enemyAbilityList) {
      for (const key2 in enemyAbilityList[key]) {
        abilityList[enemyAbilityList[key][key2].type].push(enemyAbilityList[key][key2]);
      }
    }

    if (enemyAction.type == 'buff' && enemyAction.subtype == 'cure'){
      do {
        ability = abilityList['buff'][i]; abilityRank = ability.rank; i++;
      } while (ability.subtype != 'cure' && i < abilityList['buff'].length && !rankList.includes(abilityRank));
    } else if (enemyAction.type == 'buff' && enemyAction.subtype == 'heal') {
      do {
        ability = abilityList['buff'][i]; abilityRank = ability.rank; i++;
      } while (ability.subtype != 'heal' && i < abilityList['buff'].length && !rankList.includes(abilityRank));
    } else if (enemyAction.type == 'buff' && enemyAction.subtype == 'selfbuff') {
      do {
        ability = abilityList['buff'][i]; abilityRank = ability.rank; i++;
      } while (ability.subtype != 'selfbuff' && i < abilityList['buff'].length && !rankList.includes(abilityRank));
    } else {
      var type = chance > 25 ? 'attack' : abilityList['debuff'] ? 'debuff' : 'attack';
      do {
        ability = abilityList[type][i]; abilityRank = ability.rank; i++;
      } while (i < abilityList[type].length && !rankList.includes(abilityRank));
    }

    if (ability != undefined) { return ability } else { ability = abilityList[type][0]; return ability; }
  }

  checkEndBattle() {
    let victory = true;
    // if all enemies are dead we have victory
    for (let i = 0; i < this.enemies.length; i += 1) {
      if (this.enemies[i].living) victory = false;
    }

    let gameOver = true;
    // if all heroes are dead we have game over
    for (let i = 0; i < this.heroes.length; i += 1) {
      if (this.heroes[i].living) gameOver = false;
    }

    if (victory) return { result: 'victory' };
    if (gameOver) return { result: 'gameOver' };

    return victory || gameOver;
  }

  //future note, remove action and replace with data
  receivePlayerSelection(data, target) {

    //determine which team should be targeted
    var chosenTarget = this.checkTargetTeam(this.activeTeam, data.type);

    switch(data.type){
      case 'attack':
        this.units[this.index].attack(chosenTarget[target], data, this.activeTeam);
      break;
      case 'debuff':
        this.units[this.index].debuff(chosenTarget[target], data, this.activeTeam);
      break;
      case 'buff':
        this.units[this.index].buff(chosenTarget[target], data, this.activeTeam);
      break;
      case 'selfbuff':
        this.units[this.index].selfbuff(this.units[this.index], data, this.activeTeam);
      break;
      case 'defend':
        this.units[this.index].defend(chosenTarget[target], data, this.activeTeam);
      break;
      case 'aoeattack':
         chosenTarget.forEach(function(character, index) {
            scene.units.attack(character[target], data, this.activeTeam);
         });
      break;
      case 'aoedebuff':
         chosenTarget.forEach(function(character, index) {
            scene.units.debuff(character[target], data, this.activeTeam);
         });
      break;
      case 'aoebuff':
         chosenTarget.forEach(function(character, index) {
            scene.units.buff(character[target], data, this.activeTeam);
         });
      break;
      case 'escape':
        getPercentageChance(100) > 50 ? this.mainScene.endBattle({'result':'escape'}) : this.onFailedEscape();
      break;
      default:
        this.units[this.index].attack(this.enemies[target], data, this.activeTeam);
      break;
    }

    this.time.addEvent({ delay: 2000, callback: this.nextTurn, callbackScope: this });
  }

  checkTargetTeam(activeTeam, action){
    if (activeTeam == 'hero' && (action == 'debuff' || action == 'attack')) return this.enemies;
    if (activeTeam == 'hero' && (action != 'debuff' || action != 'attack')) return this.heroes;
    if (activeTeam == 'enemy' && (action == 'debuff' || action == 'attack')) return this.heroes;

    return this.enemies;
  }
  onFailedEscape(){
      this.battleUI.events.emit('Message', "You weren't able to escape.");
  }
}