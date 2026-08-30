import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, MapPin, X } from 'lucide-react';

type RoomChoice = { id: string; label: string; correct: boolean; feedback: string };
type RoomHazard = { id: string; x: number; y: number; label: string; title: string; story: string; choices: RoomChoice[] };
const storageKey = 'clte-experiment-room-v1';

export function clearExperimentRoomProgress() {
  try { localStorage.removeItem(storageKey); } catch { /* Optional local progress. */ }
}

const hazards: RoomHazard[] = [
  { id: 'aisle-cable', x: 18, y: 60, label: 'Damage', title: 'Damaged cable insulation', story: 'The cable crossing the floor has split insulation and exposed wiring.', choices: [
    { id: 'small-tape', label: 'Cover the damaged section with tape', correct: false, feedback: 'Tape is not a reliable repair for damaged electrical insulation. Stop using the cable and keep people clear.' },
    { id: 'reroute', label: 'Isolate it and report the damaged cable', correct: true, feedback: 'Stop anyone using or touching it, isolate the supply if safe, and arrange replacement by an authorised person.' },
  ]},
  { id: 'aisle-bag', x: 92, y: 91, label: 'Caster', title: 'Detached chair caster', story: 'A caster has come away from the front-right chair, leaving it unstable.', choices: [
    { id: 'under-table', label: 'Keep the chair out of use and report it', correct: true, feedback: 'Move the chair aside without sitting on it, label it clearly and arrange a proper repair or replacement.' },
    { id: 'table-edge', label: 'Push the caster back in and test it', correct: false, feedback: 'A loose caster may detach again under load. Do not test it by sitting—remove the chair from use.' },
  ]},
  { id: 'exit-route', x: 37, y: 69, label: 'Power', title: 'Overloaded power strip', story: 'Several plugs share a loose power strip, with its lead stretched across the floor.', choices: [
    { id: 'later', label: 'Tuck the strip beneath the nearest table', correct: false, feedback: 'That hides the problem but leaves the electrical load and trailing lead unsafe.' },
    { id: 'clear', label: 'Stop using it and have the setup checked', correct: true, feedback: 'Reduce the load, check the power requirement and route the supply safely before use.' },
  ]},
  { id: 'power-adapter', x: 73, y: 80, label: 'Spill', title: 'Liquid beside a power lead', story: 'A bottle has spilled onto the carpet beside connected equipment.', choices: [
    { id: 'extend', label: 'Pick up the bottle and wipe around the cable', correct: false, feedback: 'Do not approach liquid near live equipment until the electrical risk has been controlled.' },
    { id: 'stop', label: 'Keep clear, isolate power safely and get help', correct: true, feedback: 'Prevent access, have the supply isolated by a competent person, then clean and inspect the area safely.' },
  ]},
];

function readChoices(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(
      hazards.filter(hazard => hazard.choices.some(choice => choice.id === saved[hazard.id])).map(hazard => [hazard.id, saved[hazard.id]]),
    );
  } catch { /* Start clean if saved data cannot be read. */ }
  return {};
}

