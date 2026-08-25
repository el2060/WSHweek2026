import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Building2, Check, ClipboardCheck, CloudFog, ExternalLink, Eye, Flame, Footprints, HeartHandshake, Info, MapPin, Menu, Phone, RotateCcw, Sparkles, Wrench, X } from 'lucide-react';
import { officeHotspots, officialInfo, routes, type Hotspot } from './config';

type Progress = { office: boolean; walkway: boolean; haze: boolean; evacuation: boolean; reporting: boolean; practice: boolean; guide: boolean; completion: boolean };
type View = 'intro' | 'office' | 'walkway' | 'haze' | 'evacuation' | 'reporting' | 'practice' | 'guide' | 'completion';
const initialProgress: Progress = { office: false, walkway: false, haze: false, evacuation: false, reporting: false, practice: false, guide: false, completion: false };

function useSavedProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try { return { ...initialProgress, ...JSON.parse(localStorage.getItem('clte-safety-progress') || sessionStorage.getItem('clte-safety-progress') || '') } as Progress; } catch { return initialProgress; }
  });
  useEffect(() => localStorage.setItem('clte-safety-progress', JSON.stringify(progress)), [progress]);
  return [progress, setProgress] as const;
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) return null;
  return <a className="guide-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={17} /></a>;
}

