import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { pantryHotspots } from './config';
import { ReadingText } from './ReadingText';
import { hasAnswer } from './activityProgress';

// One everyday situation, a tempting quick fix versus a safer action, and brief feedback.
// No movement, scoring, drag-and-drop or repeated instruction panel.
const storageKey = 'clte-pantry-v1';
export function clearOfficeProgress() { try { ['clte-office-v1', 'clte-office-v2', 'clte-office-v3', storageKey].forEach(key => localStorage.removeItem(key)); } catch { /* Optional storage. */ } }
const isAnswered = (item: typeof pantryHotspots[number], choices: Record<string, string>) => hasAnswer(item.options, choices[item.id]);
function readChoices(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(pantryHotspots.filter(item => item.options.some(option => option.id === saved[item.id])).map(item => [item.id, saved[item.id]]));
  } catch { /* Optional storage. */ }
  return {};
}
export default function OfficeScene({ onComplete, nextLabel = 'Finish & return home' }: { onComplete: () => void; nextLabel?: string }) {
  const [choices, setChoices] = useState(readChoices);
  const [step, setStep] = useState(() => Math.max(0, pantryHotspots.findIndex(item => !isAnswered(item, choices))));
  const heading = useRef<HTMLHeadingElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const active = pantryHotspots[step];
  const selected = active.options.find(option => option.id === choices[active.id]);
  const count = pantryHotspots.filter(item => isAnswered(item, choices)).length;
  const allDone = count === pantryHotspots.length;
  const applyChoice = (id: string) => setChoices(current => ({ ...current, [active.id]: id }));
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional storage. */ } }, [choices]);
  useLayoutEffect(() => {
    // Reserve space below the decision panel for every on-scene hazard marker.
    const update = () => workspace.current?.style.setProperty('--office-panel-height', `${panel.current?.offsetHeight || 600}px`);
    const observer = new ResizeObserver(update);
    if (panel.current) observer.observe(panel.current);
    update();
    return () => observer.disconnect();
  }, []);
  const choose = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); if (window.matchMedia('(max-width: 900px)').matches) heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const next = () => choose(step < pantryHotspots.length - 1 ? step + 1 : Math.max(0, pantryHotspots.findIndex(item => !isAnswered(item, choices))));
  return <section id="office" className="chapter hazard-guided office-immersive" data-active-hazard={active.id} style={{'--focus-x':`${active.x}%`,'--focus-y':`${active.y}%`} as CSSProperties}>
    <div className="scene-heading"><h1>Pantry hazards</h1><p>Choose an answer, read the feedback, then move on.</p></div>
    <div className="office-workspace" ref={workspace}>
      <div className="office-context">
        <div className="scene-frame">
          <img src="/assets/clte-pantry-hazards.png" alt="Illustrated CLTE pantry practice scene: spilled water, a bag and strap in the aisle, a trailing air purifier cable, a hot mug at the table edge and an open cupboard door."/>
          <svg className="pantry-mug-leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="43" y1="41" x2="40" y2="48"/></svg>
          {pantryHotspots.map((item, index) => <button key={item.id} data-hazard={item.id} className={`hazard-marker ${index === step ? 'current' : ''} ${isAnswered(item, choices) ? 'done' : ''}`} style={{ left: `var(--hazard-marker-left, ${item.x}%)`, top: `var(--hazard-marker-top, ${item.y}%)` }} aria-label={`Inspect: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}>{isAnswered(item, choices) ? <Check size={20} aria-hidden="true"/> : index + 1}</button>)}
        </div>
      </div>
      <div className="office-scene-shade" aria-hidden="true"/>
      <div className="hazard-picker" role="group" aria-label="Five hazards — explore in any order">
          {pantryHotspots.map((item, index) => <button key={item.id} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}><span>{isAnswered(item, choices) ? <Check size={17} aria-hidden="true"/> : index + 1}</span>{item.label}{isAnswered(item, choices) && <span className="sr-only"> — completed</span>}</button>)}
        </div>
      <div className="hazard-panel" ref={panel}>
        <div className="hazard-panel-meta"><p className="eyebrow">{active.label} · {step + 1} of 5</p></div>
        <h3 ref={heading} tabIndex={-1}><ReadingText>{active.title}</ReadingText></h3>
        <div className="hazard-workbench" key={active.id}>
          <p className="hazard-prompt" id={`hazard-prompt-${active.id}`}><ReadingText>{active.prompt}</ReadingText></p>
          <div className="hazard-destinations" role="group" aria-labelledby={`hazard-prompt-${active.id}`}>
            {active.options.map(option => <button className={`hazard-choice ${selected?.id === option.id ? `selected ${option.correct ? 'correct' : 'incorrect'}` : ''}`} key={option.id} aria-pressed={selected?.id === option.id} onClick={() => applyChoice(option.id)}><span>{option.label}</span>{selected?.id === option.id && (option.correct ? <Check size={20} aria-hidden="true"/> : <X size={20} aria-hidden="true"/>)}</button>)}
          </div>
        </div>
        <div className="hazard-feedback" role="status" aria-live="polite" aria-atomic="true">{selected && <div className={`hazard-result ${selected.correct ? 'correct' : 'incorrect'}`}><strong>{selected.correct ? 'Why this helps' : 'A safer next step'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div>}</div>
        <div className="hazard-footer"><div>{step > 0 && <button className="text-button" onClick={() => choose(step - 1)}><ArrowLeft size={18}/>Back</button>}{allDone ? <button className="primary" onClick={onComplete}>{nextLabel} <ArrowRight size={19}/></button> : <button className="secondary" disabled={!selected} onClick={next}>{step < pantryHotspots.length - 1 ? 'Next hazard' : 'Next unanswered hazard'}<ArrowRight size={19}/></button>}</div></div>
      </div>
    </div>
    <div className="office-footnote"><p className="hazard-safety-note"><ReadingText>Not safe to fix? Keep clear and ask for help.</ReadingText></p></div>
  </section>;
}
