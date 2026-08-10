import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ClipboardCheck, CloudFog, ExternalLink, Eye, Flame, HeartHandshake, Info, MapPin, Menu, Phone, Sparkles, Volume2, VolumeX, Wrench, X } from 'lucide-react';
import { officeHotspots, officialInfo, routes, type Hotspot } from './config';

type Progress = { office: boolean; walkway: boolean; evacuation: boolean; reporting: boolean };
type View = 'intro' | 'office' | 'walkway' | 'haze' | 'evacuation' | 'reporting' | 'practice' | 'guide' | 'completion';
const initialProgress: Progress = { office: false, walkway: false, evacuation: false, reporting: false };

function useSavedProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try { return JSON.parse(localStorage.getItem('clte-safety-progress') || sessionStorage.getItem('clte-safety-progress') || '') as Progress; } catch { return initialProgress; }
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

function Intro({ onStart, startLabel }: { onStart: () => void; startLabel: string }) {
  return <section id="intro" className="intro">
    <div className="intro-copy">
      <p className="eyebrow light">CLTE staff activity</p>
      <h1>WSH Safety Week <em>2026</em></h1>
      <p className="tagline">Make the call in five workplace safety scenarios.</p>
      <div className="intro-actions"><button className="primary light-button" onClick={onStart}>{startLabel} <ArrowDown size={19}/></button></div>
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
    <SceneHeader kicker="01 · Spot hazards" title="Make this office area safe" copy="Select each marked hazard and choose the action that removes the risk."/>
    <div className="office-workspace"><div className="scene-frame">
      <img src="/assets/office.webp" alt="Illustrated CLTE-style office with cubicles, a shared walkway and colleagues preparing in a meeting room."/>
      {officeHotspots.map(h=><LensHotspot key={h.id} item={h} active={handled.some(item=>item.id===h.id)} onOpen={()=>setActive(h)}/>)}
      <div className="scene-counter" aria-live="polite"><Eye size={16}/>{handled.length} hazards fixed</div>
    </div><aside className={`bottom-sheet ${active ? 'open' : ''}`} aria-live="polite">
      {active?<><button className="sheet-close" onClick={()=>setActive(null)} aria-label="Close decision"><X/></button><h3>{active.title}</h3><p>{active.body}</p><div className="decision-options">{active.choices.map(choice=><button key={choice.id} onClick={()=>setAnswers(current=>({...current,[active.id]:choice.id}))} className={answers[active.id]===choice.id?'selected':''}>{choice.label}</button>)}</div>{activeChoice&&<div className={`decision-consequence ${activeChoice.best?'good':'consider'}`}><Info/><div><strong>{activeChoice.best?'Hazard removed':'Hazard remains'}</strong><p>{activeChoice.feedback}</p></div></div>}</>:<div className="decision-empty"><Eye/><h3>Select a marked hazard.</h3></div>}
    </aside>
    </div>
    {handled.length>=3&&<div className="scene-complete reveal"><Check/><strong>Office hazards addressed</strong><button className="primary" onClick={onComplete}>Continue <ArrowRight/></button></div>}
  </section>;
}

