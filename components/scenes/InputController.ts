/**
 * Input controller for character movement.
 * Supports WASD/Arrow keys on web and virtual joystick on mobile.
 */

export interface InputState {
  forward: number;  // -1 to 1 (W/up = 1, S/down = -1)
  right: number;    // -1 to 1 (D/right = 1, A/left = -1)
}

export class KeyboardController {
  private keys: Set<string> = new Set();
  private _onDispose: (() => void)[] = [];

  constructor() {
    if (typeof window === 'undefined') return;

    const onKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this._onDispose.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });
  }

  getInput(): InputState {
    let forward = 0;
    let right = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) forward += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) forward -= 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) right -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) right += 1;

    return { forward, right };
  }

  dispose() {
    this._onDispose.forEach(fn => fn());
  }
}

export class MouseOrbitController {
  theta: number = Math.PI; // behind character
  phi: number = 1.0; // slight elevation
  radius: number = 5;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private _onDispose: (() => void)[] = [];

  constructor(element?: HTMLElement) {
    const target = element || (typeof window !== 'undefined' ? window : null);
    if (!target) return;

    const onMouseDown = (e: any) => {
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
        this.lastX = e.clientX ?? e.pageX;
        this.lastY = e.clientY ?? e.pageY;
      }
    };
    const onMouseMove = (e: any) => {
      if (!this.isDragging) return;
      const x = e.clientX ?? e.pageX;
      const y = e.clientY ?? e.pageY;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      this.lastX = x;
      this.lastY = y;

      this.theta -= dx * 0.006;
      this.phi = Math.max(0.3, Math.min(Math.PI / 2.1, this.phi - dy * 0.006));
    };
    const onMouseUp = () => {
      this.isDragging = false;
    };
    const onWheel = (e: any) => {
      this.radius = Math.max(2, Math.min(15, this.radius + e.deltaY * 0.01));
    };
    const onContextMenu = (e: any) => {
      e.preventDefault();
    };

    (target as any).addEventListener('mousedown', onMouseDown);
    (target as any).addEventListener('mousemove', onMouseMove);
    (target as any).addEventListener('mouseup', onMouseUp);
    (target as any).addEventListener('wheel', onWheel);
    (target as any).addEventListener('contextmenu', onContextMenu);

    this._onDispose.push(() => {
      (target as any).removeEventListener('mousedown', onMouseDown);
      (target as any).removeEventListener('mousemove', onMouseMove);
      (target as any).removeEventListener('mouseup', onMouseUp);
      (target as any).removeEventListener('wheel', onWheel);
      (target as any).removeEventListener('contextmenu', onContextMenu);
    });
  }

  dispose() {
    this._onDispose.forEach(fn => fn());
  }
}
