import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowRight, Check, CirclePlay, ExternalLink, Eye, Flame, HeartHandshake, Info, Lock, MapPin, Menu, Phone, RotateCcw, Sparkles, Wrench, X } from 'lucide-react';
import { officialInfo } from './config';
import OfficeScene, { clearOfficeProgress } from './OfficeScene';
import ExperimentRoomScene, { clearExperimentRoomProgress } from './ExperimentRoomScene';
import { InjuryScene, HazeScene, clearGuidedProgress } from './GuidedScenes';
import { ReadingText } from './ReadingText';
import { isScormActive, readScormProgress, saveScormProgress } from './scorm';
import { scenarios, normalizeProgress, initialProgress, completeActivity, hasAnswer, type Progress, type ScenarioId } from './activityProgress';

type View = 'intro' | ScenarioId | 'guide';

function useSavedProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (isScormActive()) return normalizeProgress(readScormProgress<Progress>());
    try { return normalizeProgress(JSON.parse(localStorage.getItem('clte-safety-progress') || sessionStorage.getItem('clte-safety-progress') || '')); } catch { return initialProgress; }
  });
  useEffect(() => { try { localStorage.setItem('clte-safety-progress', JSON.stringify(progress)); } catch { /* Progress can remain in memory. */ } saveScormProgress(progress); }, [progress]);
  return [progress, setProgress] as const;
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) return null;
  return <a className="guide-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={17} /></a>;
}

function Intro({ onOpen, onReset, progress, notice }: { onOpen: (view: View) => void; onReset: () => void; progress: Progress; notice: string }) {
  const completed = scenarios.filter(scenario => progress[scenario.id]).length;
  const chooseScenario = () => { document.getElementById('scenario-title')?.focus({ preventScroll: true }); document.getElementById('scenarios')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  return <><section id="intro" className="intro pantry-intro">
    <div className="intro-copy">
      <div className="wsh-week-lockup"><strong>WSH Week</strong><b>2026</b></div>
      <p className="eyebrow light">CLTE staff activity</p>
      <h1><span>Workplace safety</span><em>made practical.</em></h1>
      <p className="tagline">Make the call. See what happens.</p>
      <div className="intro-actions"><button className="primary light-button" onClick={chooseScenario}>Choose a scenario<ArrowDown size={19}/></button></div>
    </div>
    <div className="wsh-hero-visual">
      <img src="/assets/clte-pantry-hero.png" alt="Illustration of colleagues in the CLTE pantry, with its patterned tile counter, black pendant lights, book display and white wire chairs." width="1672" height="941" fetchPriority="high"/>
      <p className="pantry-caption"><MapPin size={15} aria-hidden="true"/> CLTE pantry <span>Block 27</span></p>
    </div>
  </section>
  <section id="scenarios" className="scenario-hub" aria-labelledby="scenario-title">
    <div className="scenario-hub-heading"><div><p className="eyebrow">Explore the scenarios</p><h2 id="scenario-title" tabIndex={-1}>Where would you like to start?</h2><p>Choose any scenario. There’s no set order.</p></div><strong className="hub-count">{completed}/{scenarios.length} completed</strong></div>
    {notice && <p className="hub-notice" role="status"><Check aria-hidden="true"/>{notice}</p>}
    {completed === scenarios.length && <p className="hub-finished"><Sparkles aria-hidden="true"/> All done! Revisit any scenario, or check WSH contacts.</p>}
    <div className="scenario-list">{scenarios.map(scenario => <button key={scenario.id} className="scenario-entry" onClick={()=>onOpen(scenario.id)} aria-label={`${progress[scenario.id]?'Revisit':'Open'} ${scenario.title}`}><img src={scenario.image} alt="" loading="lazy"/><span className="scenario-entry-copy"><span className="scenario-entry-meta">{scenario.detail} {progress[scenario.id]&&<span><Check size={16}/>Completed</span>}</span><strong>{scenario.title}</strong><span>{scenario.description}</span></span><ArrowRight aria-hidden="true"/></button>)}</div>
    <div className="home-resources"><div><h3>Need help?</h3><p>Emergency contacts and key actions.</p></div><button className="secondary" onClick={()=>onOpen('guide')}>WSH contacts <ArrowRight/></button></div>
    <button className="intro-reset" onClick={onReset}><RotateCcw/>Reset saved progress</button>
  </section></>;
}

function FireProtocolDialog({ open, recap, onClose }: { open: boolean; recap: boolean; onClose: () => void }) {
  const closeRef=useRef<HTMLButtonElement>(null); const videoRef=useRef<HTMLVideoElement>(null);
  useEffect(()=>{if(open)closeRef.current?.focus();else videoRef.current?.pause()},[open]);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onClose]);
  if(!open)return null;
  return createPortal(<div className="fire-protocol-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="fire-protocol-dialog" role="dialog" aria-modal="true" aria-labelledby="fire-protocol-title" aria-describedby="fire-protocol-description">
      <div className="fire-protocol-head"><div><p className="eyebrow">{recap?'Fire evacuation recap':'Optional reference'}</p><h2 id="fire-protocol-title">Fire emergency protocol</h2><p id="fire-protocol-description">A 33-second overview of the evacuation response.</p></div><button ref={closeRef} className="fire-protocol-close" onClick={onClose} aria-label="Close emergency protocol"><X/></button></div>
      <video ref={videoRef} controls preload="metadata" playsInline poster="/assets/fire-emergency-protocol-cover.png" aria-label="Animated fire emergency protocol overview">
        <source src="/assets/fire-emergency-protocol.mp4" type="video/mp4"/>
        Your browser does not support embedded video.
      </video>
      <div className="fire-protocol-summary" aria-label="Protocol summary"><strong>Leave</strong><span>Follow</span><span>Gather</span><span>Account</span></div>
      <p className="fire-protocol-note"><Info/> Follow fire wardens and posted instructions.</p>
    </section>
  </div>,document.body);
}

