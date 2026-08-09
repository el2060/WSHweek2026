import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronDown, CircleAlert, ClipboardCheck, CloudFog, ExternalLink, Eye, HeartHandshake, Info, MapPin, Menu, Phone, ShieldCheck, Sparkles, UserRound, Volume2, VolumeX, Wrench, X } from 'lucide-react';
import { evacuationActions, officeHotspots, officialInfo, routes, wetActions, type Hotspot } from './config';

type Progress = { office: boolean; walkway: boolean; evacuation: boolean; reporting: boolean };
type Profile = { name: string; context: 'office' | 'facilitation' | 'student' | 'mixed'; focus: 'notice' | 'respond' | 'evacuate' | 'report' };
const initialProgress: Progress = { office: false, walkway: false, evacuation: false, reporting: false };
const initialProfile: Profile = { name: '', context: 'mixed', focus: 'notice' };

function useSessionProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try { return JSON.parse(sessionStorage.getItem('clte-safety-progress') || '') as Progress; } catch { return initialProgress; }
  });
  useEffect(() => sessionStorage.setItem('clte-safety-progress', JSON.stringify(progress)), [progress]);
  return [progress, setProgress] as const;
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) return <button className="guide-link placeholder" disabled>{children}<span>Link to be confirmed</span></button>;
  return <a className="guide-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink size={17} /></a>;
}

