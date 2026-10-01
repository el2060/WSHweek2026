import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import './cubicle.css';
import HazardFocus, { type FocusRegion } from './HazardFocus';

const focusRegions: FocusRegion[] = [
  { x: 10, y: 31, width: 33, height: 64 },
  { x: 21, y: 20, width: 21, height: 18 },
  { x: 85, y: 2, width: 14, height: 23 },
  { x: 72, y: 2, width: 26, height: 85 },
];

const storageKey = 'clte-cubicles-v2';
export const cubicleHazards = [
  { id: 'posture', label: 'Workstation', x: 24, y: 55, title: 'Leaning into a low laptop', prompt: 'You will be working here for a while. What would help?', options: [
    { id: 'adjust', label: 'Adjust the chair and screen; use a separate keyboard and mouse', correct: true, feedback: 'Support your back, keep your feet supported and bring the screen to a comfortable viewing height. Keep the keyboard and mouse within easy reach, and change position regularly.' },
    { id: 'lean', label: 'Lean closer and keep working until the task is finished', correct: false, feedback: 'Holding a bent posture can cause discomfort. Pause to adjust the setup and take regular short breaks from the same position.' },
  ] },
  { id: 'glare', label: 'Screen glare', x: 28, y: 29, title: 'A bright reflection on the screen', prompt: 'The window reflection makes the display hard to read. What should you try?', options: [
    { id: 'brightness', label: 'Turn brightness to maximum and squint through it', correct: false, feedback: 'More brightness may not remove the reflection. Adjust the screen position or blinds so you can read comfortably without leaning or squinting.' },
    { id: 'position', label: 'Reposition the screen and adjust the blinds', correct: true, feedback: 'Position the screen to reduce reflections, often with the window to its side. Adjust blinds and screen brightness for comfortable reading.' },
  ] },
  { id: 'equipment-storage', label: 'Equipment', x: 91, y: 12, title: 'Spare IT equipment stored too high', prompt: 'A desktop PC and monitor are stored above head height. Where should they go?', options: [
    { id: 'lower', label: 'In stable, suitable storage at an accessible height', correct: true, feedback: 'Arrange help to move bulky equipment into suitable storage. Keep it away from edges and avoid lifting it overhead or blocking walkways.' },
    { id: 'push-back', label: 'Push them farther back on the cabinet top', correct: false, feedback: 'That still leaves bulky equipment awkward to reach and lift down. Arrange safe relocation to suitable storage at an accessible height.' },
  ] },
  { id: 'monitor-reach', label: 'Reaching', x: 80, y: 65, title: 'Reaching for a monitor from a chair', prompt: 'A colleague climbs onto a wheeled chair to retrieve the monitor. What should happen next?', options: [
    { id: 'hold', label: 'Ask a colleague to hold the chair still', correct: false, feedback: 'A wheeled chair is not designed as a step. It can roll or tip even when someone holds it. Stop and get suitable access equipment.' },
    { id: 'assistance', label: 'Stop and arrange help with suitable access equipment', correct: true, feedback: 'A monitor is bulky and can throw someone off balance. Ask IT or facilities for help with safe retrieval and relocation. Never use an office chair as a step.' },
  ] },
];
export function clearCubicleProgress() { try { localStorage.removeItem(storageKey); localStorage.removeItem('clte-cubicles-v1'); } catch { /* Optional storage. */ } }
function readChoices(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return Object.fromEntries(cubicleHazards.filter(h => h.options.some(o => o.id === saved[h.id])).map(h => [h.id, saved[h.id]]));
  } catch { /* Optional storage. */ }
  return {};
}
export default function CubicleScene({ onComplete }: { onComplete: () => void }) {
  const [choices, setChoices] = useState(readChoices);
  const [step, setStep] = useState(() => Math.max(0, cubicleHazards.findIndex(h => !choices[h.id])));
  const heading = useRef<HTMLHeadingElement>(null);
  const active = cubicleHazards[step];
  const selected = active.options.find(o => o.id === choices[active.id]);
  const count = cubicleHazards.filter(h => choices[h.id]).length;
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Optional storage. */ } }, [choices]);
  const choose = (index: number) => { setStep(index); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); };
  return <section className="cubicle-scene">
    <div className="cubicle-heading"><div><p className="eyebrow">Spot the hazard · CLTE office</p><h1>Office cubicle hazards</h1></div><span>{count}/4 explored</span></div>
    <div className="cubicle-layout">
      <div className="cubicle-visual"><div className="cubicle-image"><img src="/assets/clte-cubicle-hazards-v2.png" alt="Office cubicles with a low laptop, screen glare, a PC and monitor stored on a high cabinet and a colleague reaching from a wheeled chair."/><HazardFocus key={active.id} region={focusRegions[step]} label={active.label}/>{cubicleHazards.map((h, i) => <button key={h.id} style={{ left: `${h.x}%`, top: `${h.y}%` }} className={`cubicle-marker ${i === step ? 'active' : ''}`} aria-label={`Inspect ${h.title}`} aria-current={i === step ? 'step' : undefined} onClick={() => choose(i)}>{choices[h.id] ? <Check size={20}/> : i + 1}</button>)}</div><div className="cubicle-picker" aria-label="Cubicle hazards">{cubicleHazards.map((h, i) => <button key={h.id} aria-current={i === step ? 'step' : undefined} onClick={() => choose(i)}>{i + 1}. {h.label}</button>)}</div></div>
      <div className="cubicle-panel"><p className="eyebrow">{active.label} · {step + 1} of 4</p><h2 ref={heading} tabIndex={-1}>{active.title}</h2><p>{active.prompt}</p><div className="hazard-destinations">{active.options.map(o => <button key={o.id} className={`hazard-choice ${selected?.id === o.id ? `selected ${o.correct ? 'correct' : 'incorrect'}` : ''}`} aria-pressed={selected?.id === o.id} onClick={() => setChoices(c => ({ ...c, [active.id]: o.id }))}><span>{o.label}</span>{selected?.id === o.id && (o.correct ? <Check/> : <X/>)}</button>)}</div><div aria-live="polite" role="status">{selected && <div className={`hazard-result ${selected.correct ? 'correct' : 'incorrect'}`}><strong>{selected.correct ? 'Why this helps' : 'A safer next step'}</strong><p>{selected.feedback}</p></div>}</div><div className="cubicle-actions">{step > 0 && <button className="text-button" onClick={() => choose(step - 1)}><ArrowLeft size={18}/>Back</button>}{count === 4 ? <button className="primary" onClick={onComplete}>Finish <ArrowRight size={18}/></button> : <button className="secondary" disabled={!selected} onClick={() => choose(step < 3 ? step + 1 : cubicleHazards.findIndex(h => !choices[h.id]))}>Next hazard <ArrowRight size={18}/></button>}</div></div>
    </div>
  </section>;
}



