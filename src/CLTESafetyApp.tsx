import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowRight, Check, CirclePlay, ExternalLink, Eye, Flame, HeartHandshake, Info, MapPin, Menu, Phone, RotateCcw, Sparkles, Wrench, X } from 'lucide-react';
import { officialInfo } from './config';
import OfficeScene, { clearOfficeProgress } from './OfficeScene';
import ExperimentRoomScene, { clearExperimentRoomProgress } from './ExperimentRoomScene';
import { InjuryScene, HazeScene, clearGuidedProgress } from './GuidedScenes';
import PracticeReport from './PracticeReport';
import ReportingScene, { clearReportingProgress } from './ReportingScene';
import { ReadingText } from './ReadingText';
import { isScormActive, readScormProgress, saveScormProgress } from './scorm';

type Progress = { office: boolean; walkway: boolean; haze: boolean; evacuation: boolean; reporting: boolean; practice: boolean; guide: boolean; completion: boolean };
type View = 'intro' | 'office' | 'walkway' | 'haze' | 'evacuation' | 'reporting' | 'practice' | 'guide' | 'completion';
type HazardPart = 'office' | 'experiment';
const initialProgress: Progress = { office: false, walkway: false, haze: false, evacuation: false, reporting: false, practice: false, guide: false, completion: false };

function useSavedProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (isScormActive()) return { ...initialProgress, ...(readScormProgress<Progress>() ?? {}) };
    try { return { ...initialProgress, ...JSON.parse(localStorage.getItem('clte-safety-progress') || sessionStorage.getItem('clte-safety-progress') || '') } as Progress; } catch { return initialProgress; }
  });
  useEffect(() => { try { localStorage.setItem('clte-safety-progress', JSON.stringify(progress)); } catch { /* Progress can remain in memory. */ } saveScormProgress(progress); }, [progress]);
  return [progress, setProgress] as const;
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) return null;
  return <a className="guide-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={17} /></a>;
}

function Intro({ onStart, onReset, startLabel, statusText, canReset }: { onStart: () => void; onReset: () => void; startLabel: string; statusText: string; canReset: boolean }) {
  return <section id="intro" className="intro">
    <div className="intro-copy">
      <div className="wsh-week-lockup"><strong>WSH Week</strong><b>2026</b></div>
      <p className="eyebrow light">CLTE staff activity</p>
      <h1><span>Workplace safety</span><em>made practical.</em></h1>
      <p className="tagline"><span className="reading-phrase">Make the call in five practical</span>{' '}<span className="reading-phrase">workplace safety scenarios.</span></p>
      <div className="intro-actions"><button className="primary light-button" onClick={onStart}><span>{startLabel}</span><ArrowDown size={19}/></button>{canReset&&<button className="intro-reset" onClick={onReset}><RotateCcw/><span>Start again</span></button>}</div>
      {statusText&&<p className="intro-note" aria-live="polite">{statusText}</p>}
    </div>
    <div className="wsh-hero-visual" aria-hidden="true">
      <img src="/assets/wsh-week-hero.png" alt=""/>
    </div>
  </section>;
}

function HazardsExperience({ part, onPartChange, onComplete }: { part: HazardPart; onPartChange: (part: HazardPart) => void; onComplete: () => void }) {
  return part==='office'?<OfficeScene onComplete={()=>onPartChange('experiment')} nextLabel="Enter Experiment Room"/>:<ExperimentRoomScene onBack={()=>onPartChange('office')} onComplete={onComplete}/>;
}

function FireProtocolDialog({ open, recap, onClose }: { open: boolean; recap: boolean; onClose: () => void }) {
  const closeRef=useRef<HTMLButtonElement>(null); const videoRef=useRef<HTMLVideoElement>(null);
  useEffect(()=>{if(open)closeRef.current?.focus();else videoRef.current?.pause()},[open]);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onClose]);
  if(!open)return null;
  return createPortal(<div className="fire-protocol-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="fire-protocol-dialog" role="dialog" aria-modal="true" aria-labelledby="fire-protocol-title" aria-describedby="fire-protocol-description">
      <div className="fire-protocol-head"><div><p className="eyebrow">{recap?'Scenario 02 recap':'Optional reference'}</p><h2 id="fire-protocol-title">Fire emergency protocol</h2><p id="fire-protocol-description">A 33-second visual overview of the CLTE office evacuation response.</p></div><button ref={closeRef} className="fire-protocol-close" onClick={onClose} aria-label="Close emergency protocol"><X/></button></div>
      <video ref={videoRef} controls preload="metadata" playsInline poster="/assets/fire-emergency-protocol-cover.png" aria-label="Animated fire emergency protocol overview">
        <source src="/assets/fire-emergency-protocol.mp4" type="video/mp4"/>
        Your browser does not support embedded video.
      </video>
      <div className="fire-protocol-summary" aria-label="Protocol summary"><strong>Leave</strong><span>Follow</span><span>Gather</span><span>Account</span></div>
      <p className="fire-protocol-note"><Info/> Follow fire wardens and current posted evacuation instructions.</p>
    </section>
  </div>,document.body);
}

