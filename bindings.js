import {MOVES} from './combos.js';
import {beginAttack} from './combat.js';

export const CONTROLS = {Mouse0:'鼠标左键', Mouse2:'鼠标右键', KeyQ:'Q', KeyE:'E'};
export const BINDING_MOVES = {
  ...MOVES, snapKickAlt:{label:'交替弹腿',type:'snapKick'},
  hookAlt:{label:'交替摆拳',type:'hook'},
  uppercutAlt:{label:'交替勾拳',type:'uppercut'},
  palmAlt:{label:'交替掌击',type:'palm'},
  kickAlt:{label:'交替正蹬',type:'kick'},
  punchAlt:{label:'交替直拳',type:'punch'}
};
export const DEFAULT_BINDINGS = {Mouse0:'palmAlt', Mouse2:'kickAlt', KeyQ:'guardHead', KeyE:'guardTorso'};
export const BINDINGS_KEY = 'da-ji-tou-jiao.bindings.v1';
export function validateBindings(raw) {
  return Object.fromEntries(Object.keys(CONTROLS).map(key => [key,
    raw && Object.hasOwn(BINDING_MOVES, raw[key]) ? raw[key] : DEFAULT_BINDINGS[key]]));
}
export function loadBindings(storage) {
  try { return validateBindings(JSON.parse(storage.getItem(BINDINGS_KEY))); }
  catch { return {...DEFAULT_BINDINGS}; }
}
export function heldGuard(bindings, held) {
  // Latest pressed defense wins; releasing it restores any other held defense.
  return [...held].reverse().map(key => BINDING_MOVES[bindings[key]]?.guard).find(Boolean) || null;
}
export function pressBinding(state, bindings, key, held) {
  const move = BINDING_MOVES[bindings[key]];
  if (!move) return false;
  state.guard = heldGuard(bindings, held);
  if (move.guard) return false;
  const previous = state.sides[move.type];
  if (move.side !== undefined) state.sides[move.type] = move.side;
  const started = beginAttack(state, move.type);
  if (!started) state.sides[move.type] = previous;
  return started;
}
export function defenseHint(bindings, zone) {
  const keys = Object.keys(CONTROLS).filter(key => BINDING_MOVES[bindings[key]]?.guard === zone);
  return keys.length ? keys.map(key => CONTROLS[key]).join(' / ') : '未绑定防守';
}

// Mouse attack bindings alone determine the resting/kicking hand shape.
// When both are hand attacks, use the left button as the stable default.
export function readyFists(bindings) {
  const move = ['Mouse0','Mouse2'].map(key => BINDING_MOVES[bindings[key]])
    .find(move => move && ['palm','punch','hook','uppercut'].includes(move.type));
  return !!move && move.type !== 'palm';
}