function WetScene({ onComplete }: { onComplete: () => void }) {
  const actions=[{id:'photo',label:'Take photos before helping'},{id:'protect',label:'Redirect people away from the wet area'},{id:'care',label:'Check the student and ask what help is needed'},{id:'wait',label:'Wait a few days before reporting'},{id:'follow',label:'Arrange first aid and report the incident'},{id:'leave',label:'Leave the area to find cleaning supplies'}];
  const [sequence,setSequence]=useState<string[]>([]); const [checked,setChecked]=useState(false);
  const correct=sequence.join(',')==='care,protect,follow';
  const addAction=(id:string)=>{setChecked(false);setSequence(current=>current.includes(id)||current.length>=3?current:[...current,id])};
  const removeAction=(id:string)=>{setChecked(false);setSequence(current=>current.filter(item=>item!==id))};
  return <section id="walkway" className="chapter wet">
    <SceneHeader kicker="02 · Respond to an injury" title="A student has slipped" copy="Choose the first three actions, in the order you would take them."/>
    <div className="scene-frame rain-scene"><img src="/assets/walkway.webp" alt="Illustrated wet sheltered campus walkway where a staff member checks on a seated student and another redirects pedestrians."/><div className="rain" aria-hidden="true"/></div>
    <div className="response-builder"><div className="action-bank" aria-label="Available actions">{actions.map(action=><button key={action.id} draggable={!sequence.includes(action.id)} disabled={sequence.includes(action.id)} onDragStart={event=>event.dataTransfer.setData('text/plain',action.id)} onClick={()=>addAction(action.id)}><strong>{action.label}</strong><span>+</span></button>)}</div><div className="response-timeline" onDragOver={event=>event.preventDefault()} onDrop={event=>addAction(event.dataTransfer.getData('text/plain'))}>{[0,1,2].map(index=>{const id=sequence[index];const action=actions.find(item=>item.id===id);return <div className={`timeline-slot ${action?'filled':''}`} key={index}>{action?<button onClick={()=>removeAction(action.id)}><span>{index+1}</span><strong>{action.label}</strong><small>Remove</small></button>:<><span>{index+1}</span><small>Select an action</small></>}</div>})}</div><div className="builder-footer"><button className="secondary" disabled={!sequence.length} onClick={()=>{setSequence([]);setChecked(false)}}>Clear</button><button className="primary" disabled={sequence.length!==3} onClick={()=>setChecked(true)}>Check response <ArrowRight/></button></div>{checked&&!correct&&<div className="decision-consequence consider"><Info/><div><strong>Change the order</strong><p>Attend to the student, prevent another slip, then arrange first aid and reporting.</p></div></div>}{checked&&correct&&<div className="builder-success reveal"><Check/><div><strong>Correct order</strong><p>Attend to the student, protect others, then arrange first aid and report.</p></div><button className="primary" onClick={onComplete}>Continue <ArrowRight/></button></div>}</div>
  </section>;
}

function HazeAtmosphere({ step, sheltered, urgent }: { step: number; sheltered: boolean; urgent: boolean }) {
  const particles = Array.from({ length: 42 }, (_, index) => ({
    id: index,
    left: `${(index * 37 + 11) % 101}%`,
    top: `${(index * 53 + 7) % 94}%`,
    delay: `${-((index * 0.41) % 8).toFixed(2)}s`,
    duration: `${6 + (index % 7) * 1.2}s`,
    size: `${2 + (index % 5) * 1.2}px`,
  }));

  return <div className={`haze-atmosphere stage-${step} ${sheltered ? 'sheltered' : ''} ${urgent ? 'urgent' : ''}`} aria-hidden="true">
    <div className="haze-sun" />
    <div className="haze-buildings"><i/><i/><i/><i/><i/></div>
    <div className="haze-indoor"><span/><span/><b>73</b></div>
    <div className="haze-person"><i/><span/></div>
    <div className="haze-plume plume-one"/><div className="haze-plume plume-two"/><div className="haze-plume plume-three"/>
    <div className="haze-particles">{particles.map(particle=><i key={particle.id} style={{left:particle.left,top:particle.top,animationDelay:particle.delay,animationDuration:particle.duration,width:particle.size,height:particle.size}}/>)}</div>
    <div className="air-current current-one"/><div className="air-current current-two"/>
  </div>;
}

