import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Info, Phone, Wrench } from 'lucide-react';
import { officialInfo } from './config';
import { ReadingText } from './ReadingText';

// Calm working surface: situation → clear cue → one practice action → takeaway.
// A report-label reveal and short feedback entrance make the action visible;
// no grading, competing destinations, real calls or submissions are involved.
const situations = [
  {
    id: 'help', label: 'Help now', icon: Phone,
    image: '/assets/haze-response.png', alt: 'A colleague is breathless outside a campus building, with another staff member beside them.',
    sceneLabel: 'Stay with them. Get urgent help.',
    title: 'A colleague is struggling to breathe.',
    story: 'You are with them on campus. They need urgent help now.',
    cue: 'An emergency needs a call, not a form.',
    destination: 'Emergency ambulance', destinationDetail: officialInfo.ambulanceNumber,
    task: 'Practise what to say',
    record: '“A colleague is having difficulty breathing. We are at [block, level and room], Ngee Ann Polytechnic. Please send an ambulance.”',
    action: 'Practise requesting help', stamp: 'Help request practised',
    takeaway: 'Help first. Reporting comes later.',
    learning: `Call ${officialInfo.ambulanceNumber} immediately and follow the operator’s instructions. Then inform Guard Post at ${officialInfo.emergencyNumber} to help guide responders in.`,
  },
  {
    id: 'injury', label: 'Injury', icon: ClipboardCheck,
    image: '/assets/walkway.webp', alt: 'A student seated after slipping on a wet campus walkway, with staff helping and keeping others clear.',
    sceneLabel: 'Care arranged. Area made safe.',
    title: 'A student has a minor injury.',
    story: 'They slipped on a wet walkway. First aid has been arranged and the area is safe.',
    cue: 'Someone was hurt → record an incident.',
    destination: 'WSH Portal', destinationDetail: 'Incident',
    task: 'Add a label to this practice record',
    record: 'Wet walkway · student injured · first aid arranged',
    action: 'Label as Incident', stamp: 'Incident',
    takeaway: 'Care is underway. Now record the incident.',
    learning: 'Report it promptly in the WSH Portal. Include what happened, where it happened and the care provided.',
  },
  {
    id: 'near-miss', label: 'Near miss', icon: ClipboardCheck,
    image: '/assets/report-near-miss.png', alt: 'A fallen archive box beside an unhurt colleague in an office storage area.',
    sceneLabel: 'A close call. Nobody hurt.',
    title: 'A box falls beside a colleague.',
    story: 'It narrowly misses them. Nobody is hurt and nothing is damaged.',
    cue: 'It nearly hurt someone → record a near miss.',
    destination: 'WSH Portal', destinationDetail: 'Near miss',
    task: 'Add a label to this practice record',
    record: 'Falling box · narrowly missed a colleague · no injury',
    action: 'Label as Near miss', stamp: 'Near miss',
    takeaway: 'No injury, but there is still something to learn.',
    learning: 'Report the near miss in the WSH Portal so the cause can be fixed before someone is hurt.',
  },
  {
    id: 'repair', label: 'Repair', icon: Wrench,
    image: '/assets/report-chair-defect.png', alt: 'An empty chair with a cracked leg, marked out of use, while a staff member prepares a repair request.',
    sceneLabel: 'Out of use. Ready to report.',
    title: 'You spot a cracked chair leg.',
    story: 'Nobody has used the damaged chair or been hurt. It is marked out of use.',
    cue: 'A defect, with no incident → request a repair.',
    destination: 'Fault reporting', destinationDetail: officialInfo.faultNumber,
    task: 'Practise a clear repair request',
    record: '“A chair has a cracked leg at [block, level and room]. It is marked out of use. Please arrange a repair or replacement.”',
    action: 'Practise a repair request', stamp: 'Repair request practised',
    takeaway: 'Keep it out of use until it is safe.',
    learning: `Report the fault at ${officialInfo.faultNumber} or through the official fault-reporting channel. Give the location and describe the defect.`,
  },
];
const storageKey = 'clte-reporting-v1';
export function clearReportingProgress() {
  try { localStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
}
function readProgress(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(value)) return situations.filter(item => value.includes(item.id)).map(item => item.id);
  } catch { /* Continue without saved progress. */ }
  return [];
}