function EvacuationScene({ onComplete }: { onComplete: () => void }) {
  const [routeStage,setRouteStage]=useState(0); const [photoIndex,setPhotoIndex]=useState(0); const [answers,setAnswers]=useState<Record<number,string>>({}); const [mapOpen,setMapOpen]=useState(false); const [protocolOpen,setProtocolOpen]=useState(false);
  const routeStages=[
    {id:'exit',label:'Exit',location:'Block 27 · Pantry',situation:'The fire alarm sounds while you’re in the pantry.',photos:[['/assets/fire-route/route-01.webp','Pantry exit · open-door view'],['/assets/fire-route/route-02.webp','Pantry exit · approach view'],['/assets/fire-route/route-03.webp','Alternative exit · lift lobby view']],prompt:'What do you do first?',choices:[
      {id:'evacuate',label:'Leave by the nearest safe exit',feedback:'Leave promptly. Follow exit signs and the fire warden. Use stairs, not lifts.',best:true},
      {id:'bag',label:'Collect your bag from the desk',feedback:'Don’t delay to collect belongings. Leave by a safe exit and use stairs, not lifts.',best:false},
    ]},
    {id:'stairs',label:'Stairs',location:'Block 27 · Stairwell',situation:'The stairs are busy as colleagues head down.',photos:[['/assets/fire-route/route-04.webp','Middle staircase · entry'],['/assets/fire-route/route-05.webp','Mezzanine landing'],['/assets/fire-route/route-06.webp','First-floor landing']],prompt:'How do you go down?',choices:[
      {id:'rush',label:'Hurry past others to clear the stairs',feedback:'Rushing past others can cause a fall. Walk steadily with the group and use the handrail.',best:false},
      {id:'steady',label:'Walk steadily and use the handrail',feedback:'A steady pace and the handrail help prevent falls without disrupting the people behind you.',best:true},
    ]},
    {id:'ground',label:'Ground',location:'Block 27 · Ground floor',situation:'Your usual path branches away from the evacuation group.',photos:[['/assets/fire-route/route-07.webp','Ground floor · DST Office'],['/assets/fire-route/route-08.webp','Route past Studio 27'],['/assets/fire-route/route-09.webp','Route beside OIC']],prompt:'Which way do you go?',choices:[
      {id:'group',label:'Stay with the group on the walkway',feedback:'This route passes DST Office, Studio 27 and OIC towards Block 56. Follow the warden’s directions.',best:true},
      {id:'own',label:'Take your usual route and meet them later',feedback:'Use the designated route with the group, not a familiar shortcut. Follow the warden’s directions.',best:false},
    ]},
    {id:'blk56',label:'Blk 56',location:'Block 56',situation:'A colleague starts towards the crossing in the photo.',photos:[['/assets/fire-route/route-10.webp','Block 56 · crossing beside the walkway']],prompt:'How do you respond?',choices:[
      {id:'follow',label:'Follow them to keep together',feedback:'Stay on the walkway. Call them back—the crossing in this photo is not part of this route.',best:false},
      {id:'stay',label:'Call them back to the walkway',feedback:'Keep the group on the walkway. A crossing can be safe for everyday use but not be part of this evacuation route.',best:true},
    ]},
    {id:'junction',label:'Junction',location:'Admin Field approach',situation:'Your group reaches the marked crossing near Admin Field.',photos:[['/assets/fire-route/route-11.webp','T-junction near Admin Field'],['/assets/fire-route/route-12.webp','Zebra crossing to Admin Field']],prompt:'When do you cross?',choices:[
      {id:'follow',label:'As soon as the group ahead moves',feedback:'Don’t assume traffic has stopped. Follow the warden’s directions and check it is safe before crossing.',best:false},
      {id:'walkway',label:'When the warden directs and it is safe',feedback:'Use this marked crossing near Admin Field—not the one at Block 56. Follow the warden and check traffic.',best:true},
    ]},
    {id:'approach',label:'Approach',location:'Admin Field · Zone A',situation:'You’ve reached the field. A colleague stops on the approach walkway.',photos:[['/assets/fire-route/route-13.webp','Walkway around Admin Field']],prompt:'What do you suggest?',choices:[
      {id:'zone',label:'Join CLTE in Zone A',feedback:'Gathering in Zone A keeps the approach clear for others and helps CLTE account for everyone.',best:true},
      {id:'walkway',label:'Wait here for the rest of the group',feedback:'Waiting on the approach can block others. Continue to Zone A and join CLTE there.',best:false},
    ]},
    {id:'rollcall',label:'Roll call',location:'Admin Field · Zone A',situation:'During roll call, a colleague is unaccounted for.',photos:[['/assets/fire-route/route-14.webp','Admin Field · assembly point']],prompt:'What would help most?',choices:[
      {id:'search',label:'Go back to check their desk',feedback:'Do not re-enter to search. Tell the warden who is missing and where they were last seen, if known.',best:false},
      {id:'report',label:'Tell the warden where you last saw them',feedback:'Share their name and last known location, if known. Stay with CLTE; do not go back to search.',best:true},
    ]},
  ];
  const stage=routeStages[routeStage]; const photo=stage.photos[photoIndex]||stage.photos[0]; const selected=stage.choices.find(choice=>choice.id===answers[routeStage]);
  const completeCount=routeStages.filter((item,index)=>item.choices.find(choice=>choice.id===answers[index])?.best).length; const allCorrect=completeCount===routeStages.length;
  const reviewNext=()=>{const next=routeStages.findIndex((item,index)=>!item.choices.find(choice=>choice.id===answers[index])?.best);selectStage(next<0?0:next)};
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
  return <section id="evacuation" className={`evacuation pov-response pov-stage-${routeStage} ${allCorrect?'pov-complete':''}`} onPointerMove={moveCamera} onPointerLeave={resetCamera}>
    <div className="pov-camera" key={photo[0]}><img src={photo[0]} alt={photo[1]}/></div><div className="pov-shade" aria-hidden="true"/>
    <div className="pov-hud">
      <div className="pov-status"><span><Flame/> 02 · Fire evacuation</span><strong>Block 27 → Zone A</strong></div>
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
      <div className="pov-actions"><button disabled={routeStage===0} onClick={()=>selectStage(routeStage-1)}><ArrowRight className="turn"/> Back</button>{allCorrect?<><button className="pov-recap-action" onClick={()=>setProtocolOpen(true)}><CirclePlay/> Watch recap</button><button className="pov-complete-action" onClick={onComplete}>Finish Fire 02 <ArrowRight/></button></>:routeStage<routeStages.length-1?<button onClick={()=>selectStage(routeStage+1)}>Next checkpoint <ArrowRight/></button>:<button onClick={reviewNext}>Review remaining checkpoints <ArrowRight/></button>}</div>
    </aside>
    <div className="pov-stage-rail" role="tablist" aria-label="Actual evacuation route checkpoints">{routeStages.map((item,index)=>{const done=item.choices.find(choice=>choice.id===answers[index])?.best;return <button key={item.id} role="tab" aria-selected={routeStage===index} className={`${routeStage===index?'active':''} ${done?'done':''}`} onClick={()=>selectStage(index)}><span>{done?<Check/>:index+1}</span><strong>{item.label}</strong></button>})}</div>
    {mapOpen&&<div className="pov-map-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMapOpen(false)}}><div className="pov-map-dialog" role="dialog" aria-modal="true" aria-label="Block 27 to Admin Field route map"><button className="sheet-close" onClick={()=>setMapOpen(false)} aria-label="Close route map"><X/></button><img src="/assets/block27-admin-field-route.jpg" alt="Aerial emergency route map from Block 27 to Zone A at Admin Field."/><p><MapPin/><span><strong>Block 27 → Zone A, Admin Field</strong><small><ReadingText>Follow fire wardens and current posted evacuation instructions.</ReadingText></small></span></p></div></div>}
    <FireProtocolDialog open={protocolOpen} recap={allCorrect} onClose={()=>setProtocolOpen(false)}/>
  </section>;
}

function PocketGuide({ onComplete, reviewing = false }: { onComplete: () => void; reviewing?: boolean }) {
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
    <button className="primary guide-finish" onClick={onComplete}>{reviewing ? 'Back to completion' : 'Finish activity'} <ArrowRight/></button>
  </section>;
}

function ResetDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(open)cancelRef.current?.focus()},[open]);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onCancel()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onCancel]);
  if(!open)return null;
  return <div className="reset-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel()}}><section className="reset-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><RotateCcw/><p className="eyebrow">Start again</p><h2 id="reset-title">Reset your activity?</h2><p id="reset-description">This clears your saved progress and returns all scenarios to 0/5.</p><div><button ref={cancelRef} className="secondary" onClick={onCancel}>Keep progress</button><button className="reset-confirm" onClick={onConfirm}>Reset activity</button></div></section></div>;
}