function HazeInterstitial({ onComplete }: { onComplete: () => void }) {
  const [step,setStep]=useState(0); const [plan,setPlan]=useState<string[]>([]); const [planChecked,setPlanChecked]=useState(false); const [place,setPlace]=useState<string|null>(null); const [escalation,setEscalation]=useState<string|null>(null);
  const planCorrect=plan.length===2&&plan.includes('indoors')&&plan.includes('check'); const placeCorrect=place==='blk73'; const escalationCorrect=escalation==='help';
  const togglePlan=(id:string)=>{setPlanChecked(false);setPlan(current=>current.includes(id)?current.filter(item=>item!==id):current.length<2?[...current,id]:current)};
  const status = step===0 ? ['Exposure','Elevated'] : step===1 ? ['Find shelter',placeCorrect?'Indoors':'Nearby'] : ['Symptoms',escalationCorrect?'Help called':'Worsening'];
  const moveHaze=(event:React.PointerEvent<HTMLElement>)=>{const bounds=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--haze-x',`${((event.clientX-bounds.left)/bounds.width-.5)*18}px`);event.currentTarget.style.setProperty('--haze-y',`${((event.clientY-bounds.top)/bounds.height-.5)*12}px`)};
  const resetHaze=(event:React.PointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--haze-x','0px');event.currentTarget.style.setProperty('--haze-y','0px')};

  return <section className={`haze-activity haze-simulation haze-stage-${step} ${placeCorrect?'air-clearing':''} ${escalationCorrect?'help-active':''}`} onPointerMove={moveHaze} onPointerLeave={resetHaze}>
    <HazeAtmosphere step={step} sheltered={placeCorrect} urgent={step===2}/>
    <div className="haze-brief">
      <div className="haze-icon"><CloudFog/></div><p className="eyebrow">Haze response</p><h2>A colleague feels unwell outdoors.</h2><p>Near Block 73, a colleague has a persistent cough, feels light-headed and tells you they have asthma.</p>
      <div className="haze-status" aria-live="polite"><span><i/>{status[0]}</span><strong>{status[1]}</strong><div><i/></div></div>
    </div>
    <div className="haze-console">
      <div className="haze-progress" aria-label={`Haze scenario step ${step+1} of 3`}><span className={step>=0?'active':''}>Assess</span><i className={step>=1?'filled':''}/><span className={step>=1?'active':''}>Locate</span><i className={step>=2?'filled':''}/><span className={step>=2?'active':''}>Escalate</span></div>
      {step===0&&<div className="haze-step reveal"><p className="eyebrow">Immediate response</p><h3>Choose two actions.</h3><div className="haze-plan-options"><button className={plan.includes('indoors')?'selected':''} onClick={()=>togglePlan('indoors')}><span>{plan.includes('indoors')?<Check/>:'01'}</span>Move indoors</button><button className={plan.includes('check')?'selected':''} onClick={()=>togglePlan('check')}><span>{plan.includes('check')?<Check/>:'02'}</span>Check symptoms and support needed</button><button className={plan.includes('mask')?'selected':''} onClick={()=>togglePlan('mask')}><span>{plan.includes('mask')?<Check/>:'03'}</span>Wear a mask and finish the outdoor task</button><button className={plan.includes('home')?'selected':''} onClick={()=>togglePlan('home')}><span>{plan.includes('home')?<Check/>:'04'}</span>Ask them to travel home alone</button></div>{planChecked&&<div className={`decision-consequence ${planCorrect?'good':'consider'}`}><Info/><div><strong>{planCorrect?'Correct':'Try again'}</strong><p>{planCorrect?'Move indoors, then check their symptoms and support needs.':'Reduce their exposure and assess their condition.'}</p></div></div>}<div className="haze-step-nav">{planCorrect&&planChecked?<button className="primary" onClick={()=>setStep(1)}>Choose a location <ArrowRight/></button>:<button className="primary" disabled={plan.length!==2} onClick={()=>setPlanChecked(true)}>Check choices</button>}</div></div>}
      {step===1&&<div className="haze-step reveal"><p className="eyebrow">Nearby spaces</p><h3>Move the colleague indoors.</h3><div className="haze-location-options location-map"><button className={place==='library'?'selected':''} onClick={()=>setPlace('library')}><i/><strong>Library</strong><span>Farther</span></button><button className={place==='blk73'?'selected':''} onClick={()=>setPlace('blk73')}><i/><strong>Block 73</strong><span>Nearby · air-conditioned</span></button><button className={place==='walkway'?'selected':''} onClick={()=>setPlace('walkway')}><i/><strong>Walkway</strong><span>Nearby · open air</span></button></div>{place&&<div className={`decision-consequence ${placeCorrect?'good':'consider'}`}><Info/><div><strong>{placeCorrect?'Good fit':'Look at distance and exposure'}</strong><p>{placeCorrect?'Block 73 offers a nearby air-conditioned Rest & Recovery space.':'Choose a nearby space that reduces haze exposure.'}</p></div></div>}{placeCorrect&&<button className="primary haze-next" onClick={()=>setStep(2)}>Continue <ArrowRight/></button>}</div>}
      {step===2&&<div className="haze-step reveal"><p className="eyebrow">Five minutes later</p><h3>Breathing becomes difficult.</h3><div className="haze-location-options escalation-dial"><button className={escalation==='wait'?'selected':''} onClick={()=>setEscalation('wait')}><strong>Rest</strong><span>Monitor</span></button><button className={escalation==='home'?'selected':''} onClick={()=>setEscalation('home')}><strong>Go home</strong><span>Travel alone</span></button><button className={`urgent-choice ${escalation==='help'?'selected':''}`} onClick={()=>setEscalation('help')}><strong>Urgent help</strong><span>Stay + call</span></button></div>{escalation&&<div className={`decision-consequence ${escalationCorrect?'good':'consider'}`}><Info/><div><strong>{escalationCorrect?'Escalate':'Symptoms have changed'}</strong><p>{escalationCorrect?`Stay with them. For a serious medical emergency, call ${officialInfo.ambulanceNumber} and give the exact location.`:'Difficulty breathing needs more than rest or solo travel.'}</p></div></div>}{escalationCorrect&&<button className="primary haze-next" onClick={onComplete}>Continue <ArrowRight/></button>}</div>}
    </div>
  </section>;
}

function EvacuationScene({ onComplete }: { onComplete: () => void }) {
  const [fireStage,setFireStage]=useState(0); const [answer,setAnswer]=useState<string|null>(null); const [mapOpen,setMapOpen]=useState(false); const [destinationChoice,setDestinationChoice]=useState<string|null>(null); const [rollChoice,setRollChoice]=useState<string|null>(null);
  const fireDecisions=[
    {kicker:'Alarm · first response',title:'The alarm sounds. You smell burning.',copy:'Light smoke is visible near the corridor. What do you do first?',status:'Alarm active · light smoke',choices:[
      {id:'leave',label:'Stop the activity and direct everyone out calmly',feedback:'Clear direction gets the group moving immediately. Leave belongings and begin evacuation.',best:true},
      {id:'investigate',label:'Check where the smoke is coming from',feedback:'Do not delay evacuation to investigate a suspected fire or smoke source.',best:false},
      {id:'belongings',label:'Ask everyone to collect laptops and bags',feedback:'Belongings cost time. Leave them and move promptly.',best:false},
    ]},
    {kicker:'Route change',title:'Smoke drifts across the usual exit.',copy:'Visibility at that doorway is falling. Choose the safe response.',status:'Smoke at usual exit · route changes',choices:[
      {id:'alternate',label:'Keep clear of smoke and follow the warden to a safe exit',feedback:'Do not enter the smoky route. Follow the fire warden and posted evacuation instructions to the nearest safe exit.',best:true},
      {id:'push',label:'Move quickly through the smoke because the exit is close',feedback:'A familiar or shorter route is not safe when smoke is present. Keep clear and use a safe alternative.',best:false},
      {id:'lift',label:'Use the lift to avoid the smoky corridor',feedback:'Do not use the lift unless emergency personnel specifically direct you to do so.',best:false},
    ]},
    {kicker:'Keep the group moving',title:'A colleague with a cane hesitates.',copy:'The route is clear, but they may need support. What now?',status:'Safe exit visible · assistance needed',choices:[
      {id:'assist',label:'Offer help, alert the warden and move with the group',feedback:'Offer support without blocking the evacuation flow, and keep the fire warden informed.',best:true},
      {id:'carry',label:'Lift and carry them without asking',feedback:'Unplanned lifting can injure both people. Ask what help is needed and coordinate with the warden.',best:false},
      {id:'leave',label:'Leave them behind so the group is not delayed',feedback:'People who may need assistance should not be abandoned. Alert the warden and support a safe evacuation.',best:false},
    ]},
  ];
  const decision=fireDecisions[fireStage]; const activeChoice=decision.choices.find(choice=>choice.id===answer);
  const advanceFire=()=>{if(fireStage<2){setFireStage(stage=>stage+1);setAnswer(null)}else setMapOpen(true)};
  const destinationCorrect=destinationChoice==='admin-field'; const rollCorrect=rollChoice==='report';
  return <section id="evacuation" className={`chapter evacuation fire-response fire-stage-${fireStage} ${activeChoice?.best?'decision-safe':''}`}>
    <SceneHeader kicker="03 · Fire emergency" title="Alarm to roll call" copy="Choose what to do at each moment."/>
    {!mapOpen&&<div className="fire-scenario">
      <div className="scene-frame alarm-scene fire-scene">
        <img src="/assets/evacuation.webp" alt="Illustrated training room evacuation with a fire warden guiding a calm group and a colleague assisting a person with a walking cane."/>
        <div className="fire-vignette"/><div className="smoke smoke-near"/><div className="smoke smoke-far"/>
        <div className="embers" aria-hidden="true">{Array.from({length:18},(_,index)=><i key={index} style={{left:`${44+(index*23)%50}%`,animationDelay:`-${(index*.37).toFixed(2)}s`,animationDuration:`${3.4+(index%5)*.55}s`}}/>)}</div>
        <span className="alarm-dot" aria-label="Fire alarm active"/><div className="alarm-rings" aria-hidden="true"><i/><i/><i/></div>
        <div className="scene-alert" aria-live="polite"><span><Flame/>Fire alarm</span><strong>{decision.status}</strong><small>Moment {fireStage+1} of 3</small></div>
      </div>
      <div className="fire-decision reveal" key={fireStage}>
        <div className="fire-decision-head"><div><p className="eyebrow">{decision.kicker}</p><h3>{decision.title}</h3><p>{decision.copy}</p></div><div className="fire-moments" aria-label={`Emergency response moment ${fireStage+1} of 3`}>{[0,1,2].map(index=><i key={index} className={index<=fireStage?'active':''}/>)}</div></div>
        <div className="fire-options">{decision.choices.map((choice,index)=><button key={choice.id} className={answer===choice.id?`selected ${choice.best?'safe':'risk'}`:''} onClick={()=>setAnswer(choice.id)}><span>0{index+1}</span><strong>{choice.label}</strong><ArrowRight/></button>)}</div>
        {activeChoice&&<div className={`decision-consequence fire-feedback ${activeChoice.best?'good':'consider'}`}><Info/><div><strong>{activeChoice.best?'Keep moving':'Pause and reassess'}</strong><p>{activeChoice.feedback}</p></div></div>}
        {activeChoice?.best&&<button className="primary fire-advance" onClick={advanceFire}>{fireStage<2?'Continue evacuation':'Continue to assembly point'} <ArrowRight/></button>}
      </div>
    </div>}
    {mapOpen&&<div className="assembly assembly-point-drill reveal"><div className={`assembly-marker ${destinationCorrect?'confirmed':''}`} aria-label="CLTE assembly point: Zone A at Admin Field"><div className="assembly-pin"><MapPin/><span>A</span></div><p>CLTE assembly point</p><h3>{officialInfo.assemblyArea}</h3><strong>{officialInfo.assemblyZone}</strong><small>Follow fire wardens and posted instructions.</small></div><div className="drill-panel"><p className="eyebrow">Assembly point</p><h3>Where should CLTE staff from Block 27 assemble?</h3><div className="drill-options assembly-options"><button className={destinationChoice==='admin-field'?'selected':''} onClick={()=>setDestinationChoice('admin-field')}><strong>Zone A · Admin Field</strong></button><button className={destinationChoice==='entrance'?'selected':''} onClick={()=>setDestinationChoice('entrance')}><strong>Outside the Block 27 entrance</strong></button><button className={destinationChoice==='nearby'?'selected':''} onClick={()=>setDestinationChoice('nearby')}><strong>Any open space nearby</strong></button></div>{destinationChoice&&<div className={`decision-consequence ${destinationCorrect?'good':'consider'}`}><Info/><div><strong>{destinationCorrect?'Correct · Zone A, Admin Field':'Go to the assigned assembly point'}</strong><p>{destinationCorrect?'Remain with the CLTE group for roll call.':'CLTE staff from Block 27 assemble at Zone A, Admin Field.'}</p></div></div>}{destinationCorrect&&<div className="rollcall-decision reveal"><p className="eyebrow">Roll call</p><h3>A colleague is missing. What do you do?</h3><div className="drill-options"><button className={rollChoice==='report'?'selected':''} onClick={()=>setRollChoice('report')}>Tell the fire warden what I know and remain in Zone A</button><button className={rollChoice==='search'?'selected':''} onClick={()=>setRollChoice('search')}>Return to Block 27 to look for them</button><button className={rollChoice==='leave'?'selected':''} onClick={()=>setRollChoice('leave')}>Leave the assembly area to call them</button></div>{rollChoice&&<div className={`decision-consequence ${rollCorrect?'good':'consider'}`}><Info/><div><strong>{rollCorrect?'Report and remain':'Do not leave or re-enter'}</strong><p>{rollCorrect?'Tell the warden whether they are away, off campus or unaccounted for. Remain until dismissed.':'Report what you know, stay with the group and never re-enter to search.'}</p></div></div>}</div>}{rollCorrect&&<div className="role-handoff reveal"><p><strong>ERC/AERC</strong><span>Coordinates response and headcount.</span></p><p><strong>Fire wardens</strong><span>Guide evacuation and report group status.</span></p><p><strong>Staff</strong><span>Follow, assist, report and remain.</span></p><div><button className="primary" onClick={onComplete}>Continue <ArrowRight/></button></div></div>}</div></div>}
  </section>;
}

function RoutingScene({ onComplete }: { onComplete: () => void }) {
  const [active,setActive]=useState(routes[0].id); const [answers,setAnswers]=useState<Record<string,string>>({});
  const scenario=routes.find(r=>r.id===active)!; const picked=answers[active];
  const channels=[{id:'emergency',label:'Call for emergency help',icon:<Phone/>},{id:'incident',label:'Report in WSH Portal',icon:<ClipboardCheck/>},{id:'fault',label:'Report a fault or defect',icon:<Wrench/>}];
  const routeTo=(channel:string,id=active)=>{setActive(id);setAnswers(value=>({...value,[id]:channel}))};
  return <section id="reporting" className="chapter reporting">
    <SceneHeader kicker="04 · Report correctly" title="Choose the correct reporting channel" copy="Match each situation to emergency help, the WSH Portal, or fault reporting."/>
    <div className="scene-frame"><img src="/assets/response.webp" alt="Illustrated response desk with a phone, report document and maintenance tool leading to three paths."/></div>
    <div className="routing-board"><div className="route-inbox"><p className="eyebrow">Select a situation</p>{routes.map((route,i)=><button draggable key={route.id} className={`${active===route.id?'active':''} ${answers[route.id]===route.correct?'done':''}`} onDragStart={event=>event.dataTransfer.setData('text/plain',route.id)} onClick={()=>setActive(route.id)}><span>0{i+1}</span><strong>{route.label}</strong>{answers[route.id]===route.correct&&<Check/>}</button>)}</div><div className="channel-board">{channels.map(channel=><button key={channel.id} className={`channel-drop ${picked===channel.id?'active':''}`} onClick={()=>routeTo(channel.id)} onDragOver={event=>event.preventDefault()} onDrop={event=>routeTo(channel.id,event.dataTransfer.getData('text/plain'))}>{channel.icon}<strong>{channel.label}</strong><span>{routes.filter(route=>answers[route.id]===channel.id).length||'Select'}</span></button>)}</div>{picked&&<div className={`route-feedback ${picked===scenario.correct?'good':'consider'}`}><Info/><div><strong>{picked===scenario.correct?scenario.channel:'Choose a different channel'}</strong><p>{picked===scenario.correct?scenario.detail:'Decide whether the situation needs immediate emergency help, an incident report, or a fault report.'}</p></div></div>}{routes.every(route=>answers[route.id]===route.correct)&&<button className="primary route-finish" onClick={onComplete}>Practise completing a report <ArrowRight/></button>}</div>
  </section>;
}

function PracticeReport({ onComplete }: { onComplete: () => void }) {
  const [step,setStep]=useState(0); const [complete,setComplete]=useState(false);
  const [data,setData]=useState({reportType:'Incident',nature:'Fall, trip and slip',when:'27 April, during wet weather',place:'Common area',location:'Tactile tiles near the slope beside Block 73',severity:'Minor injury',person:'NP Student',account:'During wet weather on 27 April, a student slipped on the tactile tiles near the slope beside Block 73.',actions:'Checked on the student, kept others away from the wet area, informed the relevant teams and recorded the incident details.'});
  const choose=(key:keyof typeof data,value:string)=>setData({...data,[key]:value});
  const choices=(label:string,key:keyof typeof data,items:string[])=><fieldset className="choice-field"><legend>{label}</legend><div>{items.map(item=><button type="button" key={item} aria-pressed={data[key]===item} className={data[key]===item?'selected':''} onClick={()=>choose(key,item)}>{data[key]===item&&<Check/>}{item}</button>)}</div></fieldset>;
  return <section className="practice mock-report" id="practice"><div className="mock-shell"><aside className="mock-steps"><p className="eyebrow">Practice report</p><h3>Wet walkway incident</h3>{['Classify','Impact','Details'].map((label,i)=><button key={label} onClick={()=>i<=step&&setStep(i)} className={`${step===i?'current':''} ${i<step||complete?'done':''}`} disabled={i>step}><span>{i<step||complete?<Check/>:i+1}</span>{label}</button>)}</aside><div className="mock-panel"><div className="step-counter">{step+1} / 3</div>{step===0&&<div className="mock-step reveal"><p className="eyebrow">Portal Section A</p><h2>What type of report is this?</h2>{choices('Report type','reportType',['Incident','Near miss'])}{choices('Nature','nature',['Fall, trip and slip','Personal medical condition','Others'])}{data.reportType==='Near miss'&&<div className="learning-feedback urgent"><Info/><span><strong>Select “Incident”:</strong> the student slipped and was affected.</span></div>}</div>}{step===1&&<div className="mock-step reveal"><p className="eyebrow">Portal Sections B–D</p><h2>Where did it happen, and how serious was it?</h2>{choices('Place','place',['Common area','Office','Classroom / LT'])}<label className="mock-input"><span>Exact location</span><input value={data.location} onChange={e=>choose('location',e.target.value)} /></label>{choices('Injury severity','severity',['No injury','Minor injury','Major injury'])}{choices('Person affected','person',['NP Student','NP Staff','Visitor / Public'])}{data.severity==='Major injury'&&<div className="learning-feedback urgent"><Info/><span><strong>Get emergency help first:</strong> call {officialInfo.ambulanceNumber}, give the exact location, then inform NP Guard Post at {officialInfo.emergencyNumber}.</span></div>}</div>}{step===2&&<div className="mock-step reveal"><p className="eyebrow">Portal Section G</p><h2>What happened, and what did you do?</h2><label className="mock-input"><span>Account · 5W1H</span><textarea value={data.account} maxLength={360} onChange={e=>choose('account',e.target.value)}/><small>{data.account.length}/360</small></label><label className="mock-input"><span>Actions taken</span><textarea value={data.actions} maxLength={300} onChange={e=>choose('actions',e.target.value)}/><small>{data.actions.length}/300</small></label><button className="fake-upload" type="button">walkway-condition.jpg <Check/></button></div>}<div className="mock-nav">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}{step<2?<button className="primary" onClick={()=>setStep(step+1)}>Next <ArrowRight/></button>:<button className="primary" onClick={()=>setComplete(true)}>Review report</button>}</div></div>{complete&&<aside className="report-preview mock-preview reveal"><button className="sheet-close" onClick={()=>setComplete(false)} aria-label="Close report preview"><X/></button><p className="eyebrow">Report summary</p><h3>{data.nature}</h3><dl><dt>Classification</dt><dd>{data.reportType} · {data.severity}</dd><dt>Where / when</dt><dd>{data.location} · {data.when}</dd><dt>Who</dt><dd>{data.person}</dd><dt>Account</dt><dd>{data.account}</dd><dt>Action</dt><dd>{data.actions}</dd></dl><div className="completed"><Check/><strong>Required details included</strong></div><button className="primary" onClick={onComplete}>View WSH contacts <ArrowRight/></button></aside>}</div></section>;
}

function PocketGuide({ onComplete }: { onComplete: () => void }) {
  const [tab,setTab]=useState<'emergency'|'incident'|'hazard'>('emergency');
  return <section id="guide" className="guide interactive-guide"><div className="guide-title"><p className="eyebrow">CLTE staff reference</p><h2>WSH contacts and actions</h2></div><div className="guide-tabs" role="tablist"><button role="tab" aria-selected={tab==='emergency'} onClick={()=>setTab('emergency')}><Phone/>Emergency</button><button role="tab" aria-selected={tab==='incident'} onClick={()=>setTab('incident')}><HeartHandshake/>Incident or near miss</button><button role="tab" aria-selected={tab==='hazard'} onClick={()=>setTab('hazard')}><Wrench/>Hazard or defect</button></div><div className="guide-focus reveal" key={tab}>{tab==='emergency'&&<article><p className="eyebrow">Serious medical injury</p><h3>Call {officialInfo.ambulanceNumber}</h3><ul><li>Give a brief description and exact location</li><li>Inform NP Guard Post at <strong>{officialInfo.emergencyNumber}</strong> so the ambulance can be guided in</li><li>From Block 27: assemble at <strong>{officialInfo.assemblyZone} · {officialInfo.assemblyArea}</strong></li><li>Report useful status information and remain for roll call</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.emergencyInfo}>Emergency information</ActionLink><ActionLink href={officialInfo.links.oneMap}>Zone A location</ActionLink></div></article>}{tab==='incident'&&<article><p className="eyebrow">Incident or near miss</p><h3>Help the person. Make the area safe. Report.</h3><ul><li>Give immediate attention; seek a trained first aider if needed</li><li>For student cases, inform SAS at <strong>{officialInfo.sasNumber}</strong> and the relevant School/Division</li><li>Report incidents and near misses promptly through the WSH Portal</li></ul><div className="guide-actions"><ActionLink href={officialInfo.links.wshPortal}>Open WSH Portal</ActionLink><ActionLink href={officialInfo.links.studentInsurance}>Student insurance</ActionLink></div></article>}{tab==='hazard'&&<article><p className="eyebrow">Hazard, fault or defect</p><h3>Call {officialInfo.faultNumber}</h3><ul><li>Make the immediate area safer where possible</li><li>Alert the staff in charge if unsure</li><li>Call or report the fault online</li></ul><ActionLink href={officialInfo.links.faultReport}>Report a fault or hazard</ActionLink></article>}</div><button className="primary guide-finish" onClick={onComplete}>Complete activity <ArrowRight/></button></section>;
}

