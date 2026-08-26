import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { journeys, type JourneyDefinition, type JourneyKind } from './journeyData';
import { ReadingText } from './ReadingText';

const storageKey = (kind: JourneyKind) => `clte-decisions-v1-${kind}`;
export function clearDecisionProgress(kind: JourneyKind) {
  try {
    [storageKey(kind), kind === 'reporting' ? 'clte-reporting-v1' : `clte-guided-v1-${kind}`].forEach(key => localStorage.removeItem(key));
  } catch { /* Optional local progress. */ }
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
  const isDone = (index: number) => definition.moments[index].choices.some(choice => choice.correct && choice.id === choices[definition.moments[index].id]);
  const [step, setStep] = useState(() => Math.max(0, definition.moments.findIndex((_, index) => !isDone(index))));
  const heading = useRef<HTMLHeadingElement>(null);
  const scene = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const moment = definition.moments[step];
  const selected = moment.choices.find(choice => choice.id === choices[moment.id]);
  const count = definition.moments.filter((_, index) => isDone(index)).length;
  const allDone = count === definition.moments.length;
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

  return <section ref={scene} id={definition.id} className={`decision-journey journey-${kind}`}>
    <div className="journey-art"><img key={moment.image} src={moment.image} alt={moment.alt}/></div>
    <div className="journey-shade" aria-hidden="true"/>
    <div className="journey-heading"><h1>{definition.heading}</h1></div>
    <div className="journey-panel" ref={panel}>
      <p className="journey-step">Decision {step + 1} of {definition.moments.length}</p>
      <h2 ref={heading} tabIndex={-1}><ReadingText>{moment.title}</ReadingText></h2>
      <p className="journey-story"><ReadingText>{moment.story}</ReadingText></p>
      <div className="journey-choices" role="group" aria-label={moment.title}>
        {moment.choices.map(choice => <button key={choice.id} aria-pressed={selected?.id === choice.id} className={selected?.id === choice.id ? (choice.correct ? 'correct' : 'incorrect') : ''} onClick={() => setChoices(current => ({...current, [moment.id]: choice.id}))}>
          <span>{choice.label}</span>{selected?.id === choice.id && (choice.correct ? <Check size={21} aria-hidden="true"/> : <X size={21} aria-hidden="true"/>)}
        </button>)}
      </div>
      <div className="journey-feedback" role="status" aria-live="polite" aria-atomic="true">{selected && <div className={selected.correct ? 'correct' : 'incorrect'}><strong>{selected.correct ? 'Good choice' : 'Not quite — try again'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div>}</div>
      <div className="journey-actions"><span className="journey-count">{count}/{definition.moments.length} completed</span><div>
        {step > 0 && <button className="text-button" onClick={() => moveTo(step - 1)}><ArrowLeft size={18}/>Back</button>}
        {allDone ? <button className="primary" onClick={onComplete}>Continue to {definition.next}<ArrowRight size={19}/></button> : <button className="secondary" onClick={next}>{step < definition.moments.length - 1 ? 'Next' : 'Review remaining'}<ArrowRight size={19}/></button>}
      </div></div>
      <details className="journey-reference" key={step}><summary>Quick reference</summary><ul>{definition.reference.map(item => <li key={item}><ReadingText>{item}</ReadingText></li>)}</ul><div>{definition.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div></details>
    </div>
    <div className="journey-nav" role="group" aria-label="Situations — explore in any order">{definition.moments.map((item, index) => <button key={item.id} aria-current={step === index ? 'step' : undefined} onClick={() => moveTo(index)}><span>{isDone(index) ? <Check size={18} aria-hidden="true"/> : index + 1}</span>{item.label}{isDone(index) && <span className="sr-only"> — completed</span>}</button>)}</div>
    <div className="journey-footnote">{definition.safety && <p>{definition.safety}</p>}<p>Practice only · no calls or reports sent.</p></div>
  </section>;
}