export default function ReportingScene({ onComplete }: { onComplete: () => void }) {
  const [practised, setPractised] = useState(readProgress);
  const [replay, setReplay] = useState(0);
  const situationHeading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(() => Math.max(0, situations.findIndex(item => !practised.includes(item.id))));
  const scenario = situations[step];
  const done = practised.includes(scenario.id);
  const allDone = practised.length === situations.length;
  const Icon = scenario.icon;
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(practised)); } catch { /* Storage is optional. */ } }, [practised]);
  const act = () => { setReplay(value => value + 1); setPractised(current => current.includes(scenario.id) ? current : [...current, scenario.id]); };
  const moveTo = (index: number) => {
    setStep(index);
    requestAnimationFrame(() => { situationHeading.current?.focus({ preventScroll: true }); situationHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const next = () => moveTo(step < situations.length - 1 ? step + 1 : situations.findIndex(item => !practised.includes(item.id)));

  return <section id="reporting" className="reporting-guided">
    <div className="report-heading"><p className="eyebrow">05 · Get help & report</p><h1>Know the next step.</h1><p><ReadingText>Four everyday situations. Try one small action in each.</ReadingText></p></div>
    <div className="report-moments" role="group" aria-label="Reporting situations — explore in any order">
      {situations.map((item, index) => <button key={item.id} aria-current={index === step ? 'step' : undefined} aria-label={`${index + 1} ${item.label}${practised.includes(item.id) ? ' — practised' : ''}`} onClick={() => setStep(index)}>
        <span>{practised.includes(item.id) ? <Check size={18}/> : `0${index + 1}`}</span><strong>{item.label}</strong>
      </button>)}
    </div>
    <p className="report-reassurance"><ReadingText>Explore any situation. No score. Nothing is called or submitted.</ReadingText></p>
    <div className="report-workspace" key={scenario.id}>
      <div className="report-situation">
        <p className="eyebrow">Situation {step + 1} of 4</p>
        <h2 ref={situationHeading} tabIndex={-1}><ReadingText>{scenario.title}</ReadingText></h2>
        <figure className="report-visual"><img src={scenario.image} alt={scenario.alt}/><figcaption>{scenario.sceneLabel}</figcaption></figure>
        <p className="report-story"><ReadingText>{scenario.story}</ReadingText></p>
        <div className="report-cue"><Info size={22}/><div><span>Your cue</span><strong><ReadingText>{scenario.cue}</ReadingText></strong></div></div>
      </div>
      <div className="report-practice">
        <div className="report-destination"><Icon/><div><span>{scenario.destination}</span><strong className={step === 0 || step === 3 ? 'reading-number' : ''}>{scenario.destinationDetail}</strong></div><span className="report-practice-badge">Practice only</span></div>
        <p className="report-task">{scenario.task}</p>
        <div className={`report-ticket ${done ? 'is-labelled' : ''}`}>
          <p><ReadingText>{scenario.record}</ReadingText></p>
          {done && <span key={replay} className="report-stamp"><Check size={19}/>{scenario.stamp}</span>}
        </div>
        <button className={`report-action ${done ? 'practised' : ''}`} onClick={act}>
          {done ? <Check/> : <Icon/>}<span>{done ? 'Practise again' : scenario.action}</span>{!done && <ArrowRight/>}
        </button>
        <div className="report-takeaway" role="status" aria-live="polite" aria-atomic="true">
          {done && <div key={replay}><strong><ReadingText>{scenario.takeaway}</ReadingText></strong><p><ReadingText>{scenario.learning}</ReadingText></p></div>}
        </div>
      </div>
    </div>
    <footer className="report-footer">
      <p className="report-count" aria-live="polite">{practised.length}/4 situations practised{allDone && <span>Ready for a short report practice.</span>}</p>
      <div>{step > 0 && <button className="text-button" onClick={() => moveTo(step - 1)}><ArrowLeft size={19}/>Back</button>}
        {allDone ? <button className="primary" onClick={onComplete}>Continue to report practice <ArrowRight size={20}/></button> : <button className="secondary" onClick={next}>{step < 3 ? 'Next situation' : 'Try an untried situation'}<ArrowRight size={20}/></button>}
      </div>
    </footer>
    <p className="report-boundary"><ReadingText>In real situations, urgent help comes first. An incident may also need a repair; reporting does not replace making the area safe.</ReadingText></p>
  </section>;
}
