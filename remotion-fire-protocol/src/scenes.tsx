import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const colors = {ink:'#132b34', teal:'#0c5d64', coral:'#f06d4f', cream:'#f6f1e6', paper:'#fffdf7', sage:'#dce9df', blue:'#dbeaf2'};

const Shell = ({step, label, children, dark=false}:{step:number;label:string;children:React.ReactNode;dark?:boolean}) => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor:dark?colors.ink:colors.cream,color:dark?'white':colors.ink,fontFamily:'Arial, Helvetica, sans-serif',overflow:'hidden'}}>
    <Interactive.Div name="Ambient coral glow" style={{position:'absolute',width:520,height:520,borderRadius:'50%',backgroundColor:colors.coral,opacity:dark?.11:.13,filter:'blur(2px)',right:-180,top:-230,scale:interpolate(frame,[0,120],[.9,1.06],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1),output:'perceptual-scale'})}}/>
    <Interactive.Div name="Top brand" style={{position:'absolute',left:72,top:46,display:'flex',alignItems:'center',gap:14,fontSize:18,fontWeight:800,letterSpacing:'-.02em'}}>
      <span style={{width:42,height:42,borderRadius:12,backgroundColor:colors.teal,color:'white',display:'grid',placeItems:'center'}}>CL</span>
      <span>CLTE WSH Week 2026</span>
    </Interactive.Div>
    <Interactive.Div name="Scene label" style={{position:'absolute',right:72,top:54,color:dark?'#b7cfca':'#57706b',fontSize:14,fontWeight:700,letterSpacing:1.8,textTransform:'uppercase'}}>Fire 02 · {label}</Interactive.Div>
    {children}
    <div style={{position:'absolute',left:72,right:72,bottom:42,display:'flex',gap:8}}>{[1,2,3,4,5].map(n=><span key={n} style={{height:5,flex:1,borderRadius:99,backgroundColor:n<=step?colors.coral:(dark?'#35505a':'#d9d5ca')}}/>)}</div>
  </AbsoluteFill>;
};

