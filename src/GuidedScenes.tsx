import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, CloudFog, Info, MapPin, MessageCircle, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { officialInfo } from './config';
import { ReadingText } from './ReadingText';

type MomentState = { done: boolean[]; plan: 'indoors' | 'postpone' | null };
const blank = (): MomentState => ({ done: [false, false, false], plan: null });
const progressKey = (kind: string) => `clte-guided-v1-${kind}`;

export function clearGuidedProgress() {
  try { ['injury', 'haze'].forEach(kind => localStorage.removeItem(progressKey(kind))); } catch { /* Storage is optional. */ }
}

function useMoments(kind: string) {
  const [state, setState] = useState<MomentState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey(kind)) || 'null');
      if (saved && Array.isArray(saved.done) && saved.done.length === 3 && saved.done.every((value: unknown) => typeof value === 'boolean')) {
        return { done: saved.done, plan: ['indoors', 'postpone'].includes(saved.plan) ? saved.plan : null };
      }
    } catch { /* Continue without saved progress. */ }
    return blank();
  });
  const [step, setStep] = useState(() => Math.max(0, state.done.findIndex(done => !done)));
  useEffect(() => { try { localStorage.setItem(progressKey(kind), JSON.stringify(state)); } catch { /* Private browsing can disable storage. */ } }, [kind, state]);
  const act = (plan?: MomentState['plan']) => setState(current => ({
    done: current.done.map((done, index) => index === step || done),
    plan: plan ?? current.plan,
  }));
  return { state, step, setStep, act };
}

function MomentNav({ labels, step, done, onChange }: { labels: string[]; step: number; done: boolean[]; onChange: (step: number) => void }) {
  return <div className="moment-navigation">
    <div className="moment-nav" role="group" aria-label="Guided moments — explore in any order">
      {labels.map((label, index) => <button key={label} aria-current={step === index ? 'step' : undefined} onClick={() => onChange(index)} className={`${step === index ? 'current' : ''} ${done[index] ? 'done' : ''}`}>
        <span>{done[index] ? <Check size={18}/> : `0${index + 1}`}</span><strong>{label}</strong>{done[index] && <span className="sr-only"> — practised</span>}
      </button>)}
    </div>
  </div>;
}

function Takeaway({ done, title, children }: { done: boolean; title: string; children: string }) {
  return <div className={`moment-takeaway ${done ? 'is-visible' : ''}`} role="status" aria-atomic="true">
    {done && <><span className="takeaway-icon"><Check/></span><div><strong>{title}</strong><p><ReadingText>{children}</ReadingText></p></div></>}
  </div>;
}

function MomentFooter({ step, done, onChange, onComplete, next }: { step: number; done: boolean[]; onChange: (step: number) => void; onComplete: () => void; next: string }) {
  const allDone = done.every(Boolean);
  return <div className="moment-footer">
    <span className="moment-count">{done.filter(Boolean).length}/3 moments practised</span>
    <div>{step > 0 && <button className="text-button" onClick={() => onChange(step - 1)}><ArrowLeft size={18}/> Back</button>}
      {allDone ? <button className="primary" onClick={onComplete}>Continue to {next} <ArrowRight size={19}/></button>
        : <button className="secondary" onClick={() => onChange(step < 2 ? step + 1 : done.findIndex(value => !value))}>{step < 2 ? 'Next moment' : 'Try remaining moment'}<ArrowRight size={19}/></button>}
    </div>
  </div>;
}

function HelpPractice({ emergency, done, onAct }: { emergency: boolean; done: boolean; onAct: () => void }) {
  return <div className="help-practice">
    <div className="practice-recipient"><Phone size={22}/><div><span>{emergency ? 'Emergency ambulance' : 'Nearby colleague / first aider'}</span><strong>{emergency ? officialInfo.ambulanceNumber : 'Ask for first-aid support'}</strong></div></div>
    <blockquote>{emergency ? '“A colleague is having difficulty breathing. We are at Ngee Ann Polytechnic, [block, level and room]. They are awake. Please send an ambulance.”' : '“A student has slipped on the wet walkway beside Block 73. They are awake and their ankle hurts. Could you arrange first-aid support? I’ll stay with them.”'}</blockquote>
    <button className={`primary practice-action ${done ? 'acted' : ''}`} onClick={onAct}>{done ? <Check size={20}/> : <Phone size={20}/>} {done ? 'Practise again' : emergency ? 'Practise requesting an ambulance' : 'Practise asking for help'}</button>
    <p className="practice-disclaimer">Practice only · no call is made.</p>
  </div>;
}