function Completion({ onReview, onGuide, onReset, onHome }: { onReview: (view: View) => void; onGuide: () => void; onReset: () => void; onHome: () => void }) {
  const reviewItems:{view:View;n:string;label:string}[]=[{view:'office',n:'01',label:'Office hazards'},{view:'evacuation',n:'02',label:'Fire emergency'},{view:'walkway',n:'03',label:'Injury response'},{view:'haze',n:'04',label:'Haze response'},{view:'reporting',n:'05',label:'Reporting'}];
  return <section className="completion">
    <Sparkles/><p className="eyebrow">CLTE WSH Week 2026</p><h2>Activity complete</h2>
    <p>You’ve reached the end. You can close this tab or return to the home screen.</p>
    <div className="completion-actions"><button className="primary" onClick={onHome}>Back to home <ArrowRight/></button><button className="text-button" onClick={onGuide}>Review contacts</button></div>
    <div className="completion-review"><article><span>01</span><strong>Care first</strong><p>Help the person. Control the risk.</p></article><article><span>02</span><strong>Call clearly</strong><p>For serious injury: 995 + exact location.</p></article><article><span>03</span><strong>Close the loop</strong><p>Report, join roll call and remain.</p></article></div>
    <div className="personal-takeaway"><Check/><span>Know your nearest exit, assembly point and emergency contacts.</span></div>
    <div className="review-hub"><p className="eyebrow">Replay any scenario</p><div>{reviewItems.map(item=><button key={item.view} onClick={()=>onReview(item.view)}><span>{item.n}</span>{item.label}<ArrowRight/></button>)}</div></div>
    <button className="start-again" onClick={onReset}><RotateCcw/>Start again</button>
  </section>;
}