function EvacuationScene({ onComplete }: { onComplete: () => void }) {
  const [routeStage,setRouteStage]=useState(0); const [photoIndex,setPhotoIndex]=useState(0); const [answers,setAnswers]=useState<Record<number,string>>(()=>{try{const saved=JSON.parse(localStorage.getItem('clte-fire-answers-v1')||'{}');return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{}}catch{return{}}}); const [mapOpen,setMapOpen]=useState(false); const [protocolOpen,setProtocolOpen]=useState(false);
  const routeStages=[
    {id:'exit',label:'Exit',location:'Block 27 · Pantry',situation:'The fire alarm sounds while you’re in the pantry.',photos:[['/assets/fire-route/route-01.webp','Pantry exit · open-door view'],['/assets/fire-route/route-02.webp','Pantry exit · approach view'],['/assets/fire-route/route-03.webp','Alternative exit · lift lobby view']],prompt:'What do you do first?',choices:[
      {id:'evacuate',label:'Leave by the nearest safe exit',feedback:'Leave now. Follow exit signs and the fire warden—stairs, not lifts.',best:true},
      {id:'bag',label:'Collect your bag from the desk',feedback:'Don’t stop for belongings. Take the nearest safe exit and use stairs, not lifts.',best:false},
    ]},
    {id:'stairs',label:'Stairs',location:'Block 27 · Stairwell',situation:'The stairs are busy as colleagues head down.',photos:[['/assets/fire-route/route-04.webp','Middle staircase · entry'],['/assets/fire-route/route-05.webp','Mezzanine landing'],['/assets/fire-route/route-06.webp','First-floor landing']],prompt:'How do you go down?',choices:[
      {id:'rush',label:'Hurry past others to clear the stairs',feedback:'Rushing past others can cause a fall. Walk steadily and use the handrail.',best:false},
      {id:'steady',label:'Walk steadily and use the handrail',feedback:'A steady pace and the handrail keep everyone moving safely.',best:true},
    ]},
    {id:'ground',label:'Ground',location:'Block 27 · Ground floor',situation:'Your usual path branches away from the evacuation group.',photos:[['/assets/fire-route/route-07.webp','Ground floor · DST Office'],['/assets/fire-route/route-08.webp','Route past Studio 27'],['/assets/fire-route/route-09.webp','Route beside OIC']],prompt:'Which way do you go?',choices:[
      {id:'group',label:'Stay with the group on the walkway',feedback:'This route passes DST Office, Studio 27 and OIC to Block 56—follow the warden.',best:true},
      {id:'own',label:'Take your usual route and meet them later',feedback:'Stick with the group’s route, not a familiar shortcut. Follow the warden.',best:false},
    ]},
    {id:'blk56',label:'Blk 56',location:'Block 56',situation:'A colleague starts towards the crossing in the photo.',photos:[['/assets/fire-route/route-10.webp','Block 56 · crossing beside the walkway']],prompt:'How do you respond?',choices:[
      {id:'follow',label:'Follow them to keep together',feedback:'Stay on the walkway and call them back—this crossing isn’t part of the route.',best:false},
      {id:'stay',label:'Call them back to the walkway',feedback:'Keep the group on the walkway. It’s a safe crossing day-to-day, just not on this route.',best:true},
    ]},
    {id:'junction',label:'Junction',location:'Admin Field approach',situation:'Your group reaches the marked crossing near Admin Field.',photos:[['/assets/fire-route/route-11.webp','T-junction near Admin Field'],['/assets/fire-route/route-12.webp','Zebra crossing to Admin Field']],prompt:'When do you cross?',choices:[
      {id:'follow',label:'As soon as the group ahead moves',feedback:'Don’t assume traffic has stopped. Wait for the warden and check it’s safe.',best:false},
      {id:'walkway',label:'When the warden directs and it is safe',feedback:'Use this marked crossing, not the one at Block 56. Follow the warden and check traffic.',best:true},
    ]},
    {id:'approach',label:'Approach',location:'Admin Field · Zone A',situation:'You’ve reached the field. A colleague stops on the approach walkway.',photos:[['/assets/fire-route/route-13.webp','Walkway around Admin Field']],prompt:'What do you suggest?',choices:[
      {id:'zone',label:'Join CLTE in Zone A',feedback:'Zone A keeps the approach clear and helps CLTE account for everyone.',best:true},
      {id:'walkway',label:'Wait here for the rest of the group',feedback:'Waiting here blocks others. Head to Zone A and join CLTE.',best:false},
    ]},
    {id:'rollcall',label:'Roll call',location:'Admin Field · Zone A',situation:'During roll call, a colleague is unaccounted for.',photos:[['/assets/fire-route/route-14.webp','Admin Field · assembly point']],prompt:'What would help most?',choices:[
      {id:'search',label:'Go back to check their desk',feedback:'Don’t go back in to search. Tell the warden who’s missing and where you last saw them.',best:false},
      {id:'report',label:'Tell the warden where you last saw them',feedback:'Share their name and last known location. Stay with CLTE—don’t go back to search.',best:true},
    ]},
  ];
  const stage=routeStages[routeStage]; const photo=stage.photos[photoIndex]||stage.photos[0]; const selected=stage.choices.find(choice=>choice.id===answers[routeStage]);
  useEffect(()=>{try{localStorage.setItem('clte-fire-answers-v1',JSON.stringify(answers))}catch{/* Optional storage. */}},[answers]);
  const completeCount=routeStages.filter((item,index)=>hasAnswer(item.choices,answers[index])).length; const allAnswered=completeCount===routeStages.length;
  const firstUnanswered=routeStages.findIndex((item,index)=>!hasAnswer(item.choices,answers[index]));
  const openIndex=firstUnanswered===-1?routeStages.length-1:firstUnanswered;
  const reviewNext=()=>selectStage(firstUnanswered<0?0:firstUnanswered);
  const selectStage=(index:number)=>{setRouteStage(index);setPhotoIndex(0);setMapOpen(false)};
  const moveCamera=(event:React.PointerEvent<HTMLElement>)=>{
    if(mapOpen||protocolOpen||event.pointerType!=='mouse'||!window.matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
    const box=event.currentTarget.getBoundingClientRect();
    const x=Math.max(-.5,Math.min(.5,(event.clientX-box.left)/box.width-.5));
    const y=Math.max(-.5,Math.min(.5,(event.clientY-box.top)/box.height-.5));
    event.currentTarget.style.setProperty('--look-x',`${x*-18}px`);event.currentTarget.style.setProperty('--look-y',`${y*-12}px`);
    event.currentTarget.style.setProperty('--tilt-x',`${y*.8}deg`);event.currentTarget.style.setProperty('--tilt-y',`${x*-.8}deg`);
  };
  const resetCamera=(event:React.PointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--look-x','0px');event.currentTarget.style.setProperty('--look-y','0px');event.currentTarget.style.setProperty('--tilt-x','0deg');event.currentTarget.style.setProperty('--tilt-y','0deg')};
  return <section id="evacuation" className={`evacuation pov-response pov-stage-${routeStage} ${allAnswered?'pov-complete':''}`} onPointerMove={moveCamera} onPointerLeave={resetCamera}>
    <div className="pov-camera" key={photo[0]}><img src={photo[0]} alt={photo[1]}/></div><div className="pov-shade" aria-hidden="true"/>
    <div className="pov-hud">
      <div className="pov-status"><span><Flame/> Fire evacuation</span><strong>Block 27 → Zone A</strong></div>
      <div className="pov-tools"><button onClick={()=>setProtocolOpen(true)}><CirclePlay/> Emergency protocol</button><button onClick={()=>setMapOpen(true)}><MapPin/> Route map</button></div>
    </div>
    <div className="pov-context">
      {stage.photos.length>1&&<div className="pov-scene-gallery" aria-label="Real route views">
        <div className="pov-scene-gallery-head"><span><Eye/> Route photos</span><small>{photoIndex+1} of {stage.photos.length}</small></div>
        <div className="pov-scene-thumbnails" style={{gridTemplateColumns:`repeat(${stage.photos.length},minmax(0,1fr))`}}>{stage.photos.map((view,index)=><button key={view[0]} type="button" className={photoIndex===index?'active':''} aria-pressed={photoIndex===index} aria-label={`Show route view ${index+1}: ${view[1]}`} onClick={()=>setPhotoIndex(index)}><img src={view[0]} alt=""/><span>View {index+1}</span></button>)}</div>
        <p className="pov-photo-caption" aria-live="polite">{photo[1]}</p>
      </div>}
    </div>
    <aside className="pov-decision" aria-label={`Decision at ${stage.location}`}>
      <p className="pov-checkpoint">{String(routeStage+1).padStart(2,'0')} / 07 · {stage.location}</p>
      {stage.id==='blk56'&&<div className="route-photo-cue"><Info size={20}/><strong>Do not cross here</strong></div>}
      <p className="pov-situation"><ReadingText>{stage.situation}</ReadingText></p>
      <div className="pov-decision-head"><h3>{stage.prompt}</h3></div>
      <div className="pov-choices">{stage.choices.map((choice,index)=><button key={choice.id} aria-pressed={answers[routeStage]===choice.id} className={answers[routeStage]===choice.id?`selected ${choice.best?'safe':'risk'}`:''} onClick={()=>setAnswers(value=>({...value,[routeStage]:choice.id}))}><span>{answers[routeStage]===choice.id?(choice.best?<Check/>:<X/>):String.fromCharCode(65+index)}</span><strong>{choice.label}</strong></button>)}</div>
      {selected&&<div className={`pov-feedback ${selected.best?'good':'consider'}`} aria-live="polite"><Info/><div><strong>{selected.best?'Why this helps':'A safer next step'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div></div>}
      <div className="pov-actions"><button disabled={routeStage===0} onClick={()=>selectStage(routeStage-1)}><ArrowRight className="turn"/> Back</button>{allAnswered?<><button className="pov-recap-action" onClick={()=>setProtocolOpen(true)}><CirclePlay/> Watch recap</button><button className="pov-complete-action" onClick={onComplete}>Finish & return home <ArrowRight/></button></>:routeStage<routeStages.length-1?<button disabled={!selected} onClick={()=>selectStage(routeStage+1)}>Next checkpoint <ArrowRight/></button>:<button disabled={!selected} onClick={reviewNext}>Next unanswered checkpoint <ArrowRight/></button>}</div>
    </aside>
    <div className="pov-stage-rail" role="tablist" aria-label="Evacuation checkpoints, in order">{routeStages.map((item,index)=>{const done=hasAnswer(item.choices,answers[index]);const locked=index>openIndex;return <button key={item.id} role="tab" aria-selected={routeStage===index} aria-disabled={locked} disabled={locked} className={`${routeStage===index?'active':''} ${done?'done':''}`} onClick={()=>selectStage(index)}><span>{done?<Check/>:locked?<Lock size={14}/>:index+1}</span><strong>{item.label}</strong></button>})}</div>
    {mapOpen&&<div className="pov-map-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMapOpen(false)}}><div className="pov-map-dialog" role="dialog" aria-modal="true" aria-label="Block 27 to Admin Field route map"><button className="sheet-close" onClick={()=>setMapOpen(false)} aria-label="Close route map"><X/></button><img src="/assets/block27-admin-field-route.jpg" alt="Aerial emergency route map from Block 27 to Zone A at Admin Field."/><p><MapPin/><span><strong>Block 27 → Zone A, Admin Field</strong><small><ReadingText>Follow fire wardens and current posted evacuation instructions.</ReadingText></small></span></p></div></div>}
    <FireProtocolDialog open={protocolOpen} recap={allAnswered} onClose={()=>setProtocolOpen(false)}/>
  </section>;
}

function PocketGuide({ onComplete }: { onComplete: () => void }) {
  const [tab,setTab]=useState<'emergency'|'incident'|'hazard'>('emergency');
  const tabs=['emergency','incident','hazard'] as const;
  const moveTab=(event:React.KeyboardEvent<HTMLButtonElement>,current:typeof tab)=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const tablist=event.currentTarget.parentElement;const index=tabs.indexOf(current);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:(index-1+tabs.length)%tabs.length;setTab(tabs[next]);requestAnimationFrame(()=>tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus())};
  const tabButton=(id:typeof tab,label:string,icon:React.ReactNode)=><button id={`guide-tab-${id}`} role="tab" aria-selected={tab===id} aria-controls={`guide-panel-${id}`} tabIndex={tab===id?0:-1} onKeyDown={event=>moveTab(event,id)} onClick={()=>setTab(id)}>{icon}<span>{label}</span></button>;
  return <section id="guide" className="guide interactive-guide">
    <div className="guide-title"><p className="eyebrow">Keep this handy</p><h2>WSH contacts</h2><p>What to do. Who to call.</p></div>
    <div className="guide-tabs" role="tablist" aria-label="WSH contact categories">{tabButton('emergency','Emergency',<Phone/>)}{tabButton('incident','Incident / near miss',<HeartHandshake/>)}{tabButton('hazard','Hazard / defect',<Wrench/>)}</div>
    <div id={`guide-panel-${tab}`} role="tabpanel" aria-labelledby={`guide-tab-${tab}`} className="guide-focus reveal" key={tab}>
      {tab==='emergency'&&<article><p className="eyebrow">Serious medical injury</p><h3>Call <span className="reading-number">{officialInfo.ambulanceNumber}</span></h3><ul><li>Give the exact location</li><li>Call Guard Post: <strong className="reading-number">{officialInfo.emergencyNumber}</strong></li><li>Stay with the person until help arrives</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.emergencyInfo}>Emergency info</ActionLink><ActionLink href={officialInfo.links.oneMap}>Zone A map</ActionLink></div></article>}
      {tab==='incident'&&<article><p className="eyebrow">Incident or near miss</p><h3>Care. Control. Report.</h3><ul><li>Help the person and make the area safe</li><li>Student case? Call SAS: <strong className="reading-number">{officialInfo.sasNumber}</strong></li><li>Report promptly in the WSH Portal</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.wshPortal}>WSH Portal</ActionLink><ActionLink href={officialInfo.links.studentInsurance}>Student insurance</ActionLink></div></article>}
      {tab==='hazard'&&<article><p className="eyebrow">Hazard or defect</p><h3>Call <span className="reading-number">{officialInfo.faultNumber}</span></h3><ul><li>Make the area safer if you can</li><li>Alert the person in charge</li><li>Report the fault</li></ul><ActionLink href={officialInfo.links.faultReport}>Report a fault</ActionLink></article>}
    </div>
    <button className="primary guide-finish" onClick={onComplete}>Back to home <ArrowRight/></button>
  </section>;
}

function ResetDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(open)cancelRef.current?.focus()},[open]);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onCancel()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onCancel]);
  if(!open)return null;
  return <div className="reset-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel()}}><section className="reset-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><RotateCcw/><p className="eyebrow">Start again</p><h2 id="reset-title">Reset your activity?</h2><p id="reset-description">This clears your saved progress and answers, back to 0/5.</p><div><button ref={cancelRef} className="secondary" onClick={onCancel}>Keep progress</button><button className="reset-confirm" onClick={onConfirm}>Reset activity</button></div></section></div>;
}