const Enter = ({name,children,delay=0}:{name:string;children:React.ReactNode;delay?:number}) => {
  const frame=useCurrentFrame();
  return <Interactive.Div name={name} style={{opacity:interpolate(frame,[delay,delay+18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)}),translate:interpolate(frame,[delay,delay+24],['0px 28px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)})}}>{children}</Interactive.Div>;
};

const Pill = ({children,tone='teal'}:{children:React.ReactNode;tone?:'teal'|'coral'|'sage'}) => <span style={{display:'inline-flex',alignItems:'center',padding:'10px 16px',borderRadius:999,backgroundColor:tone==='coral'?colors.coral:tone==='sage'?colors.sage:colors.teal,color:tone==='sage'?colors.ink:'white',fontSize:18,fontWeight:800}}>{children}</span>;

export const AlarmScene = () => {
  const frame=useCurrentFrame();
  return <Shell step={1} label="Alarm sounds">
    <div style={{position:'absolute',left:76,top:164,width:680}}>
      <Enter name="Kicker"><Pill tone="coral">When the alarm sounds</Pill></Enter>
      <Enter name="Alarm headline" delay={12}><h1 style={{fontSize:76,lineHeight:.98,letterSpacing:'-.055em',margin:'24px 0 20px'}}>Leave promptly.<br/>Leave belongings.</h1></Enter>
      <Enter name="Alarm guidance" delay={28}><p style={{fontSize:29,lineHeight:1.4,color:'#536963',margin:0,maxWidth:650}}>Use the nearest safe exit. Follow exit signs and the fire warden.</p></Enter>
    </div>
    <Interactive.Div name="Alarm pulse" style={{position:'absolute',right:116,top:182,width:280,height:280,borderRadius:'50%',border:`18px solid ${colors.coral}`,backgroundColor:colors.paper,display:'grid',placeItems:'center',scale:interpolate(frame,[0,20,40,60],[.94,1.04,.94,1.04],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1),output:'perceptual-scale'}),boxShadow:'0 26px 70px rgba(19,43,52,.15)'}}>
      <div style={{width:92,height:114,borderRadius:'46px 46px 20px 20px',backgroundColor:colors.coral,position:'relative'}}><span style={{position:'absolute',left:-24,right:-24,bottom:-19,height:20,borderRadius:10,backgroundColor:colors.ink}}/></div>
    </Interactive.Div>
  </Shell>;
};

export const RouteScene = () => {
  const frame=useCurrentFrame();
  return <Shell step={2} label="Safe exit">
    <div style={{position:'absolute',left:76,top:160,width:515}}>
      <Enter name="Route step"><Pill>01 · Exit and descend</Pill></Enter>
      <Enter name="Route headline" delay={12}><h1 style={{fontSize:67,lineHeight:1.02,letterSpacing:'-.05em',margin:'24px 0 18px'}}>Take the stairs.<br/>Never the lift.</h1></Enter>
      <Enter name="Route guidance" delay={28}><p style={{fontSize:28,lineHeight:1.42,color:'#536963',margin:0}}>Walk steadily, use the handrail and move with the evacuation group.</p></Enter>
    </div>
    <div style={{position:'absolute',right:76,top:148,width:520,height:430,backgroundColor:colors.paper,borderRadius:32,boxShadow:'0 26px 70px rgba(19,43,52,.12)',overflow:'hidden'}}>
      {[0,1,2,3].map(i=><Interactive.Div key={i} name={`Stair ${i+1}`} style={{position:'absolute',right:58+i*82,bottom:68+i*70,width:152,height:68,borderRadius:'10px 10px 0 0',backgroundColor:i===3?colors.coral:colors.sage,opacity:interpolate(frame,[10+i*8,28+i*8],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:interpolate(frame,[10+i*8,34+i*8],['22px 0px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)})}}/>)}
      <Interactive.Div name="Walking marker" style={{position:'absolute',width:42,height:42,borderRadius:'50%',backgroundColor:colors.teal,left:interpolate(frame,[42,150],[80,360],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.3,.1,.4,1)}),top:interpolate(frame,[42,150],[310,96],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.3,.1,.4,1)}),boxShadow:'0 0 0 12px rgba(12,93,100,.13)'}}/>
    </div>
  </Shell>;
};

export const GroupScene = () => {
  const frame=useCurrentFrame();
  return <Shell step={3} label="Designated route" dark>
    <div style={{position:'absolute',left:76,top:158,width:620}}>
      <Enter name="Group step"><Pill tone="coral">02 · Stay together</Pill></Enter>
      <Enter name="Group headline" delay={12}><h1 style={{fontSize:71,lineHeight:1,letterSpacing:'-.05em',margin:'24px 0 18px'}}>Follow the warden.<br/>Follow the route.</h1></Enter>
      <Enter name="Group guidance" delay={28}><p style={{fontSize:28,lineHeight:1.42,color:'#b7cfca',margin:0}}>Stay on the designated walkway. At Block 56, do not take the crossing.</p></Enter>
    </div>
    <div style={{position:'absolute',right:76,top:160,width:420,height:400}}>
      <svg width="420" height="400" viewBox="0 0 420 400" fill="none"><path d="M54 326C130 326 128 232 209 232C290 232 274 114 370 92" stroke="#4f7478" strokeWidth="26" strokeLinecap="round"/><path d="M54 326C130 326 128 232 209 232C290 232 274 114 370 92" stroke="#f06d4f" strokeWidth="8" strokeDasharray="18 16" strokeLinecap="round"/></svg>
      {[0,1,2,3].map(i=><Interactive.Div key={i} name={`Evacuation marker ${i+1}`} style={{position:'absolute',width:32,height:32,borderRadius:'50%',backgroundColor:i===0?colors.coral:colors.paper,left:interpolate(frame,[20+i*12,135+i*12],[36,352],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.3,.1,.4,1)}),top:interpolate(frame,[20+i*12,80+i*12,135+i*12],[310,206,74],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.3,.1,.4,1)}),boxShadow:'0 0 0 8px rgba(255,255,255,.08)'}}/>)}
    </div>
  </Shell>;
};