export default function App() {
  const [progress,setProgress]=useSavedProgress(); const [menu,setMenu]=useState(false); const [resetOpen,setResetOpen]=useState(false);
  const [view,setView]=useState<View>('intro');
  const [hazardsPart,setHazardsPart]=useState<HazardPart>(()=>{try{return localStorage.getItem('clte-hazards-part')==='experiment'?'experiment':'office'}catch{return'office'}});
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setMenu(false)},[view]);
  const complete=(key:keyof Progress,next:View)=>{setProgress(v=>({...v,[key]:true}));setView(next)};
  const scenarioKeys:(keyof Progress)[]=['office','walkway','haze','evacuation','reporting'];
  const completed=useMemo(()=>scenarioKeys.filter(key=>progress[key]).length,[progress]);
  const chapters:{n:string;id:keyof Progress;label:string}[]=[{n:'01',id:'office',label:'Hazards'},{n:'02',id:'evacuation',label:'Fire'},{n:'03',id:'walkway',label:'Injury'},{n:'04',id:'haze',label:'Haze'},{n:'05',id:'reporting',label:'Report'}];
  const resumeView:View=!progress.office?'office':!progress.evacuation?'evacuation':!progress.walkway?'walkway':!progress.haze?'haze':!progress.reporting?'reporting':!progress.practice?'practice':!progress.guide?'guide':'completion';
  const resumeLabels:Record<View,string>={intro:'activity',office:'office hazards',walkway:'injury response',haze:'haze response',evacuation:'fire emergency',reporting:'reporting',practice:'report practice',guide:'WSH contacts',completion:'activity review'};
  const startLabel=progress.completion?'Review activity':completed?`Continue: ${resumeLabels[resumeView]}`:'Start activity';
  const statusText=progress.completion?'Completed · progress saved':completed===0?'':completed<5?`${completed}/5 scenarios completed`:!progress.practice?'5/5 scenarios · report practice remaining':!progress.guide?'Report practice complete · contacts remaining':'Activity complete';
  const headerStatus=completed<5?`${completed}/5 scenarios`:!progress.practice?'5/5 · Report practice':!progress.guide?'5/5 · Contacts':'Activity complete';
  const chooseHazardsPart=(part:HazardPart)=>{setHazardsPart(part);setView('office');setMenu(false);window.scrollTo({top:0,behavior:'instant'});try{localStorage.setItem('clte-hazards-part',part)}catch{/* Optional local progress. */}};
  const resetProgress=()=>{clearGuidedProgress();clearReportingProgress();clearOfficeProgress();clearExperimentRoomProgress();try{localStorage.removeItem('clte-hazards-part');localStorage.removeItem('clte-safety-progress');sessionStorage.removeItem('clte-safety-progress')}catch{/* Storage is optional. */}setProgress(initialProgress);setHazardsPart('office');setView('intro');setResetOpen(false)};
  return <div className="app-shell"><header><button className="logo" onClick={()=>{setMenu(false);setView('intro')}} aria-label="Ngee Ann Polytechnic · CLTE workplace safety activity · Home"><img src="/assets/np-logo.png" alt="Ngee Ann Polytechnic"/></button><nav className={menu?'open':''} aria-label="Scenarios · open in any order">{chapters.map(({n,id,label})=>id==='office'?<div key={id} className={`hazards-nav-group ${view==='office'?'expanded':''}`}><button aria-label={`${n} ${label}`} aria-description={progress[id]?'Completed':'Two activities'} aria-current={view===id?'page':undefined} onClick={()=>{setMenu(false);setView(id)}} className={`${view===id?'current':''} ${progress[id]?'done':''}`}>{n}<span>{label}</span></button>{view==='office'&&<div className="hazards-subnav" role="group" aria-label="Hazard activities"><button aria-pressed={hazardsPart==='office'} onClick={()=>chooseHazardsPart('office')}><span>1</span> Office workspace</button><button aria-pressed={hazardsPart==='experiment'} onClick={()=>chooseHazardsPart('experiment')}><span>2</span> Experiment Room</button></div>}</div>:<button key={id} aria-label={`${n} ${label}`} aria-description={progress[id]?'Completed':'Not yet completed'} aria-current={view===id?'page':undefined} onClick={()=>{setMenu(false);setView(id)}} className={`${view===id?'current':''} ${progress[id]?'done':''}`}>{n}<span>{label}</span></button>)}</nav><div className="header-tools"><span aria-live="polite">{headerStatus}</span><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div></header>
    <main className="experience-stage"><div key={view} className="view-transition">{view==='intro'&&<Intro startLabel={startLabel} statusText={statusText} canReset={completed>0||progress.practice||progress.guide||progress.completion} onReset={()=>setResetOpen(true)} onStart={()=>setView(progress.completion?'completion':resumeView)}/>} {view==='office'&&<HazardsExperience part={hazardsPart} onPartChange={chooseHazardsPart} onComplete={()=>complete('office','evacuation')}/>} {view==='evacuation'&&<EvacuationScene onComplete={()=>complete('evacuation','walkway')}/>} {view==='walkway'&&<InjuryScene onComplete={()=>complete('walkway','haze')}/>} {view==='haze'&&<HazeScene onComplete={()=>complete('haze','reporting')}/>} {view==='reporting'&&<ReportingScene onComplete={()=>complete('reporting','practice')}/>} {view==='practice'&&<PracticeReport onComplete={()=>complete('practice','guide')}/>} {view==='guide'&&<PocketGuide reviewing={progress.completion} onComplete={()=>{setProgress(value=>({...value,guide:true,completion:true}));setView('completion')}}/>} {view==='completion'&&<Completion onHome={()=>setView('intro')} onReview={setView} onGuide={()=>setView('guide')} onReset={()=>setResetOpen(true)}/>}</div></main><ResetDialog open={resetOpen} onCancel={()=>setResetOpen(false)} onConfirm={resetProgress}/></div>;
}