function Completion() {
  return <section className="completion"><Sparkles/><p className="eyebrow">CLTE WSH Safety Week 2026</p><h2>Activity complete</h2><div className="personal-takeaway"><Check/><span>Check the evacuation route and emergency contacts for the CLTE spaces you use.</span></div></section>;
}

export default function App() {
  const [progress,setProgress]=useSavedProgress(); const [sound,setSound]=useState(false); const [menu,setMenu]=useState(false);
  const [view,setView]=useState<View>('intro');
  useEffect(()=>{
    if(!sound)return;
    const chime=(event:MouseEvent)=>{if(!(event.target as HTMLElement).closest('button'))return;const audio=new AudioContext();const oscillator=audio.createOscillator();const gain=audio.createGain();oscillator.frequency.value=420;gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.07);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.07);oscillator.addEventListener('ended',()=>audio.close())};
    document.addEventListener('click',chime);return()=>document.removeEventListener('click',chime);
  },[sound]);
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'});setMenu(false)},[view]);
  const complete=(key:keyof Progress,next:View)=>{setProgress(v=>({...v,[key]:true}));setView(next)};
  const completed=useMemo(()=>Object.values(progress).filter(Boolean).length,[progress]);
  const chapters:{n:string;id:keyof Progress;label:string}[]=[{n:'01',id:'office',label:'Spot hazards'},{n:'02',id:'walkway',label:'Respond'},{n:'03',id:'evacuation',label:'Evacuate'},{n:'04',id:'reporting',label:'Report'}];
  const canVisit=(id:keyof Progress)=>id==='office'||(id==='walkway'&&progress.office)||(id==='evacuation'&&progress.walkway)||(id==='reporting'&&progress.evacuation);
  const resumeView:View=!progress.office?'office':!progress.walkway?'walkway':!progress.evacuation?'evacuation':!progress.reporting?'reporting':'completion';
  return <div className="app-shell"><header><button className="logo" onClick={()=>setView('intro')} aria-label="Ngee Ann Polytechnic · CLTE WSH Safety Week 2026 · Home"><img src="/assets/np-logo.png" alt="Ngee Ann Polytechnic"/><span className="logo-title">CLTE WSH 2026</span></button><nav className={menu?'open':''}>{chapters.map(({n,id,label})=><button key={id} disabled={!canVisit(id)} onClick={()=>setView(id)} className={`${view===id?'current':''} ${progress[id]?'done':''}`}>{n}<span>{label}</span></button>)}</nav><div className="header-tools"><span>{completed}/4 sections complete</span><button onClick={()=>setSound(!sound)} aria-label={sound?'Turn sound off':'Turn sound on'}>{sound?<Volume2/>:<VolumeX/>}</button><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button></div></header>
    <main className="experience-stage"><div key={view} className="view-transition">{view==='intro'&&<Intro startLabel={completed?'Continue activity':'Start activity'} onStart={()=>setView(resumeView)}/>} {view==='office'&&<OfficeScene onComplete={()=>complete('office','walkway')}/>} {view==='walkway'&&<WetScene onComplete={()=>complete('walkway','haze')}/>} {view==='haze'&&<HazeInterstitial onComplete={()=>setView('evacuation')}/>} {view==='evacuation'&&<EvacuationScene onComplete={()=>complete('evacuation','reporting')}/>} {view==='reporting'&&<RoutingScene onComplete={()=>complete('reporting','practice')}/>} {view==='practice'&&<PracticeReport onComplete={()=>setView('guide')}/>} {view==='guide'&&<PocketGuide onComplete={()=>setView('completion')}/>} {view==='completion'&&<Completion/>}</div></main></div>;
}