export default function App() {
  const [progress,setProgress]=useSavedProgress();
  const [menu,setMenu]=useState(false);
  const [resetOpen,setResetOpen]=useState(false);
  const [view,setView]=useState<View>('intro');
  const [notice,setNotice]=useState('');
  const completed=useMemo(()=>scenarios.filter(scenario=>progress[scenario.id]).length,[progress]);
  const open=(next:View)=>{setNotice('');setMenu(false);setView(next)};
  useEffect(()=>{
    setMenu(false);
    const frame=requestAnimationFrame(()=>{
      const target=view==='intro'&&notice?document.getElementById('scenario-title'):document.querySelector<HTMLElement>('main h1, main h2');
      if(view==='intro'&&notice) document.getElementById('scenarios')?.scrollIntoView({behavior:'instant'});
      else window.scrollTo({top:0,behavior:'instant'});
      if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
    });
    return()=>cancelAnimationFrame(frame);
  },[view,notice]);
  const complete=(key:ScenarioId|'guide')=>{
    setProgress(current=>completeActivity(current,key));
    const title=scenarios.find(scenario=>scenario.id===key)?.title;
    setNotice(title?`${title} complete. Choose another scenario anytime.`:'Contacts reviewed—come back anytime.');
    setView('intro');
  };
  const resetProgress=()=>{
    clearGuidedProgress();clearOfficeProgress();clearExperimentRoomProgress();
    try{['clte-hazards-part','clte-safety-progress','clte-fire-answers-v1'].forEach(key=>localStorage.removeItem(key));sessionStorage.removeItem('clte-safety-progress')}catch{/* Storage is optional. */}
    setProgress(initialProgress);setNotice('');setView('intro');setResetOpen(false);
  };
  return <div className="app-shell standalone-app">
    <header>
      <button className="logo" onClick={()=>open('intro')} aria-label="Ngee Ann Polytechnic · CLTE workplace safety activity · Home"><img src="/assets/np-logo.png" alt="Ngee Ann Polytechnic"/></button>
      <nav className={menu?'open':''} aria-label="Scenarios · open in any order">{scenarios.map(scenario=><button key={scenario.id} aria-label={scenario.title} aria-description={progress[scenario.id]?'Completed':'Open scenario'} aria-current={view===scenario.id?'page':undefined} onClick={()=>open(scenario.id)} className={`${view===scenario.id?'current':''} ${progress[scenario.id]?'done':''}`}><span>{scenario.label}</span></button>)}</nav>
      <div className="header-tools"><span aria-live="polite">{completed}/{scenarios.length} completed</span><button className="home-link" onClick={()=>open('intro')} aria-current={view==='intro'?'page':undefined}>Home</button><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div>
    </header>
    <main className="experience-stage"><div key={view} className="view-transition">
      {view==='intro'&&<Intro progress={progress} notice={notice} onReset={()=>setResetOpen(true)} onOpen={open}/>}
      {view==='office'&&<OfficeScene onComplete={()=>complete('office')}/>}
      {view==='experiment'&&<ExperimentRoomScene onBack={()=>open('intro')} onComplete={()=>complete('experiment')}/>}
      {view==='evacuation'&&<EvacuationScene onComplete={()=>complete('evacuation')}/>}
      {view==='walkway'&&<InjuryScene onComplete={()=>complete('walkway')}/>}
      {view==='haze'&&<HazeScene onComplete={()=>complete('haze')}/>}
      {view==='guide'&&<PocketGuide onComplete={()=>complete('guide')}/>}
    </div></main>
    <ResetDialog open={resetOpen} onCancel={()=>setResetOpen(false)} onConfirm={resetProgress}/>
  </div>;
}
