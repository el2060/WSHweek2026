import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ExternalLink, Eye, Flame, HeartHandshake, Info, MapPin, Menu, Phone, RotateCcw, Sparkles, Wrench, X } from 'lucide-react';
import { officialInfo } from './config';
import OfficeScene, { clearOfficeProgress } from './OfficeScene';
import { InjuryScene, HazeScene, clearGuidedProgress } from './GuidedScenes';
import PracticeReport from './PracticeReport';
import ReportingScene, { clearReportingProgress } from './ReportingScene';
import { ReadingText } from './ReadingText';

type Progress = { office: boolean; walkway: boolean; haze: boolean; evacuation: boolean; reporting: boolean; practice: boolean; guide: boolean; completion: boolean };
type View = 'intro' | 'office' | 'walkway' | 'haze' | 'evacuation' | 'reporting' | 'practice' | 'guide' | 'completion';
const initialProgress: Progress = { office: false, walkway: false, haze: false, evacuation: false, reporting: false, practice: false, guide: false, completion: false };

function useSavedProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try { return { ...initialProgress, ...JSON.parse(localStorage.getItem('clte-safety-progress') || sessionStorage.getItem('clte-safety-progress') || '') } as Progress; } catch { return initialProgress; }
  });
  useEffect(() => { try { localStorage.setItem('clte-safety-progress', JSON.stringify(progress)); } catch { /* Progress can remain in memory. */ } }, [progress]);
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
      <p className="eyebrow light">CLTE staff online activity</p>
      <h1><span>Workplace safety</span><em>made practical.</em></h1>
      <p className="tagline"><span className="reading-phrase">Five short scenarios.</span>{' '}<span className="reading-phrase">Try a small action.</span>{' '}<span className="reading-phrase">Learn as you go.</span></p>
      <div className="intro-actions"><button className="primary light-button" onClick={onStart}><span>{startLabel}</span><ArrowDown size={19}/></button>{canReset&&<button className="intro-reset" onClick={onReset}><RotateCcw/><span>Start again</span></button>}</div>
      {statusText&&<p className="intro-note" aria-live="polite">{statusText}</p>}
    </div>
    <div className="wsh-hero-visual" aria-hidden="true">
      <img src="/assets/wsh-week-hero.png" alt=""/>
    </div>
  </section>;
}

