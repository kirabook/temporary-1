import WalkState from '../movement/walk'
import RunState from '../movement/run'
import CrouchState from '../movement/crouch'
import IdleState from '../movement/idle'
import DownState from '../movement/down'
import UpState from '../movement/up'
import SneakState from '../movement/sneak'

export default class PlayerController {
  init() {
    this.states;
    this.currentState;
  }

  constructor(player) {
    this.states = {
      walk: new WalkState(player),
      run: new RunState(player),
      crouch: new CrouchState(player),
      idle: new IdleState(player),
      down: new DownState(player),
      up: new UpState(player),
      sneak: new SneakState(player)
    }
  }

  setState(name) {
    if (this.currentState === this.states[name]) {
      return
    }

    this.currentState = this.states[name];
    this.currentState.enter();
  }
}