function LensHotspot({ item, active, onOpen }: { item: Hotspot; active: boolean; onOpen: () => void }) {
  return <button className={`hotspot ${active ? 'found' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={onOpen} aria-label={`Inspect: ${item.title}`} aria-pressed={active}><span>{active ? <Check size={18} /> : <Eye size={18} />}</span></button>;
}

function SceneHeader({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return <div className="scene-heading"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{copy}</p></div>;
}

function Intro({ onStart, profile, setProfile }: { onStart: () => void; profile: Profile; setProfile: (profile: Profile) => void }) {
  return <section id="intro" className="intro">
    <div className="intro-orbit orbit-one" /><div className="intro-orbit orbit-two" />
    <div className="intro-copy">
      <p className="brand">Ngee Ann Polytechnic <span>· CLTE</span></p>
      <p className="eyebrow light">Safety & Health Week 2026</p>
      <h1>CLTE<br/><em>Safety Lens</em></h1>
      <p className="tagline">Notice. Respond. Report.</p>
      <p className="intro-text">Take a few minutes to explore everyday situations that CLTE colleagues may encounter—at work, around campus and while supporting others.</p>
      <div className="personalise"><div className="personalise-title"><UserRound/><span><strong>Set your lens</strong><small>Optional · stays in this browser session</small></span></div><div className="personalise-fields"><label><span>What should we call you?</span><input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value.slice(0,30)})} placeholder="First name (optional)"/></label><label><span>Most like your day-to-day?</span><select value={profile.context} onChange={e=>setProfile({...profile,context:e.target.value as Profile['context']})}><option value="mixed">A mix of things</option><option value="office">Office-based work</option><option value="facilitation">Facilitating sessions</option><option value="student">Supporting students</option></select></label><label><span>What would help most?</span><select value={profile.focus} onChange={e=>setProfile({...profile,focus:e.target.value as Profile['focus']})}><option value="notice">Spotting concerns early</option><option value="respond">Responding calmly</option><option value="evacuate">Evacuation readiness</option><option value="report">Knowing where to report</option></select></label></div></div>
      <button className="primary light-button" onClick={onStart}>{profile.name ? `Start ${profile.name}’s journey` : 'Start the journey'} <ArrowDown size={19}/></button>
      <div className="reassurance"><ShieldCheck size={19}/><span><strong>No test. No score.</strong> Just take a look and decide what you would do.</span><small>About 6–8 minutes</small></div>
    </div>
    <div className="lens-hero" aria-hidden="true"><div className="lens-glass"><Eye /></div><div className="lens-handle" /></div>
    <p className="scroll-note">Four situations <ArrowDown size={15}/></p>
  </section>;
}

function AdaptiveCue({ profile, scene }: { profile: Profile; scene: keyof Progress }) {
  const cues: Record<Profile['context'], Record<keyof Progress,string>> = {
    office:{office:'Your lens: shared routes and everyday setup are especially relevant to office-based work.',walkway:'Your lens: notice wet entry points before they become part of the office route.',evacuation:'Your lens: check who is in adjacent work areas as everyone begins to leave.',reporting:'Your lens: record the exact workplace location and the action already taken.'},
    facilitation:{office:'Your lens: keep meeting-room aisles and the route to the door clear before participants arrive.',walkway:'Your lens: if participants are moving between venues, prevent a second person entering the wet area.',evacuation:'Your lens: stop the session, orient visitors, then follow the fire wardens and posted route.',reporting:'Your lens: include the activity context and who was informed, without personal identifiers.'},
    student:{office:'Your lens: notice shared spaces from the perspective of someone unfamiliar with the room.',walkway:'Your lens: immediate wellbeing and a calm check-in come first; follow-up matters too.',evacuation:'Your lens: help students and visitors stay with the group through roll call.',reporting:'Your lens: record what happened without including unnecessary personal details.'},
    mixed:{office:'Your lens: start with anything affecting safe movement, electricity or emergency access.',walkway:'Your lens: care, prevent another incident, then report and follow through.',evacuation:'Your lens: help people leave calmly and remain together for roll call.',reporting:'Your lens: match urgency and incident type to the appropriate channel.'}
  };
  return <div className="adaptive-cue"><Eye/><span>{cues[profile.context][scene]}</span></div>;
}

function OfficeScene({ onComplete, profile }: { onComplete: () => void; profile: Profile }) {
  const [found, setFound] = useState<string[]>([]); const [active, setActive] = useState<Hotspot | null>(null);
  const inspect = (item: Hotspot) => { setActive(item); setFound(v => v.includes(item.id) ? v : [...v, item.id]); };
  return <section id="office" className="chapter">
    <SceneHeader kicker={`Situation 01 · Notice${profile.name ? ` · ${profile.name}` : ''}`} title="Before the meeting begins" copy="The workday is underway. What may need a second look? Tap anything you would attend to."/>
    <AdaptiveCue profile={profile} scene="office"/>
    <div className="scene-frame">
      <img src="/assets/office.webp" alt="Illustrated CLTE-style office with cubicles, a shared walkway and colleagues preparing in a meeting room."/>
      {officeHotspots.map(h => <LensHotspot key={h.id} item={h} active={found.includes(h.id)} onOpen={() => inspect(h)}/>)}
      <div className="scene-counter" aria-live="polite"><Eye size={16}/>{found.length} areas noticed</div>
    </div>
    <div className={`bottom-sheet ${active ? 'open' : ''}`} aria-live="polite">
      {active ? <><button className="sheet-close" onClick={() => setActive(null)} aria-label="Close detail"><X/></button><p className="eyebrow">Through the lens</p><h3>{active.title}</h3><p>{active.body}</p><div className="practical"><Check/><span>{active.action}</span></div></> : <p>Select a point in the scene to take a closer look.</p>}
    </div>
    {found.length >= 3 && <div className="priority reveal"><div><p className="eyebrow">Five minutes to go</p><h3>What would you attend to first?</h3><p>Start with safe movement, electrical safety or emergency access. Other housekeeping concerns can follow.</p></div><button className="primary" onClick={onComplete}>Situation explored <ArrowRight/></button></div>}
  </section>;
}

function WetScene({ onComplete, profile }: { onComplete: () => void; profile: Profile }) {
  const [chosen, setChosen] = useState<string[]>([]); const [showCase, setShowCase] = useState(false);
  const toggle = (id: string) => setChosen(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  return <section id="walkway" className="chapter wet">
    <SceneHeader kicker="Situation 02 · Respond" title="A wet campus walkway" copy="A student has slipped. What needs attention now? There may be more than one sensible action."/>
    <AdaptiveCue profile={profile} scene="walkway"/>
    <div className="scene-frame rain-scene"><img src="/assets/walkway.webp" alt="Illustrated wet sheltered campus walkway where a staff member checks on a seated student and another redirects pedestrians."/><div className="rain" aria-hidden="true"/></div>
    <div className="action-workspace">
      <div className="action-list">{wetActions.map(([id,label,detail]) => <button key={id} className={chosen.includes(id) ? 'selected' : ''} onClick={() => toggle(id)} aria-pressed={chosen.includes(id)}><span className="choice-mark">{chosen.includes(id) ? <Check/> : <span/>}</span><span><strong>{label}</strong>{chosen.includes(id) && <small>{detail}</small>}</span></button>)}</div>
      <aside><p className="eyebrow">A useful response</p><div className="response-flow"><span>Care</span><i/><span>Prevent another incident</span><i/><span>Report & follow up</span></div><p>Explore at least three actions to see how the real case was followed through.</p><button className="secondary" disabled={chosen.length < 3} onClick={() => setShowCase(true)}>See the follow-through</button></aside>
    </div>
    {showCase && <div className="case-follow reveal"><p className="eyebrow">Based on the 27 April case near Block 73</p><h3>Reporting led to action.</h3><p>An incident report was filed, details were verified, the student’s wellbeing and insurance follow-up were addressed, and the affected tactile tiles were replaced.</p><strong>Reporting helps causes to be investigated and corrective action to be taken.</strong><button className="primary" onClick={onComplete}>Continue <ArrowRight/></button></div>}
  </section>;
}

function HazeInterstitial() {
  const [open,setOpen]=useState(false);
  return <section className="haze-strip"><div><CloudFog/><p className="eyebrow">A quick situation</p><h2>Haze, and feeling unwell?</h2></div><button className="secondary" onClick={() => setOpen(!open)} aria-expanded={open}>See available support <ChevronDown className={open?'turn':''}/></button>{open && <div className="haze-answer reveal"><p>Air-conditioned Rest & Recovery spaces with air purifiers are available in:</p><ul><li>Classrooms</li><li>Library</li><li>Enclosed study areas at Blk 56, LT68D and Our Space@72</li><li>Food courts at Blk 22, 51 and 73</li></ul><ActionLink href={officialInfo.links.hazeSop}>View current Haze SOP</ActionLink></div>}</section>;
}

function EvacuationScene({ onComplete, profile }: { onComplete: () => void; profile: Profile }) {
  const [chosen,setChosen]=useState<number[]>([]); const [mapOpen,setMapOpen]=useState(false); const [roles,setRoles]=useState(false);
  const toggle=(i:number)=>setChosen(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i]);
  return <section id="evacuation" className="chapter evacuation">
    <SceneHeader kicker="Situation 03 · Evacuate" title="The alarm sounds" copy="A session is in progress. Choose the actions that help everyone leave calmly and account for the group."/>
    <AdaptiveCue profile={profile} scene="evacuation"/>
    <div className="scene-frame alarm-scene"><img src="/assets/evacuation.webp" alt="Illustrated training room evacuation with a fire warden guiding a calm group and a colleague assisting a person with a walking cane."/><span className="alarm-dot" aria-label="Evacuation alarm active"/></div>
    <div className="sequence"><p>Select the actions you would include. The order can vary with the situation.</p><div>{evacuationActions.map((a,i)=><button key={a} onClick={()=>toggle(i)} className={chosen.includes(i)?'selected':''} aria-pressed={chosen.includes(i)}><span>{chosen.includes(i)?<Check/>:i+1}</span>{a}</button>)}</div><button className="primary" disabled={chosen.length<5} onClick={()=>setMapOpen(true)}>Show the assembly destination <MapPin/></button></div>
    {mapOpen && <div className="assembly reveal">
      <div className="map-visual" role="img" aria-label="Simplified destination diagram showing CLTE colleagues assembling at Admin Field"><span className="map-start">CLTE locations</span><svg viewBox="0 0 500 180" aria-hidden="true"><path d="M55 120 C 145 5, 235 180, 345 78 S 430 60, 458 45"/><circle cx="458" cy="45" r="12"/></svg><button className="map-destination" onClick={onComplete}><MapPin/>Admin Field</button></div>
      <div><p className="eyebrow">CLTE assembly area</p><h3>{officialInfo.assemblyArea}</h3><p>Follow the posted evacuation route and fire wardens’ instructions. Remain at the assembly area for roll call and report anyone who may be missing.</p><button className="text-button" onClick={()=>setRoles(!roles)}>Who helps during an evacuation? <ChevronDown className={roles?'turn':''}/></button>{roles&&<div className="roles"><p><strong>ERC/AERC</strong> coordinates CLTE’s emergency response.</p><p><strong>Fire wardens</strong> guide evacuation, check assigned areas, assist evacuees and support roll call.</p><p><strong>First aiders</strong> provide basic first aid and seek further help where needed.</p><p><strong>All colleagues</strong> evacuate calmly, follow instructions and remain for roll call.</p></div>}</div>
    </div>}
  </section>;
}

function RoutingScene({ onComplete, profile }: { onComplete: () => void; profile: Profile }) {
  const [active,setActive]=useState(routes[0].id); const [answers,setAnswers]=useState<Record<string,string>>({});
  const scenario=routes.find(r=>r.id===active)!; const picked=answers[active];
  return <section id="reporting" className="chapter reporting">
    <SceneHeader kicker="Situation 04 · Report" title="Respond or report?" copy="Choose a situation, then route it to the channel that fits. Tap controls work as an alternative to dragging."/>
    <AdaptiveCue profile={profile} scene="reporting"/>
    <div className="scene-frame"><img src="/assets/response.webp" alt="Illustrated response desk with a phone, report document and maintenance tool leading to three paths."/></div>
    <div className="route-workspace">
      <div className="scenario-tabs" role="tablist" aria-label="Situations">{routes.map((r,i)=><button role="tab" aria-selected={active===r.id} className={active===r.id?'active':''} key={r.id} onClick={()=>setActive(r.id)}><span>0{i+1}</span>{r.label}{answers[r.id]===r.id&&<Check/>}</button>)}</div>
      <div className="route-panel"><p className="eyebrow">Where would you route this?</p><div className="channel-buttons">
        <button onClick={()=>setAnswers(v=>({...v,[active]:'emergency'}))}><Phone/>Emergency call</button>
        <button onClick={()=>setAnswers(v=>({...v,[active]:'incident'}))}><ClipboardCheck/>WSH Portal</button>
        <button onClick={()=>setAnswers(v=>({...v,[active]:'fault'}))}><Wrench/>Fault reporting</button>
      </div>{picked && <div className={`route-feedback ${picked===active?'good':'consider'}`}><Info/><div><strong>{picked===active?scenario.channel:'Take another look at the situation.'}</strong><p>{picked===active?scenario.detail:'Which route best matches whether someone needs immediate help, an injury occurred, or only a defect was found?'}</p></div></div>}
      {Object.keys(answers).filter(k=>answers[k]===k).length===3&&<button className="primary" onClick={onComplete}>Practise a short report <ArrowRight/></button>}</div>
    </div>
  </section>;
}

function PracticeReport() {
  const [complete,setComplete]=useState(false); const [data,setData]=useState({location:'Tactile tiles near the slope beside Block 73',time:'During wet weather',injured:'A student (no personal identifiers)',action:'Checked on the student and kept others clear',informed:'Relevant area owner and school'});
  const field=(label:string,key:keyof typeof data,options:string[])=><label><span>{label}</span><select value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}>{options.map(x=><option key={x}>{x}</option>)}</select></label>;
  return <section className="practice" id="practice"><div className="practice-banner"><CircleAlert/>PRACTICE MODE — Nothing entered here will be submitted</div><div className="practice-grid"><div><p className="eyebrow">Try the reporting habit</p><h2>Build a useful first report.</h2><p>Choose concise details from the wet-walkway situation. This prototype stores nothing beyond your current browser session.</p><div className="form-grid">{field('Location','location',[data.location,'Campus sheltered walkway'])}{field('Approximate time','time',[data.time,'Shortly after rain'])}{field('Who was affected','injured',[data.injured,'No one identified'])}{field('Immediate action','action',[data.action,'First aid requested'])}{field('Who was informed','informed',[data.informed,'Campus support service'])}<label><span>Simulated photo</span><button className="fake-upload" type="button">walkway-condition.jpg <Check/></button></label></div></div><aside className="report-preview"><p className="eyebrow">Report preview</p><h3>Wet walkway incident</h3><dl><dt>Where</dt><dd>{data.location}</dd><dt>What / when</dt><dd>A slip occurred {data.time.toLowerCase()}.</dd><dt>Who</dt><dd>{data.injured}</dd><dt>Action taken</dt><dd>{data.action}. {data.informed} informed.</dd></dl>{!complete?<button className="primary" onClick={()=>setComplete(true)}>Complete practice report</button>:<div className="completed"><Check/><strong>Practice report completed</strong><p>An actual report should be submitted through the appropriate official NP channel.</p></div>}</aside></div></section>;
}

function PocketGuide() {
  return <section id="guide" className="guide"><div className="guide-title"><p className="eyebrow">Save or screenshot</p><h2>Your Safety Pocket Guide</h2><p>The right next step, kept close.</p></div><div className="guide-columns"><article><Phone/><p className="eyebrow">Emergency</p><h3>{officialInfo.emergencyNumber}</h3><ul><li>Follow emergency personnel and fire wardens</li><li>CLTE assembly area: <strong>{officialInfo.assemblyArea}</strong></li><li>Remain for roll call; report anyone missing</li></ul></article><article><HeartHandshake/><p className="eyebrow">Injury or incident</p><h3>Attend. Help. Report.</h3><ul><li>Attend to immediate safety and wellbeing</li><li>Seek first aid or emergency help where needed</li><li>Report promptly through the WSH Portal</li><li>Follow through on wellbeing and insurance where applicable</li></ul></article><article><Wrench/><p className="eyebrow">Hazard, fault or defect</p><h3>{officialInfo.faultNumber}</h3><ul><li>Make the immediate area safer where reasonably possible</li><li>Call or use the online fault-reporting channel</li></ul></article></div><div className="guide-actions"><ActionLink href={officialInfo.links.wshPortal}>Report an incident</ActionLink><ActionLink href={officialInfo.links.faultReport}>Report a fault or hazard</ActionLink><ActionLink href={officialInfo.links.emergencyInfo}>View emergency information</ActionLink><ActionLink href={officialInfo.links.studentInsurance}>View student insurance information</ActionLink></div></section>;
}

function Completion({ progress, profile }: { progress: Progress; profile: Profile }) {
  const [reflection,setReflection]=useState(()=>sessionStorage.getItem('clte-safety-reflection')||''); const count=Object.values(progress).filter(Boolean).length;
  useEffect(()=>{if(reflection)sessionStorage.setItem('clte-safety-reflection',reflection)},[reflection]);
  const focusLine={notice:'Your chosen focus was spotting concerns early. Try one slow scan of your usual workspace.',respond:'Your chosen focus was responding calmly. Keep the care–prevent–report rhythm close.',evacuate:'Your chosen focus was evacuation readiness. Check the posted route from the spaces you use.',report:'Your chosen focus was reporting. Save the pocket guide so the right route is close at hand.'}[profile.focus];
  return <section className="completion"><Sparkles/><p className="eyebrow">{profile.name ? `${profile.name}’s journey` : 'Journey complete'}</p><h2>See something that could go wrong?<br/><em>Flag it early.</em></h2><p>Small actions—clearing a path, checking on someone, knowing where to go or making a report—can help prevent a more serious incident.</p><div className="personal-takeaway"><Eye/><span>{focusLine}</span></div><div className="completion-count"><span>{count}</span> situations explored</div><label><span>What area around your work environment may be worth a second look?</span><select value={reflection} onChange={e=>setReflection(e.target.value)}><option value="">Choose one (optional)</option><option>Walkways and cables</option><option>Meeting-room setup</option><option>Storage and equipment</option><option>Electrical items</option><option>Emergency information</option><option>Something else</option></select></label><small>Your choice stays in this browser session.</small></section>;
}

export default function App() {
  const [progress,setProgress]=useSessionProgress(); const [sound,setSound]=useState(false); const [menu,setMenu]=useState(false);
  const [profile,setProfileState]=useState<Profile>(()=>{try{return JSON.parse(sessionStorage.getItem('clte-safety-profile')||'') as Profile}catch{return initialProfile}});
  const setProfile=(next:Profile)=>{setProfileState(next);sessionStorage.setItem('clte-safety-profile',JSON.stringify(next))};
  useEffect(()=>{
    if(!sound)return;
    const chime=(event:MouseEvent)=>{if(!(event.target as HTMLElement).closest('button'))return;const audio=new AudioContext();const oscillator=audio.createOscillator();const gain=audio.createGain();oscillator.frequency.value=420;gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.07);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.07);oscillator.addEventListener('ended',()=>audio.close())};
    document.addEventListener('click',chime);return()=>document.removeEventListener('click',chime);
  },[sound]);
  const complete=(key:keyof Progress,next:string)=>{setProgress(v=>({...v,[key]:true})); setTimeout(()=>document.querySelector(next)?.scrollIntoView({behavior:'smooth'}),100)};
  const completed=useMemo(()=>Object.values(progress).filter(Boolean).length,[progress]);
  return <><header><a className="logo" href="#intro"><span><Eye/></span>CLTE Safety Lens</a><nav className={menu?'open':''}>{[['01','office'],['02','walkway'],['03','evacuation'],['04','reporting']].map(([n,id])=><a key={id} href={`#${id}`} onClick={()=>setMenu(false)} className={progress[id as keyof Progress]?'done':''}>{n}<span>{id}</span></a>)}</nav><div className="header-tools"><span>{completed}/4 explored</span><button onClick={()=>setSound(!sound)} aria-label={sound?'Turn sound off':'Turn sound on'}>{sound?<Volume2/>:<VolumeX/>}</button><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button></div></header>
    <main><Intro profile={profile} setProfile={setProfile} onStart={()=>document.querySelector('#office')?.scrollIntoView({behavior:'smooth'})}/><OfficeScene profile={profile} onComplete={()=>complete('office','#walkway')}/><WetScene profile={profile} onComplete={()=>complete('walkway','#haze-anchor')}/><div id="haze-anchor"><HazeInterstitial/></div><EvacuationScene profile={profile} onComplete={()=>complete('evacuation','#reporting')}/><RoutingScene profile={profile} onComplete={()=>complete('reporting','#practice')}/><PracticeReport/><PocketGuide/><Completion profile={profile} progress={progress}/></main><footer><span>CLTE · Safety & Health Week 2026</span><a href="#intro">Back to top ↑</a></footer></>;
}
