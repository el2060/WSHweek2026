import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, X } from 'lucide-react';
import { journeys, type JourneyDefinition, type JourneyKind } from './journeyData';
import { ReadingText } from './ReadingText';
import VisualScenarioStage from './VisualScenarioStage';
import type { FocusRegion } from './HazardFocus';
import { hasAnswer } from './activityProgress';

const storageKey = (kind: JourneyKind) => `clte-decisions-v1-${kind}`;
export function clearDecisionProgress(kind: JourneyKind) {
  try { [storageKey(kind), `clte-guided-v1-${kind}`].forEach(key => localStorage.removeItem(key)); } catch { /* Optional local progress. */ }
}
function readChoices(kind: JourneyKind, definition: JourneyDefinition): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(kind)) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(
      definition.moments.filter(moment => moment.choices.some(choice => choice.id === saved[moment.id])).map(moment => [moment.id, saved[moment.id]]),
    );
  } catch { /* Start fresh if storage is unavailable or malformed. */ }
  return {};
}

export default function DecisionJourney({ kind, onComplete }: { kind: JourneyKind; onComplete: () => void }) {
  const definition = journeys[kind];
  const [choices, setChoices] = useState(() => readChoices(kind, definition));
  const isDone = (index: number) => hasAnswer(definition.moments[index].choices, choices[definition.moments[index].id]);
  const [step, setStep] = useState(() => Math.max(0, definition.moments.findIndex((_, index) => !isDone(index))));
  const heading = useRef<HTMLHeadingElement>(null);
  const scene = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const moment = definition.moments[step];
  const selected = moment.choices.find(choice => choice.id === choices[moment.id]);
  const count = definition.moments.filter((_, index) => isDone(index)).length;
  const allDone = count === definition.moments.length;
  const firstUnansweredIndex = definition.moments.findIndex((_, index) => !isDone(index));
  const openIndex = firstUnansweredIndex === -1 ? definition.moments.length - 1 : firstUnansweredIndex;
  useEffect(() => { try { localStorage.setItem(storageKey(kind), JSON.stringify(choices)); } catch { /* Optional storage. */ } }, [kind, choices]);
  const moveTo = (index: number) => {
    const imageChanges = definition.moments[index].image !== moment.image;
    setStep(index);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 1100px)').matches) {
        (imageChanges ? scene.current : panel.current)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
  };
  const next = () => moveTo(step < definition.moments.length - 1 ? step + 1 : Math.max(0, definition.moments.findIndex((_, index) => !isDone(index))));

  const protectedRegion: FocusRegion = kind === 'haze' ? { x: 44, y: 26, width: 24, height: 61 } : step === 1 ? { x: 29, y: 23, width: 69, height: 63 } : { x: 29, y: 32, width: 29, height: 48 };
  return <section ref={scene} id={definition.id} className={`decision-journey journey-${kind}`}>
    <div className="journey-heading"><h1>{definition.heading}</h1></div>
    <VisualScenarioStage protectedRegion={protectedRegion} artwork={<div className="journey-art"><img key={moment.image} src={moment.image} alt={moment.alt}/></div>} decision={<div className="journey-panel" ref={panel}>
      <p className="journey-step">{moment.label} · {step + 1} of {definition.moments.length}</p>
      <h2 ref={heading} tabIndex={-1}><ReadingText>{moment.title}</ReadingText></h2>
      <p className="journey-story"><ReadingText>{moment.story}</ReadingText></p>
      <div className="journey-choices" role="group" aria-label={moment.title}>
        {moment.choices.map(choice => <button key={choice.id} aria-pressed={selected?.id === choice.id} className={selected?.id === choice.id ? (choice.correct ? 'correct' : 'incorrect') : ''} onClick={() => setChoices(current => ({...current, [moment.id]: choice.id}))}>
          <span>{choice.label}</span>{selected?.id === choice.id && (choice.correct ? <Check size={21} aria-hidden="true"/> : <X size={21} aria-hidden="true"/>)}
        </button>)}
      </div>
      <div className="journey-feedback" role="status" aria-live="polite" aria-atomic="true">{selected && <div className={selected.correct ? 'correct' : 'incorrect'}><strong>{selected.correct ? 'Why this helps' : 'A safer next step'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div>}</div>
      <div className="journey-actions"><div>
        {step > 0 && <button className="text-button" onClick={() => moveTo(step - 1)}><ArrowLeft size={18}/>Back</button>}
        {allDone ? <button className="primary" onClick={onComplete}>Finish<ArrowRight size={19}/></button> : <button className="secondary" disabled={!selected} onClick={next}>{step < definition.moments.length - 1 ? 'Next' : 'Next unanswered'}<ArrowRight size={19}/></button>}
      </div></div>
      <details className="journey-reference" key={step}><summary>Quick reference</summary><ul>{definition.reference.map(item => <li key={item}><ReadingText>{item}</ReadingText></li>)}</ul><div>{definition.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div></details>
    </div>} navigation={<div className="journey-nav" role="group" aria-label="Situations, in order">{definition.moments.map((item, index) => { const locked = index > openIndex; return <button key={item.id} disabled={locked} aria-disabled={locked} aria-current={step === index ? 'step' : undefined} onClick={() => moveTo(index)}><span>{isDone(index) ? <Check size={18} aria-hidden="true"/> : locked ? <Lock size={16} aria-hidden="true"/> : index + 1}</span>{item.label}{isDone(index) && <span className="sr-only"> — completed</span>}</button>; })}</div>}/>
    <div className="journey-footnote"><p>{definition.safety ? `${definition.safety} Practice only. Nothing is sent.` : 'Practice only · Nothing is submitted.'}</p></div>
  </section>;
}