function LensHotspot({ item, active, onOpen }: { item: Hotspot; active: boolean; onOpen: () => void }) {
  return <button className={`hotspot ${active ? 'found' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={onOpen} aria-label={`Inspect: ${item.title}`} aria-pressed={active}><span>{active ? <Check size={18} /> : <Eye size={18} />}</span></button>;
}

function SceneHeader({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return <div className="scene-heading"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{copy}</p></div>;
}

function Intro({ onStart, onReset, startLabel, statusText, canReset }: { onStart: () => void; onReset: () => void; startLabel: string; statusText: string; canReset: boolean }) {
  return <section id="intro" className="intro">
    <div className="intro-copy">
      <div className="wsh-week-lockup"><strong>WSH Week</strong><b>2026</b></div>
      <p className="eyebrow light">CLTE staff online activity</p>
      <h1>Workplace safety <em>made practical.</em></h1>
      <p className="tagline">Five quick scenarios. Make the safer call.</p>
      <div className="intro-actions"><button className="primary light-button" onClick={onStart}>{startLabel} <ArrowDown size={19}/></button>{canReset&&<button className="intro-reset" onClick={onReset}><RotateCcw/>Start again</button>}</div>
      {statusText&&<p className="intro-note" aria-live="polite">{statusText}</p>}
    </div>
    <div className="wsh-hero-visual" aria-hidden="true">
      <img src="/assets/wsh-week-hero.png" alt=""/>
    </div>
  </section>;
}

function OfficeScene({ onComplete }: { onComplete: () => void }) {
  const [answers,setAnswers]=useState<Record<string,string>>({}); const [active,setActive]=useState<Hotspot|null>(null);
  const handled=officeHotspots.filter(item=>item.choices.find(choice=>choice.id===answers[item.id])?.best);
  const activeChoice=active?.choices.find(choice=>choice.id===answers[active.id]);
  return <section id="office" className="chapter">
    <SceneHeader kicker="01 · Spot hazards" title="Make the space safe" copy="Find five risks. Fix each one."/>
    <div className="office-workspace"><div className="scene-frame">
      <img src="/assets/office.webp" alt="Illustrated CLTE-style office with cubicles, a shared walkway and colleagues preparing in a meeting room."/>
      {officeHotspots.map(h=><LensHotspot key={h.id} item={h} active={handled.some(item=>item.id===h.id)} onOpen={()=>setActive(h)}/>)}
      <div className="scene-counter" aria-live="polite"><Eye size={16}/>{handled.length}/{officeHotspots.length} hazards fixed</div>
    </div><aside className={`bottom-sheet ${active ? 'open' : ''}`} aria-live="polite">
      {active?<><button className="sheet-close" onClick={()=>setActive(null)} aria-label="Close decision"><X/></button><p className="decision-label">What would you do?</p><h3>{active.title}</h3><p>{active.body}</p><div className="decision-options">{active.choices.map(choice=><button key={choice.id} onClick={()=>setAnswers(current=>({...current,[active.id]:choice.id}))} className={answers[active.id]===choice.id?'selected':''}>{choice.label}</button>)}</div>{activeChoice&&<div className={`decision-consequence ${activeChoice.best?'good':'consider'}`}><Info/><div><strong>{activeChoice.best?'Fixed':'Try again'}</strong><p>{activeChoice.feedback}</p></div></div>}</>:<div className="decision-empty"><Eye/><h3>Choose a marker</h3><p>One quick decision at a time.</p></div>}
    </aside>
    </div>
    {handled.length===officeHotspots.length&&<div className="scene-complete reveal"><Check/><strong>All five fixed</strong><button className="primary" onClick={onComplete}>Next scenario <ArrowRight/></button></div>}
  </section>;
}

function WetScene({ onComplete }: { onComplete: () => void }) {
  const actions=[{id:'photo',label:'Take photos first'},{id:'protect',label:'Keep others clear'},{id:'care',label:'Check on the student'},{id:'wait',label:'Report it later'},{id:'follow',label:'Arrange first aid + report'},{id:'leave',label:'Leave to find supplies'}];
  const [sequence,setSequence]=useState<string[]>([]); const [checked,setChecked]=useState(false);
  const correct=sequence.join(',')==='care,protect,follow';
  const addAction=(id:string)=>{setChecked(false);setSequence(current=>current.includes(id)||current.length>=3?current:[...current,id])};
  const removeAction=(id:string)=>{setChecked(false);setSequence(current=>current.filter(item=>item!==id))};
  return <section id="walkway" className="chapter wet">
    <SceneHeader kicker="03 · Injury response" title="A student has slipped" copy="Put the first three actions in order."/>
    <div className="scene-frame rain-scene"><img src="/assets/walkway.webp" alt="Illustrated wet sheltered campus walkway where a staff member checks on a seated student and another redirects pedestrians."/><div className="rain" aria-hidden="true"/></div>
    <div className="response-builder"><div className="action-bank" aria-label="Available actions">{actions.map(action=><button key={action.id} draggable={!sequence.includes(action.id)} disabled={sequence.includes(action.id)} onDragStart={event=>event.dataTransfer.setData('text/plain',action.id)} onClick={()=>addAction(action.id)}><strong>{action.label}</strong><span>+</span></button>)}</div><div className="response-timeline" onDragOver={event=>event.preventDefault()} onDrop={event=>addAction(event.dataTransfer.getData('text/plain'))}>{[0,1,2].map(index=>{const id=sequence[index];const action=actions.find(item=>item.id===id);return <div className={`timeline-slot ${action?'filled':''}`} key={index}>{action?<button onClick={()=>removeAction(action.id)}><span>{index+1}</span><strong>{action.label}</strong><small>Remove</small></button>:<><span>{index+1}</span><small>Choose an action</small></>}</div>})}</div><div className="builder-footer"><button className="secondary" disabled={!sequence.length} onClick={()=>{setSequence([]);setChecked(false)}}>Clear</button><button className="primary" disabled={sequence.length!==3} onClick={()=>setChecked(true)}>Check order <ArrowRight/></button></div>{checked&&!correct&&<div className="decision-consequence consider"><Info/><div><strong>Try another order</strong><p>Care first. Protect others. Then report.</p></div></div>}{checked&&correct&&<div className="builder-success reveal"><Check/><div><strong>That’s it</strong><p>Care → protect → report.</p></div><button className="primary" onClick={onComplete}>Next scenario <ArrowRight/></button></div>}</div>
  </section>;
}

function HazeInterstitial({ onComplete }: { onComplete: () => void }) {
  const [step,setStep]=useState(0); const [plan,setPlan]=useState<string[]>([]); const [planChecked,setPlanChecked]=useState(false); const [place,setPlace]=useState<string|null>(null); const [escalation,setEscalation]=useState<string|null>(null);
  const planCorrect=plan.length===2&&plan.includes('indoors')&&plan.includes('check'); const placeCorrect=place==='blk73'; const escalationCorrect=escalation==='help';
  const togglePlan=(id:string)=>{setPlanChecked(false);setPlan(current=>current.includes(id)?current.filter(item=>item!==id):current.length<2?[...current,id]:current)};
  const status = step===0 ? ['Exposure','Elevated'] : step===1 ? ['Find shelter',placeCorrect?'Indoors':'Nearby'] : ['Symptoms',escalationCorrect?'Help called':'Worsening'];
  const moveHaze=(event:React.PointerEvent<HTMLElement>)=>{const bounds=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--haze-x',`${((event.clientX-bounds.left)/bounds.width-.5)*18}px`);event.currentTarget.style.setProperty('--haze-y',`${((event.clientY-bounds.top)/bounds.height-.5)*12}px`)};
  const resetHaze=(event:React.PointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--haze-x','0px');event.currentTarget.style.setProperty('--haze-y','0px')};

  return <section className={`haze-activity haze-simulation haze-stage-${step} ${placeCorrect?'air-clearing':''} ${escalationCorrect?'help-active':''}`} onPointerMove={moveHaze} onPointerLeave={resetHaze}>
    <div className="haze-scene" aria-hidden="true"><img src="/assets/haze-response.png" alt=""/></div>
    <div className="haze-brief">
      <p className="eyebrow">04 · Haze response</p><h2>A colleague feels unwell</h2><p>They are coughing, light-headed and have asthma.</p>
      <div className="haze-status" aria-live="polite"><span><CloudFog/>{status[0]}</span><strong>{status[1]}</strong></div>
    </div>
    <div className="haze-console" aria-label="Haze response activity">
      <div className="haze-progress" aria-label={`Haze scenario step ${step+1} of 3`}><span className={step>=0?'active':''}>Assess</span><i className={step>=1?'filled':''}/><span className={step>=1?'active':''}>Locate</span><i className={step>=2?'filled':''}/><span className={step>=2?'active':''}>Escalate</span></div>
      {step===0&&<div className="haze-step reveal"><p className="eyebrow">Act now</p><h3>Choose two actions</h3><div className="haze-plan-options"><button className={plan.includes('indoors')?'selected':''} onClick={()=>togglePlan('indoors')}><span>{plan.includes('indoors')?<Check/>:'01'}</span>Move indoors</button><button className={plan.includes('check')?'selected':''} onClick={()=>togglePlan('check')}><span>{plan.includes('check')?<Check/>:'02'}</span>Check symptoms</button><button className={plan.includes('mask')?'selected':''} onClick={()=>togglePlan('mask')}><span>{plan.includes('mask')?<Check/>:'03'}</span>Mask up and continue</button><button className={plan.includes('home')?'selected':''} onClick={()=>togglePlan('home')}><span>{plan.includes('home')?<Check/>:'04'}</span>Send them home alone</button></div>{planChecked&&<div className={`decision-consequence ${planCorrect?'good':'consider'}`}><Info/><div><strong>{planCorrect?'Good call':'Try again'}</strong><p>{planCorrect?'Move indoors. Check how they feel.':'Reduce exposure, then assess.'}</p></div></div>}<div className="haze-step-nav">{planCorrect&&planChecked?<button className="primary" onClick={()=>setStep(1)}>Find shelter <ArrowRight/></button>:<button className="primary" disabled={plan.length!==2} onClick={()=>setPlanChecked(true)}>Check</button>}</div></div>}
      {step===1&&<div className="haze-step reveal"><p className="eyebrow">Find shelter</p><h3>Where would you go?</h3><div className="haze-location-options location-map"><button className={place==='library'?'selected':''} onClick={()=>setPlace('library')}><BookOpen/><strong>Library</strong><span>Farther</span></button><button className={place==='blk73'?'selected':''} onClick={()=>setPlace('blk73')}><Building2/><strong>Block 73</strong><span>Nearby · cool</span></button><button className={place==='walkway'?'selected':''} onClick={()=>setPlace('walkway')}><Footprints/><strong>Walkway</strong><span>Open air</span></button></div>{place&&<div className={`decision-consequence ${placeCorrect?'good':'consider'}`}><Info/><div><strong>{placeCorrect?'Best fit':'Try again'}</strong><p>{placeCorrect?'Nearby, indoors and air-conditioned.':'Choose the nearest indoor space.'}</p></div></div>}{placeCorrect&&<button className="primary haze-next" onClick={()=>setStep(2)}>Continue <ArrowRight/></button>}</div>}
      {step===2&&<div className="haze-step reveal"><p className="eyebrow">Five minutes later</p><h3>Breathing gets harder</h3><div className="haze-location-options escalation-dial"><button className={escalation==='wait'?'selected':''} onClick={()=>setEscalation('wait')}><strong>Rest</strong><span>Wait</span></button><button className={escalation==='home'?'selected':''} onClick={()=>setEscalation('home')}><strong>Go home</strong><span>Alone</span></button><button className={`urgent-choice ${escalation==='help'?'selected':''}`} onClick={()=>setEscalation('help')}><strong>Call for help</strong><span>Stay + call</span></button></div>{escalation&&<div className={`decision-consequence ${escalationCorrect?'good':'consider'}`}><Info/><div><strong>{escalationCorrect?'Act now':'This is worsening'}</strong><p>{escalationCorrect?`Stay with them. Call ${officialInfo.ambulanceNumber} and give the exact location.`:'Breathing difficulty needs urgent help.'}</p></div></div>}{escalationCorrect&&<button className="primary haze-next" onClick={onComplete}>Next scenario <ArrowRight/></button>}</div>}
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
    {id:'stairs',label:'Stairs',location:'Block 27 · Stairwell',title:'Take the stairs',instruction:'People are moving in behind you.',photos:[['/assets/fire-route/route-04.webp','Middle staircase · entry'],['/assets/fire-route/route-05.webp','Mezzanine landing'],['/assets/fire-route/route-06.webp','First-floor landing']],prompt:'How do you move?',choices:[
      {id:'steady',label:'Walk steadily + use the handrail',feedback:'Stay calm and keep the group moving.',best:true},
      {id:'run',label:'Run before it gets crowded',feedback:'Running can cause a fall.',best:false},
      {id:'wait',label:'Wait alone on the landing',feedback:'Stay with the evacuation flow.',best:false},
    ]},
    {id:'ground',label:'Ground',location:'Block 27 · Ground floor',title:'Follow the outdoor route',instruction:'Pass DST Office, Studio 27 and OIC.',photos:[['/assets/fire-route/route-07.webp','Ground floor · DST Office'],['/assets/fire-route/route-08.webp','Route past Studio 27'],['/assets/fire-route/route-09.webp','Route beside OIC']],prompt:'Which route do you take?',choices:[
      {id:'group',label:'Stay with the group on the walkway',feedback:'The landmarks lead toward Block 56.',best:true},
      {id:'shortcut',label:'Cut across the road',feedback:'Shortcuts add traffic risk.',best:false},
      {id:'own',label:'Take my usual route',feedback:'Use the designated route.',best:false},
    ]},
    {id:'blk56',label:'Blk 56',location:'Block 56 · Zebra crossing',title:'Pause at the crossing',instruction:'Traffic is still moving.',photos:[['/assets/fire-route/route-10.webp','Block 56 · zebra crossing']],prompt:'What do you do?',choices:[
      {id:'check',label:'Pause, check, then cross safely',feedback:'Walk across when safe or directed.',best:true},
      {id:'wave',label:'Step out and wave traffic down',feedback:'Do not assume drivers have seen you.',best:false},
      {id:'run',label:'Run before the next vehicle',feedback:'Use the crossing at a steady pace.',best:false},
    ]},
    {id:'junction',label:'Junction',location:'Admin Field approach',title:'Stay on the marked path',instruction:'Admin Field is ahead.',photos:[['/assets/fire-route/route-11.webp','T-junction near Admin Field'],['/assets/fire-route/route-12.webp','Zebra crossing to Admin Field']],prompt:'Which way is safest?',choices:[
      {id:'walkway',label:'Walkway + zebra crossing',feedback:'Stay on the pedestrian route.',best:true},
      {id:'diagonal',label:'Cross diagonally',feedback:'Use the marked crossing.',best:false},
      {id:'road',label:'Walk along the road edge',feedback:'Keep to the walkway.',best:false},
    ]},
    {id:'approach',label:'Approach',location:'Zone A · Admin Field',title:'Keep moving to Zone A',instruction:'The CLTE assembly area is ahead.',photos:[['/assets/fire-route/route-13.webp','Walkway around Admin Field']],prompt:'Where do you stop?',choices:[
      {id:'zone',label:'Zone A with the CLTE group',feedback:'Keep the walkway clear.',best:true},
      {id:'walkway',label:'On the covered walkway',feedback:'Continue to the assembly point.',best:false},
      {id:'anywhere',label:'Anywhere on the field',feedback:'Join CLTE in Zone A.',best:false},
    ]},
    {id:'rollcall',label:'Roll call',location:'Admin Field · Zone A',title:'Report and remain',instruction:'Stay with CLTE for roll call.',photos:[['/assets/fire-route/route-14.webp','Admin Field · assembly point']],prompt:'Someone is missing. What now?',choices:[
      {id:'report',label:'Tell the warden + remain here',feedback:'Share what you know. Stay until dismissed.',best:true},
      {id:'search',label:'Return to Block 27',feedback:'Never re-enter to search.',best:false},
      {id:'leave',label:'Leave to call them',feedback:'Remain with the group.',best:false},
    ]},
  ];
  const stage=routeStages[routeStage]; const photo=stage.photos[photoIndex]||stage.photos[0]; const selected=stage.choices.find(choice=>choice.id===answers[routeStage]);
  const completeCount=routeStages.filter((item,index)=>item.choices.find(choice=>choice.id===answers[index])?.best).length; const allCorrect=completeCount===routeStages.length;
  const reviewNext=()=>{const next=routeStages.findIndex((item,index)=>!item.choices.find(choice=>choice.id===answers[index])?.best);setRouteStage(next<0?0:next)};
  const selectStage=(index:number)=>{setRouteStage(index);setPhotoIndex(0);setMapOpen(false)};
  const moveCamera=(event:React.PointerEvent<HTMLElement>)=>{const box=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--look-x',`${((event.clientX-box.left)/box.width-.5)*-18}px`);event.currentTarget.style.setProperty('--look-y',`${((event.clientY-box.top)/box.height-.5)*-12}px`)};
  const resetCamera=(event:React.PointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--look-x','0px');event.currentTarget.style.setProperty('--look-y','0px')};
  return <section id="evacuation" className={`evacuation pov-response pov-stage-${routeStage} ${allCorrect?'pov-complete':''}`} onPointerMove={moveCamera} onPointerLeave={resetCamera}>
    <div className="pov-camera" key={photo[0]}><img src={photo[0]} alt={photo[1]}/></div><div className="pov-shade" aria-hidden="true"/>
    <div className="pov-hud">
      <div className="pov-status"><span><Flame/> Fire 02 · Live route drill</span><strong>Block 27 → Zone A</strong><small>{allCorrect?'Route clear · ready to complete':`${completeCount}/${routeStages.length} decisions clear`}</small></div>
      <div className="pov-tools"><button onClick={()=>setMapOpen(true)}><MapPin/> Route map</button>{stage.photos.length>1&&<button onClick={()=>setPhotoIndex(value=>(value+1)%stage.photos.length)}><Eye/> Look around · {photoIndex+1}/{stage.photos.length}</button>}</div>
    </div>
    <div className="pov-location reveal" key={`${routeStage}-${photoIndex}`}><p className="eyebrow">Checkpoint {routeStage+1} · {stage.location}</p><h2>{stage.title}</h2><p>{stage.instruction}</p><small><Eye/> Actual route photo · {photo[1]}</small></div>
    <aside className="pov-decision" aria-label={`Decision at ${stage.location}`}>
      <div className="pov-decision-head"><span>{String(routeStage+1).padStart(2,'0')}</span><div><p>Decision point</p><h3>{stage.prompt}</h3></div></div>
      <div className="pov-choices">{stage.choices.map((choice,index)=><button key={choice.id} aria-pressed={answers[routeStage]===choice.id} className={answers[routeStage]===choice.id?`selected ${choice.best?'safe':'risk'}`:''} onClick={()=>setAnswers(value=>({...value,[routeStage]:choice.id}))}><span>{answers[routeStage]===choice.id?(choice.best?<Check/>:<X/>):String.fromCharCode(65+index)}</span><strong>{choice.label}</strong></button>)}</div>
      {selected&&<div className={`pov-feedback ${selected.best?'good':'consider'}`} aria-live="polite"><Info/><div><strong>{selected.best?'Good call':'Try again'}</strong><p>{selected.feedback}</p></div></div>}
      <div className="pov-actions"><button disabled={routeStage===0} onClick={()=>selectStage(routeStage-1)}><ArrowRight className="turn"/> Back</button>{allCorrect?<button className="pov-complete-action" onClick={onComplete}>Finish Fire 02 <ArrowRight/></button>:routeStage<routeStages.length-1?<button onClick={()=>selectStage(routeStage+1)}>Next checkpoint <ArrowRight/></button>:<button onClick={reviewNext}>Review missed points <ArrowRight/></button>}</div>
    </aside>
    <div className="pov-stage-rail" role="tablist" aria-label="Actual evacuation route checkpoints">{routeStages.map((item,index)=>{const done=item.choices.find(choice=>choice.id===answers[index])?.best;return <button key={item.id} role="tab" aria-selected={routeStage===index} className={`${routeStage===index?'active':''} ${done?'done':''}`} onClick={()=>selectStage(index)}><span>{done?<Check/>:index+1}</span><strong>{item.label}</strong></button>})}</div>
    {mapOpen&&<div className="pov-map-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMapOpen(false)}}><div className="pov-map-dialog" role="dialog" aria-modal="true" aria-label="Block 27 to Admin Field route map"><button className="sheet-close" onClick={()=>setMapOpen(false)} aria-label="Close route map"><X/></button><img src="/assets/block27-admin-field-route.jpg" alt="Aerial emergency route map from Block 27 to Zone A at Admin Field."/><p><MapPin/><span><strong>Block 27 → Zone A, Admin Field</strong><small>Follow fire wardens and current posted evacuation instructions.</small></span></p></div></div>}
  </section>;
}

function RoutingScene({ onComplete }: { onComplete: () => void }) {
  const [active,setActive]=useState(routes[0].id); const [answers,setAnswers]=useState<Record<string,string>>({});
  const scenario=routes.find(r=>r.id===active)!; const activeIndex=routes.findIndex(route=>route.id===active); const picked=answers[active]; const correct=picked===scenario.correct;
  const completeCount=routes.filter(route=>answers[route.id]===route.correct).length; const allComplete=completeCount===routes.length;
  const channels=[{id:'emergency',label:'Emergency',hint:'Urgent help',icon:<Phone/>},{id:'incident',label:'WSH Portal',hint:'Incident / near miss',icon:<ClipboardCheck/>},{id:'fault',label:'Fault report',hint:'Hazard / defect',icon:<Wrench/>}];
  const routeTo=(channel:string)=>setAnswers(value=>({...value,[active]:channel}));
  const nextSituation=()=>{const next=routes.find(route=>answers[route.id]!==route.correct&&route.id!==active);if(next)setActive(next.id)};
  return <section id="reporting" className="chapter reporting">
    <SceneHeader kicker="05 · Report" title="Choose the right channel" copy="Four situations. One choice each."/>
    <div className="scene-frame"><img src="/assets/response.webp" alt="Illustrated response desk with a phone, report document and maintenance tool leading to three paths."/></div>
    <div className="routing-board"><div className="route-stage-head"><div><p className="eyebrow">Situation {activeIndex+1} of {routes.length}</p><h3>{scenario.label}</h3></div><div className="route-progress" aria-label={`${completeCount} of ${routes.length} situations complete`}>{routes.map((route,index)=><i key={route.id} className={`${index===activeIndex?'current':''} ${answers[route.id]===route.correct?'done':''}`}>{answers[route.id]===route.correct?<Check/>:index+1}</i>)}</div></div><p className="route-prompt">Where does it go?</p><div className="channel-board">{channels.map(channel=><button key={channel.id} aria-pressed={picked===channel.id} disabled={correct} className={`channel-drop ${picked===channel.id?'active':''}`} onClick={()=>routeTo(channel.id)}>{channel.icon}<strong>{channel.label}</strong><span>{channel.hint}</span></button>)}</div>{picked&&<div className={`route-feedback ${correct?'good':'consider'}`}><Info/><div><strong>{correct?scenario.channel:'Try again'}</strong><p>{correct?scenario.detail:'Match the channel to the urgency.'}</p></div></div>}<div className="route-actions">{correct&&!allComplete&&<button className="primary" onClick={nextSituation}>Next <ArrowRight/></button>}{allComplete&&<button className="primary route-finish" onClick={onComplete}>Try a report <ArrowRight/></button>}</div></div>
  </section>;
}

function PracticeReport({ onComplete }: { onComplete: () => void }) {
  const [step,setStep]=useState(0); const [complete,setComplete]=useState(false);
  const [data,setData]=useState({reportType:'Incident',nature:'Fall, trip and slip',when:'27 April, wet weather',place:'Common area',location:'Wet walkway beside Block 73',severity:'Minor injury',person:'NP Student',account:'A student slipped on the wet walkway beside Block 73.',actions:'Checked the student, kept others clear and reported the incident.'});
  const choose=(key:keyof typeof data,value:string)=>setData({...data,[key]:value});
  const choices=(label:string,key:keyof typeof data,items:string[])=><fieldset className="choice-field"><legend>{label}</legend><div>{items.map(item=><button type="button" key={item} aria-pressed={data[key]===item} className={data[key]===item?'selected':''} onClick={()=>choose(key,item)}>{data[key]===item&&<Check/>}{item}</button>)}</div></fieldset>;
  return <section className="practice mock-report" id="practice"><div className="simulation-banner"><Info/><span><strong>Practice only</strong> · Nothing is submitted.</span></div><div className="mock-shell"><aside className="mock-steps"><p className="eyebrow">Quick report</p><h3>Wet walkway</h3>{['Type','Impact','Details'].map((label,i)=><button key={label} onClick={()=>i<=step&&setStep(i)} className={`${step===i?'current':''} ${i<step||complete?'done':''}`} disabled={i>step}><span>{i<step||complete?<Check/>:i+1}</span>{label}</button>)}</aside><div className="mock-panel"><div className="step-counter">{step+1} / 3</div>{step===0&&<div className="mock-step reveal"><p className="eyebrow">Step 1</p><h2>What happened?</h2>{choices('Report type','reportType',['Incident','Near miss'])}{choices('Nature','nature',['Fall, trip and slip','Medical condition','Other'])}{data.reportType==='Near miss'&&<div className="learning-feedback urgent"><Info/><span><strong>Use “Incident”:</strong> someone was affected.</span></div>}</div>}{step===1&&<div className="mock-step reveal"><p className="eyebrow">Step 2</p><h2>Where and who?</h2>{choices('Place','place',['Common area','Office','Classroom / LT'])}<label className="mock-input"><span>Exact location</span><input value={data.location} onChange={e=>choose('location',e.target.value)} /></label>{choices('Injury','severity',['No injury','Minor injury','Major injury'])}{choices('Person','person',['NP Student','NP Staff','Visitor / Public'])}{data.severity==='Major injury'&&<div className="learning-feedback urgent"><Info/><span><strong>Emergency first:</strong> call {officialInfo.ambulanceNumber}, then Guard Post at {officialInfo.emergencyNumber}.</span></div>}</div>}{step===2&&<div className="mock-step reveal"><p className="eyebrow">Step 3</p><h2>Add the essentials</h2><label className="mock-input"><span>What happened?</span><textarea value={data.account} maxLength={360} onChange={e=>choose('account',e.target.value)}/><small>{data.account.length}/360</small></label><label className="mock-input"><span>What did you do?</span><textarea value={data.actions} maxLength={300} onChange={e=>choose('actions',e.target.value)}/><small>{data.actions.length}/300</small></label><div className="example-attachment"><ClipboardCheck/><span><strong>Photo added</strong><small>walkway-condition.jpg</small></span><Check/></div></div>}<div className="mock-nav">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}{step<2?<button className="primary" onClick={()=>setStep(step+1)}>Next <ArrowRight/></button>:<button className="primary" onClick={()=>setComplete(true)}>Review</button>}</div></div>{complete&&<aside className="report-preview mock-preview reveal"><button className="sheet-close" onClick={()=>setComplete(false)} aria-label="Close report preview"><X/></button><p className="eyebrow">Ready to report</p><h3>{data.nature}</h3><dl><dt>Type</dt><dd>{data.reportType} · {data.severity}</dd><dt>Where / when</dt><dd>{data.location} · {data.when}</dd><dt>Who</dt><dd>{data.person}</dd><dt>What happened</dt><dd>{data.account}</dd><dt>Action</dt><dd>{data.actions}</dd></dl><div className="completed"><Check/><strong>Key details included</strong></div><button className="primary" onClick={onComplete}>View contacts <ArrowRight/></button></aside>}</div></section>;
}

function PocketGuide({ onComplete }: { onComplete: () => void }) {
  const [tab,setTab]=useState<'emergency'|'incident'|'hazard'>('emergency');
  const tabs=['emergency','incident','hazard'] as const;
  const moveTab=(event:React.KeyboardEvent<HTMLButtonElement>,current:typeof tab)=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const tablist=event.currentTarget.parentElement;const index=tabs.indexOf(current);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:(index-1+tabs.length)%tabs.length;setTab(tabs[next]);requestAnimationFrame(()=>tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus())};
  const tabButton=(id:typeof tab,label:string,icon:React.ReactNode)=><button id={`guide-tab-${id}`} role="tab" aria-selected={tab===id} aria-controls={`guide-panel-${id}`} tabIndex={tab===id?0:-1} onKeyDown={event=>moveTab(event,id)} onClick={()=>setTab(id)}>{icon}{label}</button>;
  return <section id="guide" className="guide interactive-guide">
    <div className="guide-title"><p className="eyebrow">Keep this handy</p><h2>WSH contacts</h2><p>What to do. Who to call.</p></div>
    <div className="guide-tabs" role="tablist" aria-label="WSH contact categories">{tabButton('emergency','Emergency',<Phone/>)}{tabButton('incident','Incident / near miss',<HeartHandshake/>)}{tabButton('hazard','Hazard / defect',<Wrench/>)}</div>
    <div id={`guide-panel-${tab}`} role="tabpanel" aria-labelledby={`guide-tab-${tab}`} className="guide-focus reveal" key={tab}>
      {tab==='emergency'&&<article><p className="eyebrow">Serious medical injury</p><h3>Call {officialInfo.ambulanceNumber}</h3><ul><li>Give the exact location</li><li>Call Guard Post: <strong>{officialInfo.emergencyNumber}</strong></li><li>Stay with the person until help arrives</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.emergencyInfo}>Emergency info</ActionLink><ActionLink href={officialInfo.links.oneMap}>Zone A map</ActionLink></div></article>}
      {tab==='incident'&&<article><p className="eyebrow">Incident or near miss</p><h3>Care. Control. Report.</h3><ul><li>Help the person and make the area safe</li><li>Student case? Call SAS: <strong>{officialInfo.sasNumber}</strong></li><li>Report promptly in the WSH Portal</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.wshPortal}>WSH Portal</ActionLink><ActionLink href={officialInfo.links.studentInsurance}>Student insurance</ActionLink></div></article>}
      {tab==='hazard'&&<article><p className="eyebrow">Hazard or defect</p><h3>Call {officialInfo.faultNumber}</h3><ul><li>Make the area safer if you can</li><li>Alert the person in charge</li><li>Report the fault</li></ul><ActionLink href={officialInfo.links.faultReport}>Report a fault</ActionLink></article>}
    </div>
    <button className="primary guide-finish" onClick={onComplete}>Finish activity <ArrowRight/></button>
  </section>;
}

function ResetDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(open)cancelRef.current?.focus()},[open]);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onCancel()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onCancel]);
  if(!open)return null;
  return <div className="reset-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel()}}><section className="reset-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><RotateCcw/><p className="eyebrow">Start again</p><h2 id="reset-title">Reset your activity?</h2><p id="reset-description">This clears your saved progress and returns all scenarios to 0/5.</p><div><button ref={cancelRef} className="secondary" onClick={onCancel}>Keep progress</button><button className="reset-confirm" onClick={onConfirm}>Reset activity</button></div></section></div>;
}

function Completion({ onReview, onGuide, onReset }: { onReview: (view: View) => void; onGuide: () => void; onReset: () => void }) {
  const reviewItems:{view:View;n:string;label:string}[]=[{view:'office',n:'01',label:'Office hazards'},{view:'evacuation',n:'02',label:'Fire emergency'},{view:'walkway',n:'03',label:'Injury response'},{view:'haze',n:'04',label:'Haze response'},{view:'reporting',n:'05',label:'Reporting'}];
  return <section className="completion"><Sparkles/><p className="eyebrow">CLTE WSH Week 2026</p><h2>You’re done</h2><p>Five scenarios. Three ideas to keep.</p><div className="completion-review"><article><span>01</span><strong>Care first</strong><p>Help the person. Control the risk.</p></article><article><span>02</span><strong>Call clearly</strong><p>For serious injury: 995 + exact location.</p></article><article><span>03</span><strong>Close the loop</strong><p>Report, join roll call and remain.</p></article></div><div className="personal-takeaway"><Check/><span>Know your nearest exit, assembly point and emergency contacts.</span></div><div className="review-hub"><p className="eyebrow">Replay any scenario</p><div>{reviewItems.map(item=><button key={item.view} onClick={()=>onReview(item.view)}><span>{item.n}</span>{item.label}<ArrowRight/></button>)}</div></div><div className="completion-actions"><button className="start-again" onClick={onReset}><RotateCcw/>Start again</button><button className="primary" onClick={onGuide}>Contact guide <ArrowRight/></button></div></section>;
}

export default function App() {
  const [progress,setProgress]=useSavedProgress(); const [menu,setMenu]=useState(false); const [resetOpen,setResetOpen]=useState(false);
  const [view,setView]=useState<View>('intro');
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'});setMenu(false)},[view]);
  const complete=(key:keyof Progress,next:View)=>{setProgress(v=>({...v,[key]:true}));setView(next)};
  const scenarioKeys:(keyof Progress)[]=['office','walkway','haze','evacuation','reporting'];
  const completed=useMemo(()=>scenarioKeys.filter(key=>progress[key]).length,[progress]);
  const chapters:{n:string;id:keyof Progress;label:string}[]=[{n:'01',id:'office',label:'Hazards'},{n:'02',id:'evacuation',label:'Fire'},{n:'03',id:'walkway',label:'Injury'},{n:'04',id:'haze',label:'Haze'},{n:'05',id:'reporting',label:'Report'}];
  const resumeView:View=!progress.office?'office':!progress.evacuation?'evacuation':!progress.walkway?'walkway':!progress.haze?'haze':!progress.reporting?'reporting':!progress.practice?'practice':!progress.guide?'guide':'completion';
  const resumeLabels:Record<View,string>={intro:'activity',office:'office hazards',walkway:'injury response',haze:'haze response',evacuation:'fire emergency',reporting:'reporting',practice:'report practice',guide:'WSH contacts',completion:'activity review'};
  const startLabel=progress.completion?'Review activity':completed?`Continue: ${resumeLabels[resumeView]}`:'Start online activity';
  const statusText=progress.completion?'Completed · progress saved':completed===0?'':completed<5?`${completed}/5 scenarios completed`:!progress.practice?'5/5 scenarios · report practice remaining':!progress.guide?'Report practice complete · contacts remaining':'Activity complete';
  const headerStatus=completed<5?`${completed}/5 scenarios`:!progress.practice?'5/5 · Report practice':!progress.guide?'5/5 · Contacts':'Activity complete';
  const resetProgress=()=>{localStorage.removeItem('clte-safety-progress');sessionStorage.removeItem('clte-safety-progress');setProgress(initialProgress);setView('intro');setResetOpen(false)};
  return <div className="app-shell"><header><button className="logo" onClick={()=>setView('intro')} aria-label="Ngee Ann Polytechnic · CLTE workplace safety online activity · Home"><img src="/assets/np-logo.png" alt="Ngee Ann Polytechnic"/><span className="logo-title">CLTE online activity</span></button><nav className={menu?'open':''} aria-label="Scenarios · open in any order">{chapters.map(({n,id,label})=><button key={id} onClick={()=>setView(id)} className={`${view===id?'current':''} ${progress[id]?'done':''}`}>{n}<span>{label}</span></button>)}</nav><div className="header-tools"><span aria-live="polite">{headerStatus}</span><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button></div></header>
    <main className="experience-stage"><div key={view} className="view-transition">{view==='intro'&&<Intro startLabel={startLabel} statusText={statusText} canReset={completed>0||progress.practice||progress.guide||progress.completion} onReset={()=>setResetOpen(true)} onStart={()=>setView(resumeView)}/>} {view==='office'&&<OfficeScene onComplete={()=>complete('office','evacuation')}/>} {view==='evacuation'&&<EvacuationScene onComplete={()=>complete('evacuation','walkway')}/>} {view==='walkway'&&<WetScene onComplete={()=>complete('walkway','haze')}/>} {view==='haze'&&<HazeInterstitial onComplete={()=>complete('haze','reporting')}/>} {view==='reporting'&&<RoutingScene onComplete={()=>complete('reporting','practice')}/>} {view==='practice'&&<PracticeReport onComplete={()=>complete('practice','guide')}/>} {view==='guide'&&<PocketGuide onComplete={()=>{setProgress(value=>({...value,guide:true,completion:true}));setView('completion')}}/>} {view==='completion'&&<Completion onReview={setView} onGuide={()=>setView('guide')} onReset={()=>setResetOpen(true)}/>}</div></main><ResetDialog open={resetOpen} onCancel={()=>setResetOpen(false)} onConfirm={resetProgress}/></div>;
}
