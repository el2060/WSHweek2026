import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { officeHotspots } from './config';
import { ReadingText } from './ReadingText';

// One everyday situation, a tempting quick fix versus a safer action, and brief feedback.
// No movement, scoring, drag-and-drop or repeated instruction panel.
const storageKey = 'clte-office-v3';
export function clearOfficeProgress() { try { ['clte-office-v1', 'clte-office-v2', storageKey].forEach(key => localStorage.removeItem(key)); } catch { /* Optional storage. */ } }
const isCorrect = (item: typeof officeHotspots[number], choices: Record<string, string>) => item.options.some(option => option.id === choices[item.id] && option.correct);
function readChoices(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(officeHotspots.filter(item => item.options.some(option => option.id === saved[item.id])).map(item => [item.id, saved[item.id]]));
  } catch { /* Optional storage. */ }
  return {};
}
export default function OfficeScene({ onComplete }: { onComplete: () => void }) {
  const [choices, setChoices] = useState(readChoices);
  const [step, setStep] = useState(() => Math.max(0, officeHotspots.findIndex(item => !isCorrect(item, choices))));
  const heading = useRef<HTMLHeadingElement>(null);
  const active = officeHotspots[step];
  const selected = active.options.find(option => option.id === choices[active.id]);
  const count = officeHotspots.filter(item => isCorrect(item, choices)).length;
  const allDone = count === officeHotspots.length;
  const applyChoice = (id: string) => setChoices(current => ({ ...current, [active.id]: id }));
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional storage. */ } }, [choices]);
  const choose = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); if (window.matchMedia('(max-width: 900px)').matches) heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const next = () => choose(step < officeHotspots.length - 1 ? step + 1 : Math.max(0, officeHotspots.findIndex(item => !isCorrect(item, choices))));
  return <section id="office" className="chapter hazard-guided">
    <div className="scene-heading"><p className="eyebrow">01 · Spot hazards</p><h2>Make the space safe.</h2><p><ReadingText>Five hazards. Choose a safe action.</ReadingText></p></div>
    <div className="office-workspace">
      <div className="office-context">
        <div className="scene-frame">
          <img src="/assets/office.webp" alt="Starting office scene: a bag in the walkway, an open drawer, a hanging cable, leaning files and a drink beside the printer."/>
          {officeHotspots.map((item, index) => <button key={item.id} className={`hazard-marker ${index === step ? 'current' : ''} ${isCorrect(item, choices) ? 'done' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Inspect: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}>{isCorrect(item, choices) ? <Check size={20} aria-hidden="true"/> : index + 1}</button>)}
        </div>
        <div className="hazard-picker" role="group" aria-label="Five hazards — explore in any order">
          {officeHotspots.map((item, index) => <button key={item.id} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}><span>{isCorrect(item, choices) ? <Check size={17} aria-hidden="true"/> : index + 1}</span>{item.label}{isCorrect(item, choices) && <span className="sr-only"> — completed</span>}</button>)}
        </div>
        <p className="hazard-scene-note">Starting scene</p>
      </div>
      <div className="hazard-panel">
        <p className="eyebrow">Hazard {step + 1} of 5</p>
        <h3 ref={heading} tabIndex={-1}><ReadingText>{active.title}</ReadingText></h3>
        <p className="hazard-story"><ReadingText>{active.body}</ReadingText></p>
        <div className="hazard-workbench" key={active.id}>
          <p className="hazard-prompt" id={`hazard-prompt-${active.id}`}>{active.prompt}</p>
          <div className="hazard-destinations" role="group" aria-labelledby={`hazard-prompt-${active.id}`}>
            {active.options.map(option => <button className={`hazard-choice ${selected?.id === option.id ? `selected ${option.correct ? 'correct' : 'incorrect'}` : ''}`} key={option.id} aria-pressed={selected?.id === option.id} onClick={() => applyChoice(option.id)}><span>{option.label}</span>{selected?.id === option.id && (option.correct ? <Check size={20} aria-hidden="true"/> : <X size={20} aria-hidden="true"/>)}</button>)}
          </div>
        </div>
        <div className="hazard-feedback" role="status" aria-live="polite" aria-atomic="true">{selected && <div className={`hazard-result ${selected.correct ? 'correct' : 'incorrect'}`}><strong>{selected.correct ? 'Correct' : 'Not quite — try again'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div>}</div>
        <div className="hazard-footer"><p className="scene-counter">{count}/5 completed</p><div>{step > 0 && <button className="text-button" onClick={() => choose(step - 1)}><ArrowLeft size={18}/>Back</button>}{allDone ? <button className="primary" onClick={onComplete}>Continue to Fire <ArrowRight size={19}/></button> : <button className="secondary" onClick={next}>{step < 4 ? 'Next hazard' : 'Review remaining'}<ArrowRight size={19}/></button>}</div></div>
      </div>
    </div>
    <p className="hazard-safety-note"><ReadingText>Can’t fix it safely? Keep others clear and ask for help.</ReadingText></p>
  </section>;
}
