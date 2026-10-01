import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { FocusRegion } from './HazardFocus';

type Placement = { side: 'below' | 'left' | 'right'; top: number };

/** Keep decisions outside the protected artwork region, including after feedback
 * expands or text is enlarged. The whole illustration keeps its original ratio. */
export default function VisualScenarioStage({ artwork, decision, navigation, protectedRegion, overview = false, className = '' }: {
  artwork: ReactNode; decision: ReactNode; navigation: ReactNode;
  protectedRegion: FocusRegion; overview?: boolean; className?: string;
}) {
  const art = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement>({ side: 'below', top: 0 });
  const { x, y, width, height } = protectedRegion;
  useLayoutEffect(() => {
    const update = () => {
      if (!art.current || !panel.current) return;
      const bounds = art.current.getBoundingClientRect();
      const panelBounds = panel.current.getBoundingClientRect();
      const gap = 24;
      const leftRoom = bounds.width * x / 100;
      const rightRoom = bounds.width * (100 - x - width) / 100;
      const candidates: ('left' | 'right')[] = leftRoom > rightRoom ? ['left', 'right'] : ['right', 'left'];
      let next: Placement = { side: 'below', top: 0 };
      if (!overview && window.matchMedia('(min-width: 1101px)').matches) {
        for (const side of candidates) {
          // Leave the full-scene control visible above a panel on the left.
          const minimumTop = side === 'left' ? 72 : gap;
          const room = side === 'left' ? leftRoom : rightRoom;
          if (room >= panelBounds.width + gap * 2 && bounds.height >= panelBounds.height + minimumTop + gap) {
            next = { side, top: Math.max(minimumTop, (bounds.height - panelBounds.height) / 2) };
            break;
          }
        }
      }
      setPlacement(current => current.side === next.side && Math.abs(current.top - next.top) < 1 ? current : next);
    };
    update();
    const observer = new ResizeObserver(update);
    if (art.current) observer.observe(art.current);
    if (panel.current) observer.observe(panel.current);
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [x, y, width, height, overview]);

  return <div className={`scene-stage ${className}`} data-panel-placement={placement.side}>
    <div className="scene-art-slot" ref={art} data-protected-region={`${x},${y},${width},${height}`}>{artwork}</div>
    <div className="scene-decision-slot" ref={panel} style={{ top: placement.side === 'below' ? undefined : placement.top }}>{decision}</div>
    <div className="scene-navigation">{navigation}</div>
  </div>;
}
