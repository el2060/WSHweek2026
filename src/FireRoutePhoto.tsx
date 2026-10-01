import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function FireRoutePhoto({ src, caption, index, count, onSelect, paused, motion, colleague = false }: {
  src: string; caption: string; index: number; count: number; onSelect: (index: number) => void; paused: boolean; motion: boolean; colleague?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reset = () => {
    frame.current?.style.setProperty('--photo-look-x', '0%');
    frame.current?.style.setProperty('--photo-look-y', '0%');
  };
  useEffect(reset, [src, motion, paused]);
  const look = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!motion || paused || event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    if ((event.target as HTMLElement).closest('button')) { reset(); return; }
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - box.left) / box.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - box.top) / box.height - .5));
    frame.current?.style.setProperty('--photo-look-x', `${x * -1.4}%`);
    frame.current?.style.setProperty('--photo-look-y', `${y * -1.4}%`);
  };
  return <div ref={frame} className={`pov-camera route-photo ${motion ? 'has-motion' : ''} ${colleague ? 'has-colleague' : ''}`} onPointerMove={look} onPointerLeave={reset}>
    <div className="route-photo-window"><div className="route-photo-media" key={src}>
      <img src={src} alt={colleague ? `${caption}. An illustrated colleague is walking towards the crossing.` : caption} draggable={false}/>
      {colleague && <svg className="route-colleague" viewBox="0 0 2400 1121" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <ellipse cx="1432" cy="933" rx="42" ry="7" fill="#142524" opacity=".18"/>
        <image href="/assets/fire-route/colleague-crossing-v1.png" x="1340" y="650" width="190" height="285"/>
      </svg>}
    </div></div>
    {count > 1 && <div className="route-photo-controls" aria-label="Route photo navigation">
      <button type="button" disabled={index === 0} aria-label="Previous route photo" onClick={() => onSelect(index - 1)}><ArrowLeft size={18}/></button>
      <span aria-live="polite">View {index + 1} of {count}</span>
      <button type="button" disabled={index === count - 1} aria-label="Next route photo" onClick={() => onSelect(index + 1)}><ArrowRight size={18}/></button>
    </div>}
  </div>;
}
