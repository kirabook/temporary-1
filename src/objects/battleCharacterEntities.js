import Character from "../objects/character.js";

/**
 * Non Playable Character
 */
export class Hero extends Character {
  constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level) {
    super(scene, x, y, grid, name, 'hero', trigger, pose, hp, chakra, ryo, strength, defense, speed, level);

      this.setGravity(0);
      this.body.setAllowGravity(false);

  }

  setMenuItem(item) {
    this.menuItem = item;
  }
}

export class Enemy extends Character {
  constructor(scene, x, y, grid, name, role, trigger, pose, hp, chakra, ryo, strength, defense, speed, level) {
    super(scene, x, y, grid, name, 'enemy', trigger, pose, hp, chakra, ryo, strength, defense, speed, level);

      this.setGravity(0);
      this.body.setAllowGravity(false);
      
  }
  
  setMenuItem(item) {
    this.menuItem = item;
  }
}
