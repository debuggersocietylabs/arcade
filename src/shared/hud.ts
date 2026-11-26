/** Minimal DOM HUD: a stats row plus a centred overlay panel for menus / game over. */
export interface Hud {
  /** Set the stats row, e.g. hud.setStats({ Score: 120, Best: 300 }). */
  setStats(stats: Record<string, string | number>): void;
  /** Show the overlay with a title and optional lines. Pass null to hide it. */
  showOverlay(panel: { title: string; lines?: string[] } | null): void;
  dispose(): void;
}

export function createHud(parent: HTMLElement): Hud {
  const stats = document.createElement('div');
  stats.className = 'hud-stats';
  const overlay = document.createElement('div');
  overlay.className = 'hud-overlay';
  overlay.hidden = true;
  parent.append(stats, overlay);

  return {
    setStats(values) {
      stats.replaceChildren(
        ...Object.entries(values).map(([k, v]) => {
          const el = document.createElement('span');
          const label = document.createElement('small');
          label.textContent = k;
          el.append(label, String(v));
          return el;
        }),
      );
    },
    showOverlay(panel) {
      if (!panel) {
        overlay.hidden = true;
        return;
      }
      const box = document.createElement('div');
      const h = document.createElement('h2');
      h.textContent = panel.title;
      box.append(h, ...(panel.lines ?? []).map((l) => Object.assign(document.createElement('p'), { textContent: l })));
      overlay.replaceChildren(box);
      overlay.hidden = false;
    },
    dispose() {
      stats.remove();
      overlay.remove();
    },
  };
}