export function InjuryScene({ onComplete }: { onComplete: () => void }) {
  const { state, step, setStep, act } = useMoments('injury');
  const done = state.done[step];
  const titles = ['Start with the person', 'Make space for safety', 'Ask for a helping hand'];
  return <section className="guided-scene injury-guided" id="walkway">
    <div className="guided-heading"><p className="eyebrow">03 · Injury response</p><h1><span className="reading-phrase">A little care.</span>{' '}<span className="reading-phrase">A safer moment.</span></h1><p><ReadingText>A student has slipped on a wet walkway.</ReadingText></p></div>
    <MomentNav labels={['Check in', 'Keep clear', 'Get help']} step={step} done={state.done} onChange={setStep}/>
    <div className="guided-workspace">
      <aside className="moment-context" aria-label="Scene context">
        <div className={`supporting-scene ${state.done[1] ? 'area-protected' : ''}`}><img src="/assets/walkway.webp" alt="A colleague beside a seated student on a wet campus walkway."/>{state.done[1] && <span className="keep-clear-marker"><ShieldCheck size={17}/> Keep clear</span>}</div>
        <p className="context-location"><MapPin size={17}/> Walkway beside Block 73</p>
        <p><ReadingText>{step === 0 ? 'Awake and seated. Approach only if it is safe.' : step === 1 ? 'The tiles are wet. People are approaching.' : 'Stay with the student while help is arranged.'}</ReadingText></p>
      </aside>
      <div className="moment-panel">
        <div className="moment-body" key={step}>
          <p className="eyebrow">Moment 0{step + 1}</p><h2>{titles[step]}</h2>
          {step === 0 && <><p className="moment-cue">Check how they feel. Don’t ask them to stand.</p>
            <button className={`check-in-action ${done ? 'acted' : ''}`} onClick={() => act()}><span className="person-disc"><UserRound/></span><span><small>Tap to check in</small><strong>“Are you okay? I’m here to help.”</strong></span><MessageCircle/></button>
          </>}
          {step === 1 && <><p className="moment-cue"><ReadingText>Ask someone to guide people around the wet area.</ReadingText></p>
            <button role="switch" aria-checked={done} aria-label="Keep-clear marker" className={`keep-clear-control ${done ? 'acted' : ''}`} onClick={() => act()}><ShieldCheck/><span><strong>Keep-clear marker</strong><small>{done ? 'In place · people redirected' : 'Tap to activate'}</small></span><span className="visual-switch" aria-hidden="true"><i/></span></button>
          </>}
          {step === 2 && <><p className="moment-cue">The student is awake and breathing normally. Ask for first-aid support and say where you are.</p><HelpPractice emergency={false} done={done} onAct={() => act()}/></>}
        </div>
        <Takeaway done={done} title={['“My ankle hurts. Thank you for staying.”', 'Space made safer.', 'Clear words help people respond.'][step]}>
          {step === 0 ? 'Stay calm and avoid moving them unnecessarily. Care comes before photos or paperwork.' : step === 1 ? 'A marker warns people; someone guiding them around the wet area helps prevent another slip.' : 'Say what happened, where you are and what help is needed. After care and safety are addressed, report the incident promptly in the WSH Portal.'}
        </Takeaway>
        <MomentFooter step={step} done={state.done} onChange={setStep} onComplete={onComplete} next="Haze"/>
      </div>
    </div>
    <p className="guided-safety-note"><Info size={19}/><span><strong>Serious injury or difficulty breathing?</strong> Call {officialInfo.ambulanceNumber} immediately, give the exact location, then inform Guard Post at {officialInfo.emergencyNumber}. Don’t wait to complete these moments.</span></p>
  </section>;
}

