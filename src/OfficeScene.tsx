import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { officeHotspots } from './config';
import { ReadingText } from './ReadingText';

// One short situation, two safe alternatives, one concise feedback message.
// No movement, scoring, drag-and-drop or repeated instruction panel.
const storageKey = 'clte-office-v2';
export function clearOfficeProgress() { try { ['clte-office-v1', storageKey].forEach(key => localStorage.removeItem(key)); } catch { /* Optional storage. */ } }
function readChoices(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(officeHotspots.filter(item => item.options.some(option => option.id === saved[item.id])).map(item => [item.id, saved[item.id]]));
  } catch { /* Optional storage. */ }
  return {};
}
export default function OfficeScene({ onComplete }: { onComplete: () => void }) {
  const [choices, setChoices] = useState(readChoices);
  const [step, setStep] = useState(() => Math.max(0, officeHotspots.findIndex(item => !choices[item.id])));
  const heading = useRef<HTMLHeadingElement>(null);
  const active = officeHotspots[step];
  const selected = active.options.find(option => option.id === choices[active.id]);
  const count = Object.keys(choices).length;
  const allDone = count === officeHotspots.length;
  const applyChoice = (id: string) => setChoices(current => ({ ...current, [active.id]: id }));
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional storage. */ } }, [choices]);
  const choose = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); if (window.matchMedia('(max-width: 900px)').matches) heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const next = () => choose(step < 4 ? step + 1 : officeHotspots.findIndex(item => !choices[item.id]));
  return <section id="office" className="chapter hazard-guided">
    <div className="scene-heading"><p className="eyebrow">01 · Spot hazards</p><h2>Make the space safe.</h2><p><ReadingText>Five hazards. Choose a safe action.</ReadingText></p></div>
    <div className="office-workspace">
      <div className="office-context">
        <div className="scene-frame">
          <img src="/assets/office.webp" alt="Starting office scene: a bag in the walkway, an open drawer, a hanging cable, leaning files and a drink beside the printer."/>
          {officeHotspots.map((item, index) => <button key={item.id} className={`hazard-marker ${index === step ? 'current' : ''} ${choices[item.id] ? 'done' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Inspect: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}>{choices[item.id] ? <Check size={20}/> : index + 1}</button>)}
        </div>
        <div className="hazard-picker" role="group" aria-label="Five hazards — explore in any order">
          {officeHotspots.map((item, index) => <button key={item.id} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}><span>{choices[item.id] ? <Check size={17}/> : index + 1}</span>{item.label}{choices[item.id] && <span className="sr-only"> — practised</span>}</button>)}
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
            {active.options.map(option => <button className={`hazard-choice ${selected?.id === option.id ? 'selected' : ''}`} key={option.id} aria-pressed={selected?.id === option.id} onClick={() => applyChoice(option.id)}><span>{option.label}</span>{selected?.id === option.id && <Check size={20}/>}</button>)}
          </div>
          <p className="hazard-choice-note">Both options work here.</p>
        </div>
        <div className="hazard-feedback" role="status" aria-live="polite" aria-atomic="true">{selected && <div className="hazard-result"><p><ReadingText>{selected.feedback}</ReadingText></p></div>}</div>
        <div className="hazard-footer"><p className="scene-counter">{count}/5 practised</p><div>{step > 0 && <button className="text-button" onClick={() => choose(step - 1)}><ArrowLeft size={18}/>Back</button>}{allDone ? <button className="primary" onClick={onComplete}>Continue to Fire <ArrowRight size={19}/></button> : <button className="secondary" onClick={next}>{step < 4 ? 'Next hazard' : 'Try an untried hazard'}<ArrowRight size={19}/></button>}</div></div>
      </div>
    </div>
    <p className="hazard-safety-note"><ReadingText>Can’t fix it safely? Keep others clear and ask for help.</ReadingText></p>
  </section>;
}
