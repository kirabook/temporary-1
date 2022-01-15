import Character from "../objects/character.js";

/**
 * Non Playable Character
 */
export default class CutsceneCharacter extends Character {
  constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level) {
    super(scene, x, y, grid, name, 'cutscene', trigger, pose, hp, chakra, ryo, strength, defense, speed, level);

      this.setPosition(x + this.body.width / 2, y - (this.body.height / 2) + 32);
      this.setGravity(0);
      this.setImmovable(true);
      this.body.setEnable(false);
      this.body.setAllowGravity(false);
      
  }
}
