import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function FireRoutePhoto({ src, caption, index, count, onSelect, paused, motion }: {
  src: string; caption: string; index: number; count: number; onSelect: (index: number) => void; paused: boolean; motion: boolean;
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
  return <div ref={frame} className={`pov-camera route-photo ${motion ? 'has-motion' : ''}`} onPointerMove={look} onPointerLeave={reset}>
    <div className="route-photo-window"><img key={src} src={src} alt={caption} draggable={false}/></div>
    {count > 1 && <div className="route-photo-controls" aria-label="Route photo navigation">
      <button type="button" disabled={index === 0} aria-label="Previous route photo" onClick={() => onSelect(index - 1)}><ArrowLeft size={18}/></button>
      <span aria-live="polite">View {index + 1} of {count}</span>
      <button type="button" disabled={index === count - 1} aria-label="Next route photo" onClick={() => onSelect(index + 1)}><ArrowRight size={18}/></button>
    </div>}
  </div>;
}