export default function ExperimentRoomScene({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [choices, setChoices] = useState(readChoices);
  const firstUnfinished = hazards.find(hazard => !hazard.choices.some(choice => choice.correct && choice.id === choices[hazard.id]));
  const [activeId, setActiveId] = useState<string | null>(() => firstUnfinished?.id || hazards[0].id);
  const sceneRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const active = hazards.find(hazard => hazard.id === activeId);
  const selected = active?.choices.find(choice => choice.id === choices[active.id]);
  const isDone = (hazard: RoomHazard) => hazard.choices.some(choice => choice.correct && choice.id === choices[hazard.id]);
  const count = hazards.filter(isDone).length;
  const allDone = count === hazards.length;
  const focusStyle = active ? ({ '--room-focus-x': `${active.x}%`, '--room-focus-y': `${active.y}%` } as CSSProperties) : undefined;

  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional local progress. */ } }, [choices]);
  const inspect = (hazard: RoomHazard) => { setActiveId(hazard.id); requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true })); };
  const nextHazard = () => {
    if (!active) return;
    const start = hazards.indexOf(active);
    const next = hazards.find((hazard, index) => index > start && !isDone(hazard)) || hazards.find(hazard => !isDone(hazard)) || hazards[(start + 1) % hazards.length];
    setActiveId(next.id);
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  };
  const movePhoto = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--room-look-x', `${((event.clientX - box.left) / box.width - .5) * -14}px`);
    event.currentTarget.style.setProperty('--room-look-y', `${((event.clientY - box.top) / box.height - .5) * -9}px`);
  };
  const resetPhoto = () => { sceneRef.current?.style.setProperty('--room-look-x', '0px'); sceneRef.current?.style.setProperty('--room-look-y', '0px'); };

  return <section ref={sceneRef} className={`experiment-room ${active ? 'has-focus' : ''}`} data-focus-side={active && active.x < 48 ? 'left' : 'right'} style={focusStyle} onPointerMove={movePhoto} onPointerLeave={resetPhoto}>
    <div className="experiment-camera"><img src="/assets/experiment-room/training-composite.webp?v=hazards-1" alt="Experiment Room training scene with four added safety hazards: a damaged cable, overloaded power strip, detached chair caster and liquid spill."/></div>
    <div className="experiment-shade" aria-hidden="true"/><div className="experiment-focus" aria-hidden="true"/>
    <div className="experiment-heading"><p>01B · CLTE space</p><h1>Experiment Room</h1><span><MapPin/> Block 31 · Level 2</span></div>
    <div className="experiment-score" aria-live="polite"><strong>{count}/{hazards.length}</strong><span>made safe</span></div>
    <div className="experiment-hotspots" aria-label="Guided room hazards">{hazards.map(hazard => <button key={hazard.id} style={{left:`${hazard.x}%`,top:`${hazard.y}%`}} className={`${activeId === hazard.id ? 'active' : ''} ${isDone(hazard) ? 'done' : ''}`} aria-label={`Inspect ${hazard.title}`} onClick={() => inspect(hazard)}>{isDone(hazard) ? <Check/> : <><span/><small>{hazard.label}</small></>}</button>)}</div>
    <aside className={`experiment-panel ${active ? 'has-hazard' : 'is-brief'}`}>
      {!active ? <div className="experiment-brief"><Eye/><p>Part 2 of 2 · Photo walkthrough</p><h2>Look around the room.</h2><span>Follow the soft pulse to inspect each hazard.</span></div> : <>
        <p className="experiment-meta">{active.label} · {hazards.indexOf(active) + 1} of {hazards.length}</p><h2 ref={titleRef} tabIndex={-1}>{active.title}</h2><p className="experiment-story">{active.story}</p>
        <div className="experiment-choices" role="group" aria-label={active.title}>{active.choices.map(choice => <button key={choice.id} aria-pressed={selected?.id === choice.id} className={selected?.id === choice.id ? (choice.correct ? 'correct' : 'incorrect') : ''} onClick={() => setChoices(current => ({...current,[active.id]:choice.id}))}><span>{choice.label}</span>{selected?.id === choice.id && (choice.correct ? <Check/> : <X/>)}</button>)}</div>
        {selected && <div className={`experiment-feedback ${selected.correct ? 'correct' : 'incorrect'}`} role="status"><strong>{selected.correct ? 'Why this helps' : 'Try this instead'}</strong><p>{selected.feedback}</p></div>}
        <div className="experiment-actions">{allDone ? <button className="primary" onClick={onComplete}>Continue to Fire <ArrowRight/></button> : <button className="secondary" onClick={nextHazard}>{selected?.correct ? 'Next hazard' : 'Skip for now'} <ArrowRight/></button>}</div>
      </>}
    </aside>
    <button className="experiment-back" onClick={onBack}><ArrowLeft/> Office workspace</button>
  </section>;
}
