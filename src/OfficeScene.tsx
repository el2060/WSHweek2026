import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, Sparkles } from 'lucide-react';
import { officeHotspots } from './config';
import { ReadingText } from './ReadingText';

// Warm, content-first workspace: one scene, a named risk, one practice action.
// Markers change to checks; a short result reveal connects action and takeaway.
// No wrong-answer loop, tiny hidden targets or decorative motion.
const storageKey = 'clte-office-v1';
export function clearOfficeProgress() { try { localStorage.removeItem(storageKey); } catch { /* Optional storage. */ } }
function readProgress(): string[] {
  try { const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (Array.isArray(saved)) return officeHotspots.filter(item => saved.includes(item.id)).map(item => item.id); } catch { /* Optional storage. */ }
  return [];
}

export default function OfficeScene({ onComplete }: { onComplete: () => void }) {
  const [practised, setPractised] = useState(readProgress);
  const [step, setStep] = useState(() => Math.max(0, officeHotspots.findIndex(item => !practised.includes(item.id))));
  const [replay, setReplay] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const active = officeHotspots[step];
  const done = practised.includes(active.id);
  const allDone = practised.length === officeHotspots.length;
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(practised)); } catch { /* Optional storage. */ } }, [practised]);
  const choose = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); if (window.matchMedia('(max-width: 900px)').matches) heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const act = () => { setReplay(value => value + 1); setPractised(current => current.includes(active.id) ? current : [...current, active.id]); };
  const next = () => choose(step < 4 ? step + 1 : officeHotspots.findIndex(item => !practised.includes(item.id)));
  return <section id="office" className="chapter hazard-guided">
    <div className="scene-heading"><p className="eyebrow">01 · Spot hazards</p><h2>Small actions. A safer office.</h2><p><ReadingText>Explore five everyday hazards. Try a simple fix and see why it helps.</ReadingText></p></div>
    <div className="office-workspace">
      <div className="office-context">
        <div className="scene-frame">
          <img src="/assets/office.webp" alt="Office illustration: a bag in the walkway, an open drawer, a hanging cable, leaning files and a drink beside the printer."/>
          {officeHotspots.map((item, index) => <button key={item.id} className={`hazard-marker ${index === step ? 'current' : ''} ${practised.includes(item.id) ? 'done' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Inspect: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}>{practised.includes(item.id) ? <Check size={20}/> : index + 1}</button>)}
        </div>
        <div className="hazard-picker" role="group" aria-label="Five hazards — explore in any order">
          {officeHotspots.map((item, index) => <button key={item.id} aria-current={index === step ? 'step' : undefined} onClick={() => choose(index)}><span>{practised.includes(item.id) ? <Check size={17}/> : index + 1}</span>{item.label}{practised.includes(item.id) && <span className="sr-only"> — practised</span>}</button>)}
        </div>
        <p className="hazard-scene-note"><ReadingText>Tap a number or a name. This illustration shows the starting scene.</ReadingText></p>
      </div>
      <div className="hazard-panel">
        <p className="eyebrow">Hazard {step + 1} of 5 · Practice</p>
        <h3 ref={heading} tabIndex={-1}><ReadingText>{active.title}</ReadingText></h3>
        <p className="hazard-story"><ReadingText>{active.body}</ReadingText></p>
        <div className="hazard-cue"><Info size={22}/><div><span>A simple fix</span><strong><ReadingText>{active.cue}</ReadingText></strong></div></div>
        <button className={`hazard-action ${done ? 'practised' : ''}`} onClick={act}>{done ? <Check/> : <Sparkles/>}<span>{done ? 'Practise again' : active.action}</span>{!done && <ArrowRight/>}</button>
        <div className="hazard-feedback" role="status" aria-live="polite" aria-atomic="true">{done && <div key={replay} className="hazard-result"><span className="hazard-result-label"><Check size={19}/>{active.result}</span><h4><ReadingText>{active.takeaway}</ReadingText></h4><p><ReadingText>{active.learning}</ReadingText></p></div>}</div>
        <div className="hazard-footer"><p className="scene-counter">{practised.length}/5 actions practised</p><div>{step > 0 && <button className="text-button" onClick={() => choose(step - 1)}><ArrowLeft size={18}/>Back</button>}{allDone ? <button className="primary" onClick={onComplete}>Continue to Fire <ArrowRight size={19}/></button> : <button className="secondary" onClick={next}>{step < 4 ? 'Next hazard' : 'Try an untried hazard'}<ArrowRight size={19}/></button>}</div></div>
      </div>
    </div>
    <p className="hazard-safety-note"><ReadingText>Only act if it is safe. If you cannot fix a hazard safely, keep others clear and ask for help.</ReadingText></p>
  </section>;
}
