export type InputCommand = 'left' | 'right' | 'up' | 'down' | 'action' | 'pause';

const KEY_MAP: Record<string, InputCommand> = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'action', Enter: 'action',
  KeyP: 'pause', Escape: 'pause',
};

/**
 * Unified keyboard + touch input.
 *  - onCommand: fires once per key press (no auto-repeat) and once per swipe / tap.
 *  - isDown: polled state for held keys (smooth movement in 2D games).
 * Swipes map to left/right/up/down; a tap maps to "action".
 */
export function createInput(target: HTMLElement, onCommand: (cmd: InputCommand) => void) {
  const held = new Set<InputCommand>();

  const onKeyDown = (e: KeyboardEvent) => {
    const cmd = KEY_MAP[e.code];
    if (!cmd) return;
    e.preventDefault();
    held.add(cmd);
    if (!e.repeat) onCommand(cmd);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const cmd = KEY_MAP[e.code];
    if (cmd) held.delete(cmd);
  };
  const onBlur = () => held.clear();

  let startX = 0, startY = 0, startT = 0, tracking = false;
  const SWIPE_MIN = 24;
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return; // mouse users have a keyboard; taps are for touch
    tracking = true;
    startX = e.clientX; startY = e.clientY; startT = performance.now();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.hypot(dx, dy) < SWIPE_MIN) {
      if (performance.now() - startT < 400) onCommand('action');
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) onCommand(dx > 0 ? 'right' : 'left');
    else onCommand(dy > 0 ? 'down' : 'up');
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  target.addEventListener('pointerdown', onPointerDown);
  target.addEventListener('pointerup', onPointerUp);
  target.style.touchAction = 'none';

  return {
    isDown: (cmd: InputCommand) => held.has(cmd),
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      target.removeEventListener('pointerdown', onPointerDown);
      target.removeEventListener('pointerup', onPointerUp);
    },
  };
}