export const AssemblyScene = () => {
  const frame=useCurrentFrame();
  return <Shell step={4} label="Assembly point">
    <div style={{position:'absolute',left:76,top:158,width:620}}>
      <Enter name="Assembly step"><Pill>03 · Reach Zone A</Pill></Enter>
      <Enter name="Assembly headline" delay={12}><h1 style={{fontSize:71,lineHeight:1,letterSpacing:'-.05em',margin:'24px 0 18px'}}>Gather with CLTE<br/>at Admin Field.</h1></Enter>
      <Enter name="Assembly guidance" delay={28}><p style={{fontSize:28,lineHeight:1.42,color:'#536963',margin:0}}>Move fully into Zone A. Keep the approach clear and stay for roll call.</p></Enter>
    </div>
    <Interactive.Div name="Zone A field" style={{position:'absolute',right:82,top:170,width:420,height:340,borderRadius:160,backgroundColor:'#b9d9b9',border:'8px solid #87bb8b',display:'grid',placeItems:'center',rotate:interpolate(frame,[0,80],['-3deg','0deg'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)}),scale:interpolate(frame,[0,30],[.84,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.spring({damping:200}),output:'perceptual-scale'}),boxShadow:'0 26px 70px rgba(19,43,52,.12)'}}>
      <div style={{textAlign:'center'}}><strong style={{display:'block',fontSize:92,lineHeight:.9,color:colors.teal}}>A</strong><span style={{fontSize:24,fontWeight:900,letterSpacing:2,textTransform:'uppercase'}}>CLTE Zone</span><small style={{display:'block',marginTop:12,fontSize:16,fontWeight:700,color:'#385c45'}}>ADMIN FIELD</small></div>
    </Interactive.Div>
  </Shell>;
};

export const AccountScene = () => {
  const frame=useCurrentFrame();
  return <Shell step={5} label="Roll call" dark>
    <div style={{position:'absolute',left:76,top:142,right:76}}>
      <Enter name="Account step"><Pill tone="coral">04 · Account for everyone</Pill></Enter>
      <Enter name="Account headline" delay={12}><h1 style={{fontSize:65,lineHeight:1.02,letterSpacing:'-.05em',margin:'22px 0 14px',maxWidth:850}}>Someone missing? Tell the warden.</h1></Enter>
      <Enter name="Account guidance" delay={28}><p style={{fontSize:26,lineHeight:1.4,color:'#b7cfca',margin:0,maxWidth:830}}>Share their name and last known location. Stay at Zone A—never re-enter to search.</p></Enter>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:46}}>{['Leave','Follow','Gather','Account'].map((word,i)=><Interactive.Div key={word} name={`Recap ${word}`} style={{padding:'20px 18px',borderRadius:18,backgroundColor:i===3?colors.coral:'#23424b',border:'1px solid #42616a',opacity:interpolate(frame,[52+i*10,68+i*10],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:interpolate(frame,[52+i*10,72+i*10],['0px 18px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)})}}><small style={{display:'block',color:i===3?'#fff1ec':'#8fb0ae',fontSize:14,fontWeight:800,marginBottom:7}}>0{i+1}</small><strong style={{fontSize:27}}>{word}</strong></Interactive.Div>)}</div>
      <Interactive.Div name="Final reminder" style={{marginTop:24,color:'#d6e1de',fontSize:18,fontWeight:700,opacity:interpolate(frame,[110,132],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>Follow fire wardens and current posted evacuation instructions.</Interactive.Div>
    </div>
  </Shell>;
};