export function HazeScene({ onComplete }: { onComplete: () => void }) {
  const { state, step, setStep, act } = useMoments('haze');
  const done = state.done[step];
  const titles = ['Move the activity indoors or postpone it', 'Move together into cleaner air', 'Breathing difficulty? Get help now.'];
  return <section className="guided-scene haze-guided" id="haze">
    <div className="guided-heading"><p className="eyebrow">04 · Haze response</p><h1><span className="reading-phrase">Change the plan.</span>{' '}<span className="reading-phrase">Care for each other.</span></h1><p><ReadingText>It’s hazy. A colleague with asthma feels unwell.</ReadingText></p></div>
    <MomentNav labels={['Adjust the plan', 'Move indoors', 'Get help']} step={step} done={state.done} onChange={setStep}/>
    <div className="guided-workspace">
      <aside className="moment-context" aria-label="Scene context">
        <div className="supporting-scene"><img src="/assets/haze-response.png" alt="Illustrated colleagues on a hazy campus."/></div>
        <p className="context-location"><CloudFog size={18}/> A hazy day on campus</p>
        <p><ReadingText>{step === 0 ? 'An outdoor activity is planned. Your colleague is coughing and light-headed.' : step === 1 ? 'They are awake and able to walk with you.' : 'Your colleague is now struggling to breathe. Get urgent help.'}</ReadingText></p>
      </aside>
      <div className="moment-panel">
        <div className="moment-body" key={step}>
          <p className="eyebrow">Moment 0{step + 1}</p><h2>{titles[step]}</h2>
          {step === 0 && <><p className="moment-cue">Move it indoors or postpone it. Either works here.</p>
            <div className="activity-plan"><div className="plan-heading"><span>Today’s staff activity</span><strong className={done ? 'plan-updated' : ''}>{state.plan === 'indoors' ? 'Indoors · plan updated' : state.plan === 'postpone' ? 'Postponed · plan updated' : 'Outdoors · needs a change'}</strong></div>
              <div className="plan-controls" role="group" aria-label="Adjust the activity plan"><button aria-pressed={state.plan === 'indoors'} className={state.plan === 'indoors' ? 'selected' : ''} onClick={() => act('indoors')}><Building2/>Move it indoors</button><button aria-pressed={state.plan === 'postpone'} className={state.plan === 'postpone' ? 'selected' : ''} onClick={() => act('postpone')}><ArrowRight/>Postpone it</button></div>
            </div>
          </>}
          {step === 1 && <><p className="moment-cue">Move together to the nearby indoor space with cleaner air.</p>
            <div className={`shelter-interaction ${done ? 'is-indoors' : ''}`}><div className="shelter-labels"><span><CloudFog/>Outdoors</span><span><Building2/>Indoor space</span></div><div className="shelter-track" aria-hidden="true"><span className="colleague-token"><UserRound/></span><span className="shelter-destination"><Building2/></span></div><p className="shelter-status">{done ? 'Together, indoors. Stay and check how they feel.' : 'A short move, with someone alongside.'}</p>
              <button className="primary" onClick={() => act()}>{done ? <Check/> : <ArrowRight/>}{done ? 'Colleague is indoors' : 'Move together indoors'}</button>
            </div>
          </>}
          {step === 2 && <><p className="moment-cue">Call {officialInfo.ambulanceNumber} immediately. Share the symptoms and exact location; follow the operator’s instructions.</p><HelpPractice emergency done={done} onAct={() => act()}/></>}
        </div>
        <Takeaway done={done} title={['Less exposure. A more considerate plan.', 'Stay together and check in.', 'Urgent help first. Keep the location clear.'][step]}>
          {step === 0 ? 'Both changes reduce outdoor exposure. Check current NEA advice when planning activities, and take extra care with colleagues who have asthma.' : step === 1 ? 'An indoor space with cleaner air helps reduce exposure. If symptoms persist, seek medical advice; difficulty breathing needs emergency help immediately.' : `After calling ${officialInfo.ambulanceNumber}, inform Guard Post at ${officialInfo.emergencyNumber} so responders can be guided in. Stay with your colleague; don’t send them home alone.`}
        </Takeaway>
        <MomentFooter step={step} done={state.done} onChange={setStep} onComplete={onComplete} next="Report"/>
      </div>
    </div>
    <p className="guided-safety-note"><Info size={19}/><span><strong>Symptoms come first.</strong> Don’t wait for an air-quality reading if someone is struggling to breathe. <a href="https://www.haze.gov.sg/" target="_blank" rel="noreferrer">NEA haze advice</a> · <a href="https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services" target="_blank" rel="noreferrer">When to call 995</a></span></p>
  </section>;
}
