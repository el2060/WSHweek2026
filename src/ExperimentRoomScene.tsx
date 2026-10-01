import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, Lock, MapPin, TriangleAlert, X, Zap } from 'lucide-react';

import VisualScenarioStage from './VisualScenarioStage';
import HazardFocus, { type FocusRegion } from './HazardFocus';

import { hasAnswer } from './activityProgress';

const focusRegions: Record<string, FocusRegion> = {
  'aisle-cable': { x: 5, y: 52, width: 28, height: 30 },
  'aisle-bag': { x: 75, y: 75, width: 24, height: 24 },
  'exit-route': { x: 32, y: 65, width: 25, height: 30 },
};

type RoomChoice = { id: string; label: string; correct: boolean; feedback: string };
type RoomHazard = { id: string; x: number; y: number; label: string; title: string; story: string; choices: RoomChoice[] };
const storageKey = 'clte-experiment-room-v2';

export function clearExperimentRoomProgress() {
  try { localStorage.removeItem(storageKey); localStorage.removeItem('clte-experiment-room-v1'); } catch { /* Optional local progress. */ }
}

const hazards: RoomHazard[] = [
  { id: 'aisle-cable', x: 18, y: 66, label: 'Damage', title: 'Damaged cable insulation', story: 'The cable crossing the floor has split insulation and exposed wiring.', choices: [
  { id: 'small-tape', label: 'Cover the damaged section with tape', correct: false, feedback: 'Tape won’t fix damaged insulation reliably. Stop using the cable and keep people clear.' },
  { id: 'reroute', label: 'Keep clear, warn others and report the cable', correct: true, feedback: 'Keep people away and ask an authorised person to isolate the supply and replace the damaged cable.' },
  ]},
  { id: 'aisle-bag', x: 88, y: 94, label: 'Caster', title: 'Detached chair caster', story: 'A caster has come away from the front-right chair, leaving it unstable.', choices: [
    { id: 'under-table', label: 'Keep the chair out of use and report it', correct: true, feedback: 'Move the chair aside without sitting on it, label it clearly and arrange a proper repair or replacement.' },
    { id: 'table-edge', label: 'Push the caster back in and test it', correct: false, feedback: 'A loose caster can give way again under load. Don’t test it by sitting—remove the chair from use.' },
  ]},
  { id: 'exit-route', x: 44, y: 78, label: 'Power', title: 'Overloaded power strip', story: 'The workshop devices together exceed the rated load of this power strip.', choices: [
    { id: 'later', label: 'Tuck the strip beneath the nearest table', correct: false, feedback: 'That hides the problem but leaves the electrical load and trailing lead unsafe.' },
  { id: 'clear', label: 'Stop using it; ask an authorised person to check it', correct: true, feedback: 'Have the load and supply checked before restarting. Several occupied sockets alone do not prove overloading; the equipment ratings matter.' },
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
  const firstUnfinished = hazards.find(hazard => !hasAnswer(hazard.choices, choices[hazard.id]));
  const [activeId, setActiveId] = useState<string | null>(() => firstUnfinished?.id || hazards[0].id);
  const [overviewId, setOverviewId] = useState<string | null>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const active = hazards.find(hazard => hazard.id === activeId);
  const selected = active?.choices.find(choice => choice.id === choices[active.id]);
  const isDone = (hazard: RoomHazard) => hasAnswer(hazard.choices, choices[hazard.id]);
  const count = hazards.filter(isDone).length;
  const allDone = count === hazards.length;
  const firstUnfinishedIndex = hazards.findIndex(hazard => !isDone(hazard));
  const openIndex = firstUnfinishedIndex === -1 ? hazards.length - 1 : firstUnfinishedIndex;
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
    <div className="experiment-title-row"><div className="experiment-heading"><p>Spot the hazard</p><h1>Experiment Room hazards</h1><span><MapPin/> Block 31 · Level 2</span></div>
    <div className="experiment-score" aria-live="polite"><strong>{count}/{hazards.length}</strong><span>explored</span></div></div>
    <VisualScenarioStage protectedRegion={active ? focusRegions[active.id] : {x: 0, y: 0, width: 100, height: 100}} overview={overviewId === activeId} artwork={<div className="experiment-art"><div className="experiment-camera"><img src="/assets/experiment-room/training-illustrated-v4.png" alt="Hand-drawn colleagues in an Experiment Room workshop, with damaged cable insulation, a shared power strip and a detached chair caster to inspect."/>{active && <HazardFocus key={active.id} region={focusRegions[active.id]} label={active.label} onOverviewChange={value => setOverviewId(value ? active.id : null)}/>}</div><div className="experiment-hotspots" aria-label="Guided room hazards, in order">{hazards.map((hazard, index) => { const locked = index > openIndex; return <button key={hazard.id} style={{left:`${hazard.x}%`,top:`${hazard.y}%`}} disabled={locked} aria-disabled={locked} className={`${activeId === hazard.id ? 'active' : ''} ${isDone(hazard) ? 'done' : ''}`} aria-label={`Inspect ${hazard.title}`} onClick={() => inspect(hazard)}>{isDone(hazard) ? <Check/> : locked ? <Lock size={16}/> : <><span/><small>{hazard.label}</small></>}</button>; })}</div></div>} decision={<aside className={`experiment-panel ${active ? 'has-hazard' : 'is-brief'}`}>
      {!active ? <div className="experiment-brief"><Eye/><p>Photo walkthrough</p><h2>Look around the room.</h2><span>Follow the soft pulse to find each hazard.</span></div> : <>
        <p className="experiment-meta">{active.label} · {hazards.indexOf(active) + 1} of {hazards.length}</p><h2 ref={titleRef} tabIndex={-1}>{active.title}</h2><p className="experiment-story">{active.story}</p>
        <div className="experiment-choices" role="group" aria-label={active.title}>{active.choices.map(choice => <button key={choice.id} aria-pressed={selected?.id === choice.id} className={selected?.id === choice.id ? (choice.correct ? 'correct' : 'incorrect') : ''} onClick={() => setChoices(current => ({...current,[active.id]:choice.id}))}><span>{choice.label}</span>{selected?.id === choice.id && (choice.correct ? <Check/> : <X/>)}</button>)}</div>
        {selected && <div className={`experiment-feedback ${selected.correct ? 'correct' : 'incorrect'}`} role="status"><strong>{selected.correct ? 'Why this helps' : 'A safer next step'}</strong><p>{selected.feedback}</p>{active.id === 'aisle-cable' && selected.correct && <span className="experiment-sign-confirmation"><TriangleAlert/> Warning sign placed · Keep clear</span>}</div>}
        <div className="experiment-actions">{allDone ? <button className="primary" onClick={onComplete}>Finish <ArrowRight/></button> : <button className="secondary" disabled={!selected} onClick={nextHazard}>Next hazard <ArrowRight/></button>}</div>
      </>}
    </aside>} navigation={<div className="experiment-picker" role="group" aria-label="Experiment Room hazards, in order">{hazards.map((hazard, index) => <button key={hazard.id} disabled={index > openIndex} aria-current={activeId === hazard.id ? 'step' : undefined} onClick={() => inspect(hazard)}><span>{isDone(hazard) ? <Check size={17}/> : index > openIndex ? <Lock size={15}/> : index + 1}</span>{hazard.label}</button>)}</div>}/>
    <button className="experiment-back" onClick={onBack}><ArrowLeft/> Home</button>
  </section>;
}
