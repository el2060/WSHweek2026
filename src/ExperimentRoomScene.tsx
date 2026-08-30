import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, Gamepad2, MapPin, MousePointer2, X } from 'lucide-react';
import { officialInfo } from './config';

const ExperimentRoom3D = lazy(() => import('./ExperimentRoom3D'));

type RoomView = 'entrance' | 'teaching' | 'windows';
type RoomChoice = { id: string; label: string; correct: boolean; feedback: string };
type RoomHazard = {
  id: string; view: RoomView; label: string; title: string; story: string;
  choices: RoomChoice[];
};

const storageKey = 'clte-experiment-room-v1';

export function clearExperimentRoomProgress() {
  try { localStorage.removeItem(storageKey); } catch { /* Optional local progress. */ }
}

const views: { id: RoomView; label: string }[] = [
  { id: 'entrance', label: 'Entrance' },
  { id: 'teaching', label: 'Teaching wall' },
  { id: 'windows', label: 'Window wall' },
];

const hazards: RoomHazard[] = [
  { id: 'aisle-cable', view: 'entrance', label: 'Cable', title: 'Cable across the aisle', story: 'A laptop lead crosses the main walking route.', choices: [
    { id: 'small-tape', label: 'Tape one section down and carry on', correct: false, feedback: 'Part of the cable still crosses the route. Keep people clear until it is routed or covered safely.' },
    { id: 'reroute', label: 'Keep clear and have the cable routed safely', correct: true, feedback: 'Remove the trip route before the room is used. Secure the full cable, not just one section.' },
  ]},
  { id: 'aisle-bag', view: 'entrance', label: 'Bag', title: 'Bag in the walking route', story: 'Its owner says they will be back shortly.', choices: [
    { id: 'under-table', label: 'Store it fully beneath a table', correct: true, feedback: 'Keep bags and straps completely out of the aisle so the route stays clear.' },
    { id: 'table-edge', label: 'Slide it closer to the table edge', correct: false, feedback: 'It can still catch someone’s foot. Store it fully outside the walking route.' },
  ]},
  { id: 'exit-route', view: 'teaching', label: 'Exit', title: 'Exit route obstructed', story: 'The next session starts in five minutes.', choices: [
    { id: 'later', label: 'Leave it until the session ends', correct: false, feedback: 'An exit route must stay clear while the room is occupied. Remove the chairs and carton now.' },
    { id: 'clear', label: 'Clear the exit route before people enter', correct: true, feedback: 'A clear route supports a prompt evacuation and prevents a last-minute obstruction.' },
  ]},
  { id: 'drink-power', view: 'teaching', label: 'Drink', title: 'Drink beside powered equipment', story: 'A takeaway drink sits beside the laptop and adapter.', choices: [
    { id: 'lid', label: 'Leave it there with the lid on', correct: false, feedback: 'A lid can still leak or be knocked over. Keep drinks away from powered equipment.' },
    { id: 'move', label: 'Move it to a separate drinks area', correct: true, feedback: 'Separating drinks from powered equipment reduces spill, shock and equipment risks.' },
  ]},
  { id: 'chair-wheel', view: 'windows', label: 'Chair', title: 'Chair with a loose caster', story: 'A wheel has detached from a chair used at the front table.', choices: [
    { id: 'push', label: 'Push the wheel back in and test the chair', correct: false, feedback: 'A quick push does not confirm the chair is safe. Keep it out of use and arrange a proper check.' },
    { id: 'tag', label: 'Keep it out of use and report the fault', correct: true, feedback: `Prevent anyone from using it and report its exact location via ${officialInfo.faultNumber}.` },
  ]},
  { id: 'power-adapter', view: 'windows', label: 'Power', title: 'Overloaded power adapter', story: 'Several devices share a tangled floor adapter.', choices: [
    { id: 'extend', label: 'Add another adapter to spread the plugs', correct: false, feedback: 'Connecting more adapters can increase electrical and fire risk. Stop using the setup and get help.' },
    { id: 'stop', label: 'Stop using it and ask staff to make it safe', correct: true, feedback: 'Keep the area clear and have the power needs checked, reduced and arranged safely.' },
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
  const [viewId, setViewId] = useState<RoomView>(firstUnfinished?.view || 'entrance');
  const [jumpSignal, setJumpSignal] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(() => Object.keys(choices).length ? firstUnfinished?.id || hazards[0].id : null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const active = hazards.find(hazard => hazard.id === activeId);
  const selected = active?.choices.find(choice => choice.id === choices[active.id]);
  const isDone = (hazard: RoomHazard) => hazard.choices.some(choice => choice.correct && choice.id === choices[hazard.id]);
  const count = hazards.filter(isDone).length;
  const allDone = count === hazards.length;

  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional local progress. */ } }, [choices]);

  const inspect = (hazard: RoomHazard) => {
    setActiveId(hazard.id);
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  };
  const selectView = (next: RoomView) => {
    setViewId(next); setJumpSignal(value => value + 1); setActiveId(null);
  };
  const nextHazard = () => {
    if (!active) return;
    const start = hazards.indexOf(active);
    const next = hazards.find((hazard, index) => index > start && !isDone(hazard)) || hazards.find(hazard => !isDone(hazard)) || hazards[(start + 1) % hazards.length];
    setViewId(next.view); setJumpSignal(value => value + 1); setActiveId(next.id);
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  };
  return <section className="experiment-room" data-view={viewId}>
    <div className="experiment-camera"><Suspense fallback={<div className="experiment-loading">Building the room…</div>}><ExperimentRoom3D jumpTo={viewId} jumpSignal={jumpSignal} activeId={activeId} solvedIds={hazards.filter(isDone).map(hazard => hazard.id)} onInspect={(id) => { const hazard=hazards.find(item=>item.id===id); if(hazard) inspect(hazard); }}/></Suspense></div>
    <div className="experiment-shade" aria-hidden="true"/>
    <div className="experiment-heading"><p>01B · Actual CLTE space</p><h1>Experiment Room</h1><span><MapPin/> Block 31 · Level 2</span></div>
    <div className="experiment-score" aria-live="polite"><strong>{count}/{hazards.length}</strong><span>made safe</span></div>
    <div className="experiment-reticle" aria-hidden="true"><i/><i/></div>
    <div className="experiment-controls-hint"><Gamepad2/><span><b>WASD / arrows</b> to walk</span><MousePointer2/><span><b>Drag</b> to look · <b>tap</b> a gold marker</span></div>
    <div className="experiment-dpad" aria-label="Walk controls"><button data-key="KeyW" aria-label="Walk forward">↑</button><button data-key="KeyA" aria-label="Walk left">←</button><button data-key="KeyS" aria-label="Walk backward">↓</button><button data-key="KeyD" aria-label="Walk right">→</button></div>
    <aside className={`experiment-panel ${active ? 'has-hazard' : 'is-brief'}`}>
      {!active ? <div className="experiment-brief"><Eye/><p>Part 2 of 2 · First person</p><h2>Walk through the room.</h2><span>Gold markers reveal six things that need attention.</span></div> : <>
        <p className="experiment-meta">{active.label} · {hazards.indexOf(active) + 1} of {hazards.length}</p>
        <h2 ref={titleRef} tabIndex={-1}>{active.title}</h2>
        <p className="experiment-story">{active.story}</p>
        <div className="experiment-choices" role="group" aria-label={active.title}>{active.choices.map(choice => <button key={choice.id} aria-pressed={selected?.id === choice.id} className={selected?.id === choice.id ? (choice.correct ? 'correct' : 'incorrect') : ''} onClick={() => setChoices(current => ({...current,[active.id]:choice.id}))}><span>{choice.label}</span>{selected?.id === choice.id && (choice.correct ? <Check/> : <X/>)}</button>)}</div>
        {selected && <div className={`experiment-feedback ${selected.correct ? 'correct' : 'incorrect'}`} role="status"><strong>{selected.correct ? 'Why this helps' : 'Try this instead'}</strong><p>{selected.feedback}</p></div>}
        <div className="experiment-actions">{allDone ? <button className="primary" onClick={onComplete}>Continue to Fire <ArrowRight/></button> : <button className="secondary" onClick={nextHazard}>{selected?.correct ? 'Next hazard' : 'Skip for now'} <ArrowRight/></button>}</div>
      </>}
    </aside>
    <div className="experiment-view-nav" role="group" aria-label="Walkthrough viewpoints">{views.map((item, index) => <button key={item.id} aria-current={viewId === item.id ? 'step' : undefined} onClick={() => selectView(item.id)}><span>{String(index + 1).padStart(2,'0')}</span>{item.label}<small>{hazards.filter(hazard => hazard.view === item.id && isDone(hazard)).length}/2</small></button>)}</div>
    <button className="experiment-back" onClick={onBack}><ArrowLeft/> Office workspace</button>
  </section>;
}
