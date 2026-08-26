import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, Info, X } from 'lucide-react';
import { officialInfo } from './config';
import { ReadingText } from './ReadingText';

const examples = {
  location: 'Wet walkway beside Block 73',
  account: 'A student slipped on the wet walkway beside Block 73 during wet weather on 27 April.',
  actions: 'Checked on the student, kept others clear and arranged first-aid support.',
};

export default function PracticeReport({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [data, setData] = useState({ reportType: '', nature: '', place: '', location: '', severity: '', person: '', account: '', actions: '' });
  const previewRef = useRef<HTMLElement>(null);
  const fields: { key: keyof typeof data; label: string; step: number }[] = [
    { key: 'reportType', label: 'Report type', step: 0 }, { key: 'nature', label: 'Nature', step: 0 },
    { key: 'place', label: 'Place', step: 1 }, { key: 'location', label: 'Exact location', step: 1 },
    { key: 'severity', label: 'Injury', step: 1 }, { key: 'person', label: 'Person', step: 1 },
    { key: 'account', label: 'What happened', step: 2 }, { key: 'actions', label: 'What you did', step: 2 },
  ];
  const missing = fields.filter(field => !data[field.key].trim());
  const stepReady = [0, 1, 2].map(index => !missing.some(field => field.step === index));
  const choose = (key: keyof typeof data, value: string) => { setData(current => ({ ...current, [key]: value })); setReview(false); };
  const changeStep = (index: number) => { setStep(index); setReview(false); };
  useEffect(() => {
    if (!review) return;
    previewRef.current?.focus({ preventScroll: true });
    previewRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [review]);
  const choices = (label: string, key: keyof typeof data, items: string[]) => <fieldset className="choice-field"><legend>{label}</legend><div>{items.map(item => <button type="button" key={item} aria-pressed={data[key] === item} className={data[key] === item ? 'selected' : ''} onClick={() => choose(key, item)}>{data[key] === item && <Check/>}<span>{item}</span></button>)}</div></fieldset>;
  const exampleButton = (key: keyof typeof examples, label: string) => <button type="button" className="text-button practice-example" onClick={() => choose(key, examples[key])}>Use example {label}</button>;
  const display = (value: string) => value.trim() || 'Not entered yet';

  return <section className="practice mock-report" id="practice">
    <div className="simulation-banner"><Info/><span><strong>Practice only</strong> · Nothing is submitted. Choose your own answers.</span></div>
    <div className="practice-case"><strong>Your practice case</strong><p><ReadingText>27 April, wet weather: a student slips on the walkway beside Block 73 and has a minor injury. You check on them, keep others clear and arrange first-aid support.</ReadingText></p><span>Use these case details. No names or personal contact details needed.</span></div>
    <div className="mock-shell">
      <aside className="mock-steps"><p className="eyebrow">Quick report</p><h3>Wet walkway</h3>{['Type', 'Impact', 'Details'].map((label, index) => <button key={label} aria-current={step === index ? 'step' : undefined} onClick={() => changeStep(index)} className={`${step === index ? 'current' : ''} ${stepReady[index] ? 'done' : ''}`}><span>{stepReady[index] ? <Check/> : index + 1}</span>{label}</button>)}</aside>
      <div className="mock-panel"><div className="step-counter">{step + 1} / 3</div>
        {step === 0 && <div className="mock-step reveal"><p className="eyebrow">Step 1</p><h2>What happened?</h2>{choices('Report type', 'reportType', ['Incident', 'Near miss'])}{choices('Nature', 'nature', ['Fall, trip and slip', 'Medical condition', 'Other'])}{data.reportType === 'Near miss' && <div className="learning-feedback urgent"><Info/><span><strong>Use “Incident” for this case:</strong> the student was injured.</span></div>}</div>}
        {step === 1 && <div className="mock-step reveal"><p className="eyebrow">Step 2</p><h2>Where and who?</h2>{choices('Place', 'place', ['Common area', 'Office', 'Classroom / LT'])}<label className="mock-input"><span>Exact location</span><input value={data.location} placeholder="Block or landmark" onChange={event => choose('location', event.target.value)}/></label>{exampleButton('location', 'location')}{choices('Injury', 'severity', ['No injury', 'Minor injury', 'Major injury'])}{choices('Person', 'person', ['NP Student', 'NP Staff', 'Visitor / Public'])}{data.severity === 'Major injury' && <div className="learning-feedback urgent"><Info/><span><strong>In a real emergency:</strong> call {officialInfo.ambulanceNumber}, then Guard Post at {officialInfo.emergencyNumber}. This practice case describes a minor injury.</span></div>}</div>}
        {step === 2 && <div className="mock-step reveal"><p className="eyebrow">Step 3</p><h2>Add the essentials</h2><label className="mock-input"><span>What happened?</span><textarea value={data.account} maxLength={360} placeholder="Briefly describe the incident from the practice case" onChange={event => choose('account', event.target.value)}/><small>{data.account.length}/360</small></label>{exampleButton('account', 'description')}<label className="mock-input"><span>What did you do?</span><textarea value={data.actions} maxLength={300} placeholder="Describe the care and safety actions taken" onChange={event => choose('actions', event.target.value)}/><small>{data.actions.length}/300</small></label>{exampleButton('actions', 'actions')}<div className="example-attachment"><ClipboardCheck/><span><strong>No photo attached</strong><small>In a real report, you can include a relevant photo. No upload is needed here.</small></span></div></div>}
        <div className="mock-nav">{step > 0 && <button className="secondary" onClick={() => changeStep(step - 1)}>Back</button>}{step < 2 ? <button className="primary" onClick={() => changeStep(step + 1)}>Next <ArrowRight/></button> : <button className="primary" onClick={() => setReview(true)}>Review my practice report</button>}</div>
      </div>
      {review && <aside ref={previewRef} tabIndex={-1} className="report-preview mock-preview reveal" aria-label="Practice report review"><button className="sheet-close" onClick={() => setReview(false)} aria-label="Close report preview"><X/></button><p className="eyebrow">Practice review · not submitted</p><h3>{data.nature || 'Your practice report'}</h3><dl><dt>Type</dt><dd>{display(data.reportType)} · {display(data.severity)}</dd><dt>Place</dt><dd>{display(data.place)}</dd><dt>Where / when</dt><dd>{display(data.location)} · 27 April, wet weather</dd><dt>Who</dt><dd>{display(data.person)}</dd><dt>What happened</dt><dd>{display(data.account)}</dd><dt>Action</dt><dd>{display(data.actions)}</dd></dl>{missing.length ? <div className="practice-missing" role="status"><strong>A few details still to add</strong><p>{missing.map(field => field.label).join(' · ')}</p><button className="secondary" onClick={() => changeStep(missing[0].step)}>Add missing details <ArrowRight/></button></div> : <><div className="completed"><Check/><strong>Practice details entered</strong><p><ReadingText>For a real report, check that every detail is accurate before submitting.</ReadingText></p></div><button className="primary" onClick={onComplete}>Continue to contacts <ArrowRight/></button></>}</aside>}
    </div>
  </section>;
}