function EvacuationScene({ onComplete }: { onComplete: () => void }) {
  const [routeStage,setRouteStage]=useState(0); const [photoIndex,setPhotoIndex]=useState(0); const [answers,setAnswers]=useState<Record<number,string>>({}); const [mapOpen,setMapOpen]=useState(false);
  const routeStages=[
    {id:'exit',label:'Exit',location:'Block 27 · Pantry',title:'The alarm sounds',instruction:'Leave now. Take only what is already with you.',photos:[['/assets/fire-route/route-01.webp','Pantry exit · open-door view'],['/assets/fire-route/route-02.webp','Pantry exit · approach view'],['/assets/fire-route/route-03.webp','Alternative exit · lift lobby view']],prompt:'What do you do first?',choices:[
      {id:'evacuate',label:'Use the nearest safe exit',feedback:'Leave promptly. Follow exit signs and the fire warden.',best:true},
      {id:'lift',label:'Take the lift',feedback:'Do not use the lift during a fire.',best:false},
      {id:'investigate',label:'Find the smoke first',feedback:'Do not investigate or delay.',best:false},
    ]},
    {id:'stairs',label:'Stairs',location:'Block 27 · Stairwell',title:'Take the stairs',instruction:'Keep moving calmly with the group. Use the handrail.',photos:[['/assets/fire-route/route-04.webp','Middle staircase · entry'],['/assets/fire-route/route-05.webp','Mezzanine landing'],['/assets/fire-route/route-06.webp','First-floor landing']],prompt:'How do you move?',choices:[
      {id:'steady',label:'Walk steadily + use the handrail',feedback:'A steady pace and the handrail help prevent falls when the stairs are busy.',best:true},
      {id:'run',label:'Run before it gets crowded',feedback:'Running can cause a fall.',best:false},
      {id:'wait',label:'Wait alone on the landing',feedback:'Stay with the evacuation flow.',best:false},
    ]},
    {id:'ground',label:'Ground',location:'Block 27 · Ground floor',title:'Follow the outdoor route',instruction:'Stay on the walkway with the group, past DST Office, Studio 27 and OIC.',photos:[['/assets/fire-route/route-07.webp','Ground floor · DST Office'],['/assets/fire-route/route-08.webp','Route past Studio 27'],['/assets/fire-route/route-09.webp','Route beside OIC']],prompt:'Which route do you take?',choices:[
      {id:'group',label:'Stay with the group on the walkway',feedback:'The landmarks lead toward Block 56.',best:true},
      {id:'shortcut',label:'Cut across the road',feedback:'Shortcuts add traffic risk.',best:false},
      {id:'own',label:'Take my usual route',feedback:'Use the designated route.',best:false},
    ]},
    {id:'blk56',label:'Blk 56',location:'Block 56 · Stay on the walkway',title:'Stay on this side',instruction:'Do not cross at Block 56. Continue along the walkway with the group.',photos:[['/assets/fire-route/route-10.webp','Block 56 landmark — continue on the walkway; do not use this crossing']],prompt:'How do you continue past Block 56?',choices:[
      {id:'stay',label:'Stay on the walkway — do not cross here',feedback:'Keep following the walkway with the group. The crossing in this photo is not part of this checkpoint’s route.',best:true},
      {id:'cross',label:'Use the zebra crossing in the photo',feedback:'Not at this checkpoint. Stay on the walkway and continue with the group.',best:false},
      {id:'road',label:'Step onto the road to follow others',feedback:'Keep to the walkway. Do not step onto the road here.',best:false},
    ]},
    {id:'junction',label:'Junction',location:'Admin Field approach',title:'Stay on the marked path',instruction:'At the Admin Field approach, use the walkway and marked zebra crossing. Follow the warden’s directions.',photos:[['/assets/fire-route/route-11.webp','T-junction near Admin Field'],['/assets/fire-route/route-12.webp','Zebra crossing to Admin Field']],prompt:'Which way is safest?',choices:[
      {id:'walkway',label:'Walkway + zebra crossing',feedback:'This crossing is at the Admin Field approach, not Block 56. Follow the marked route and the warden’s directions.',best:true},
      {id:'diagonal',label:'Cross diagonally',feedback:'Use the marked crossing.',best:false},
      {id:'road',label:'Walk along the road edge',feedback:'Keep to the walkway.',best:false},
    ]},
    {id:'approach',label:'Approach',location:'Zone A · Admin Field',title:'Keep moving to Zone A',instruction:'Join the CLTE group in Zone A. Keep the approach walkway clear.',photos:[['/assets/fire-route/route-13.webp','Walkway around Admin Field']],prompt:'Where do you stop?',choices:[
      {id:'zone',label:'Zone A with the CLTE group',feedback:'Gathering in Zone A keeps the approach clear for others and helps CLTE account for everyone.',best:true},
      {id:'walkway',label:'On the covered walkway',feedback:'Continue to the assembly point.',best:false},
      {id:'anywhere',label:'Anywhere on the field',feedback:'Join CLTE in Zone A.',best:false},
    ]},
    {id:'rollcall',label:'Roll call',location:'Admin Field · Zone A',title:'Report and remain',instruction:'Stay with CLTE for roll call. Tell the warden if someone is missing; do not go back to search.',photos:[['/assets/fire-route/route-14.webp','Admin Field · assembly point']],prompt:'Someone is missing. What now?',choices:[
      {id:'report',label:'Tell the warden + remain here',feedback:'Tell the warden who is missing and where they were last seen, if known. Staying here keeps the roll call accurate.',best:true},
      {id:'search',label:'Return to Block 27',feedback:'Never re-enter to search.',best:false},
      {id:'leave',label:'Leave to call them',feedback:'Remain with the group.',best:false},
    ]},
  ];
  const stage=routeStages[routeStage]; const photo=stage.photos[photoIndex]||stage.photos[0]; const selected=stage.choices.find(choice=>choice.id===answers[routeStage]);
  const completeCount=routeStages.filter((item,index)=>item.choices.find(choice=>choice.id===answers[index])?.best).length; const allCorrect=completeCount===routeStages.length;
  const reviewNext=()=>{const next=routeStages.findIndex((item,index)=>!item.choices.find(choice=>choice.id===answers[index])?.best);selectStage(next<0?0:next)};
  const selectStage=(index:number)=>{setRouteStage(index);setPhotoIndex(0);setMapOpen(false)};
  const moveCamera=(event:React.PointerEvent<HTMLElement>)=>{
    if(mapOpen||event.pointerType!=='mouse'||!window.matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
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
      <div className="pov-status"><span><Flame/> 02 · Fire evacuation</span><strong>Block 27 → Zone A</strong><small>{allCorrect?'Route complete':`${completeCount}/${routeStages.length} checkpoints completed`}</small></div>
      <div className="pov-tools"><button onClick={()=>setMapOpen(true)}><MapPin/> Route map</button></div>
    </div>
    <div className="pov-context">
      {stage.id==='blk56'&&<div className="route-photo-cue"><Info size={20}/><strong>Do not cross here · stay on the walkway</strong></div>}
      <div className="pov-location" key={routeStage}><p className="eyebrow">Checkpoint {routeStage+1} · {stage.location}</p><h2>{stage.title}</h2><p><ReadingText>{stage.instruction}</ReadingText></p></div>
      {stage.photos.length>1&&<div className="pov-scene-gallery" aria-label="Real route views">
        <div className="pov-scene-gallery-head"><span><Eye/> Route photos</span><small>{photoIndex+1} of {stage.photos.length}</small></div>
        <div className="pov-scene-thumbnails" style={{gridTemplateColumns:`repeat(${stage.photos.length},minmax(0,1fr))`}}>{stage.photos.map((view,index)=><button key={view[0]} type="button" className={photoIndex===index?'active':''} aria-pressed={photoIndex===index} aria-label={`Show route view ${index+1}: ${view[1]}`} onClick={()=>setPhotoIndex(index)}><img src={view[0]} alt=""/><span>View {index+1}</span></button>)}</div>
      </div>}
    </div>
    <aside className="pov-decision" aria-label={`Decision at ${stage.location}`}>
      <div className="pov-decision-head"><span>{String(routeStage+1).padStart(2,'0')}</span><div><p>Your next step</p><h3>{stage.prompt}</h3></div></div>
      <div className="pov-choices">{stage.choices.map((choice,index)=><button key={choice.id} aria-pressed={answers[routeStage]===choice.id} className={answers[routeStage]===choice.id?`selected ${choice.best?'safe':'risk'}`:''} onClick={()=>setAnswers(value=>({...value,[routeStage]:choice.id}))}><span>{answers[routeStage]===choice.id?(choice.best?<Check/>:<X/>):String.fromCharCode(65+index)}</span><strong>{choice.label}</strong></button>)}</div>
      {selected&&<div className={`pov-feedback ${selected.best?'good':'consider'}`} aria-live="polite"><Info/><div><strong>{selected.best?'Why this helps':'A safer next step'}</strong><p><ReadingText>{selected.feedback}</ReadingText></p></div></div>}
      <div className="pov-actions"><button disabled={routeStage===0} onClick={()=>selectStage(routeStage-1)}><ArrowRight className="turn"/> Back</button>{allCorrect?<button className="pov-complete-action" onClick={onComplete}>Finish Fire 02 <ArrowRight/></button>:routeStage<routeStages.length-1?<button onClick={()=>selectStage(routeStage+1)}>Next checkpoint <ArrowRight/></button>:<button onClick={reviewNext}>Review remaining checkpoints <ArrowRight/></button>}</div>
    </aside>
    <div className="pov-stage-rail" role="tablist" aria-label="Actual evacuation route checkpoints">{routeStages.map((item,index)=>{const done=item.choices.find(choice=>choice.id===answers[index])?.best;return <button key={item.id} role="tab" aria-selected={routeStage===index} className={`${routeStage===index?'active':''} ${done?'done':''}`} onClick={()=>selectStage(index)}><span>{done?<Check/>:index+1}</span><strong>{item.label}</strong></button>})}</div>
    {mapOpen&&<div className="pov-map-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMapOpen(false)}}><div className="pov-map-dialog" role="dialog" aria-modal="true" aria-label="Block 27 to Admin Field route map"><button className="sheet-close" onClick={()=>setMapOpen(false)} aria-label="Close route map"><X/></button><img src="/assets/block27-admin-field-route.jpg" alt="Aerial emergency route map from Block 27 to Zone A at Admin Field."/><p><MapPin/><span><strong>Block 27 → Zone A, Admin Field</strong><small><ReadingText>Follow fire wardens and current posted evacuation instructions.</ReadingText></small></span></p></div></div>}
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
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});setMenu(false)},[view]);
  const complete=(key:keyof Progress,next:View)=>{setProgress(v=>({...v,[key]:true}));setView(next)};
  const scenarioKeys:(keyof Progress)[]=['office','walkway','haze','evacuation','reporting'];
  const completed=useMemo(()=>scenarioKeys.filter(key=>progress[key]).length,[progress]);
  const chapters:{n:string;id:keyof Progress;label:string}[]=[{n:'01',id:'office',label:'Hazards'},{n:'02',id:'evacuation',label:'Fire'},{n:'03',id:'walkway',label:'Injury'},{n:'04',id:'haze',label:'Haze'},{n:'05',id:'reporting',label:'Report'}];
  const resumeView:View=!progress.office?'office':!progress.evacuation?'evacuation':!progress.walkway?'walkway':!progress.haze?'haze':!progress.reporting?'reporting':!progress.practice?'practice':!progress.guide?'guide':'completion';
  const resumeLabels:Record<View,string>={intro:'activity',office:'office hazards',walkway:'injury response',haze:'haze response',evacuation:'fire emergency',reporting:'reporting',practice:'report practice',guide:'WSH contacts',completion:'activity review'};
  const startLabel=progress.completion?'Review activity':completed?`Continue: ${resumeLabels[resumeView]}`:'Start online activity';
  const statusText=progress.completion?'Completed · progress saved':completed===0?'':completed<5?`${completed}/5 scenarios completed`:!progress.practice?'5/5 scenarios · report practice remaining':!progress.guide?'Report practice complete · contacts remaining':'Activity complete';
  const headerStatus=completed<5?`${completed}/5 scenarios`:!progress.practice?'5/5 · Report practice':!progress.guide?'5/5 · Contacts':'Activity complete';
  const resetProgress=()=>{clearGuidedProgress();clearReportingProgress();clearOfficeProgress();try{localStorage.removeItem('clte-safety-progress');sessionStorage.removeItem('clte-safety-progress')}catch{/* Storage is optional. */}setProgress(initialProgress);setView('intro');setResetOpen(false)};
  return <div className="app-shell"><header><button className="logo" onClick={()=>{setMenu(false);setView('intro')}} aria-label="Ngee Ann Polytechnic · CLTE workplace safety online activity · Home"><img src="/assets/np-logo.png" alt="Ngee Ann Polytechnic"/></button><nav className={menu?'open':''} aria-label="Scenarios · open in any order">{chapters.map(({n,id,label})=><button key={id} aria-label={`${n} ${label}`} aria-description={progress[id]?'Completed':'Not yet completed'} aria-current={view===id?'page':undefined} onClick={()=>{setMenu(false);setView(id)}} className={`${view===id?'current':''} ${progress[id]?'done':''}`}>{n}<span>{label}</span></button>)}</nav><div className="header-tools"><span aria-live="polite">{headerStatus}</span><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div></header>
    <main className="experience-stage"><div key={view} className="view-transition">{view==='intro'&&<Intro startLabel={startLabel} statusText={statusText} canReset={completed>0||progress.practice||progress.guide||progress.completion} onReset={()=>setResetOpen(true)} onStart={()=>setView(progress.completion?'completion':resumeView)}/>} {view==='office'&&<OfficeScene onComplete={()=>complete('office','evacuation')}/>} {view==='evacuation'&&<EvacuationScene onComplete={()=>complete('evacuation','walkway')}/>} {view==='walkway'&&<InjuryScene onComplete={()=>complete('walkway','haze')}/>} {view==='haze'&&<HazeScene onComplete={()=>complete('haze','reporting')}/>} {view==='reporting'&&<ReportingScene onComplete={()=>complete('reporting','practice')}/>} {view==='practice'&&<PracticeReport onComplete={()=>complete('practice','guide')}/>} {view==='guide'&&<PocketGuide reviewing={progress.completion} onComplete={()=>{setProgress(value=>({...value,guide:true,completion:true}));setView('completion')}}/>} {view==='completion'&&<Completion onHome={()=>setView('intro')} onReview={setView} onGuide={()=>setView('guide')} onReset={()=>setResetOpen(true)}/>}</div></main><ResetDialog open={resetOpen} onCancel={()=>setResetOpen(false)} onConfirm={resetProgress}/></div>;
}
