import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const colors = {
  ink: '#132b34',
  teal: '#0c5d64',
  coral: '#f06d4f',
  cream: '#f6f1e6',
  paper: '#fffdf7',
  sage: '#dce9df',
  mist: '#b7cfca',
};

const easeOut = Easing.bezier(.16, 1, .3, 1);
const easeInOut = Easing.bezier(.65, 0, .35, 1);

const Shell = ({step, label, children, dark = false}: {step: number; label: string; children: React.ReactNode; dark?: boolean}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return <AbsoluteFill style={{backgroundColor: dark ? colors.ink : colors.cream, color: dark ? colors.paper : colors.ink, fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden'}}>
    <Interactive.Div name="Ambient route grid" style={{position: 'absolute', inset: 0, opacity: dark ? .16 : .22, backgroundImage: `linear-gradient(${dark ? '#41616a' : '#cbd7cf'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#41616a' : '#cbd7cf'} 1px, transparent 1px)`, backgroundSize: '72px 72px', translate: interpolate(frame, [0, durationInFrames], ['0px 0px', '-18px -12px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear})}}/>
    <Interactive.Div name="Ambient coral field" style={{position: 'absolute', width: 620, height: 620, borderRadius: '50%', backgroundColor: colors.coral, opacity: dark ? .15 : .14, right: -210, top: -270, scale: interpolate(frame, [0, durationInFrames * .55, durationInFrames], [.9, 1.08, .97], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [easeOut, easeInOut], output: 'perceptual-scale'})}}/>
    <Interactive.Div name="Ghost scene number" style={{position: 'absolute', right: 52, bottom: 22, fontSize: 238, lineHeight: .8, fontWeight: 900, letterSpacing: '-.08em', color: dark ? '#ffffff' : colors.teal, opacity: dark ? .045 : .05, translate: interpolate(frame, [0, durationInFrames], ['24px 0px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}>0{step}</Interactive.Div>

    <Interactive.Div name="Top brand" style={{position: 'absolute', left: 72, top: 42, display: 'flex', alignItems: 'center', gap: 14, fontSize: 18, fontWeight: 800, letterSpacing: '-.02em'}}>
      <span style={{width: 44, height: 44, borderRadius: 13, backgroundColor: colors.teal, color: 'white', display: 'grid', placeItems: 'center', boxShadow: dark ? '0 10px 26px rgba(0,0,0,.2)' : '0 10px 26px rgba(12,93,100,.16)'}}>CL</span>
      <span>CLTE WSH Week 2026</span>
      <span style={{width: 7, height: 7, borderRadius: '50%', backgroundColor: colors.coral, marginLeft: 4}}/>
    </Interactive.Div>
    <Interactive.Div name="Scene label" style={{position: 'absolute', right: 72, top: 51, display: 'flex', alignItems: 'center', gap: 12, color: dark ? colors.mist : '#57706b', fontSize: 14, fontWeight: 800, letterSpacing: 1.7, textTransform: 'uppercase'}}>
      <span style={{width: 34, height: 2, backgroundColor: colors.coral}}/>Scenario 02 · {label}
    </Interactive.Div>

    {children}

    <div style={{position: 'absolute', left: 72, right: 72, bottom: 35, display: 'flex', alignItems: 'center', gap: 14}}>
      <span style={{fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: dark ? colors.mist : '#61756f'}}>0{step}</span>
      <div style={{display: 'flex', flex: 1, gap: 8}}>
        {[1, 2, 3, 4, 5].map((n) => <span key={n} style={{height: 6, flex: 1, borderRadius: 99, backgroundColor: n < step ? colors.coral : n === step ? (dark ? '#5d7a81' : '#d5d2c8') : (dark ? '#35505a' : '#d9d5ca'), overflow: 'hidden'}}>
          {n === step && <Interactive.Div name="Active progress sweep" style={{height: '100%', borderRadius: 99, backgroundColor: colors.coral, scale: interpolate(frame, [0, durationInFrames - 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear}), transformOrigin: 'left center'}}/>}
        </span>)}
      </div>
      <span style={{fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: dark ? colors.mist : '#61756f'}}>05</span>
    </div>
  </AbsoluteFill>;
};

const Enter = ({name, children, delay = 5, direction = 'up'}: {name: string; children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'scale' | 'fade'}) => {
  const frame = useCurrentFrame();
  const translations = {
    up: ['0px 32px', '0px 0px'],
    left: ['-42px 0px', '0px 0px'],
    right: ['42px 0px', '0px 0px'],
    scale: ['0px 0px', '0px 0px'],
    fade: ['0px 0px', '0px 0px'],
  } as const;

  return <Interactive.Div name={name} style={{opacity: interpolate(frame, [delay, delay + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), translate: interpolate(frame, [delay, delay + 25], translations[direction], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), scale: direction === 'scale' ? interpolate(frame, [delay, delay + 26], [.82, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({damping: 180}), output: 'perceptual-scale'}) : 1}}>{children}</Interactive.Div>;
};

const Pill = ({children, tone = 'teal'}: {children: React.ReactNode; tone?: 'teal' | 'coral' | 'sage'}) => <span style={{display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderRadius: 999, backgroundColor: tone === 'coral' ? colors.coral : tone === 'sage' ? colors.sage : colors.teal, color: tone === 'sage' ? colors.ink : 'white', fontSize: 17, fontWeight: 900, letterSpacing: '.01em', boxShadow: '0 8px 22px rgba(19,43,52,.1)'}}>{children}</span>;

const ActionNumber = ({children}: {children: React.ReactNode}) => <span style={{display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,.22)', fontSize: 13}}>{children}</span>;

export const AlarmScene = () => {
  const frame = useCurrentFrame();
  return <Shell step={1} label="Alarm sounds">
    <div style={{position: 'absolute', left: 76, top: 148, width: 720}}>
      <Enter name="Alarm kicker" delay={5} direction="left"><Pill tone="coral"><ActionNumber>!</ActionNumber>When the alarm sounds</Pill></Enter>
      <Enter name="Alarm headline" delay={15} direction="up"><h1 style={{fontSize: 76, lineHeight: .96, letterSpacing: '-.058em', margin: '24px 0 20px'}}>Leave promptly.<br/><span style={{color: colors.coral}}>Leave belongings.</span></h1></Enter>
      <Enter name="Alarm guidance" delay={31} direction="fade"><p style={{fontSize: 28, lineHeight: 1.38, color: '#536963', margin: 0, maxWidth: 660}}>Use the nearest safe exit. Follow exit signs and the fire warden.</p></Enter>
      <Interactive.Div name="Urgency rule" style={{marginTop: 28, width: 220, height: 4, borderRadius: 99, backgroundColor: colors.coral, scale: interpolate(frame, [38, 72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), transformOrigin: 'left center'}}/>
    </div>

    <div style={{position: 'absolute', right: 94, top: 142, width: 350, height: 390, display: 'grid', placeItems: 'center'}}>
      {[0, 1, 2].map((ring) => <Interactive.Div key={ring} name={`Alarm wave ${ring + 1}`} style={{position: 'absolute', width: 236 + ring * 58, height: 236 + ring * 58, borderRadius: '50%', border: `${ring === 0 ? 14 : 4}px solid ${colors.coral}`, opacity: interpolate(frame, [8 + ring * 10, 34 + ring * 10, 95 + ring * 10, 125 + ring * 10], [0, .56 - ring * .12, .18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [easeOut, Easing.linear, Easing.in(Easing.ease)]}), scale: interpolate(frame, [8 + ring * 10, 125 + ring * 10], [.72, 1.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}/>)}
      <Interactive.Div name="Alarm beacon" style={{position: 'relative', zIndex: 2, width: 216, height: 216, borderRadius: '50%', backgroundColor: colors.paper, display: 'grid', placeItems: 'center', scale: interpolate(frame, [12, 34, 65, 82, 108, 125], [.8, 1, .98, 1.04, .98, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [Easing.spring({damping: 160}), easeInOut, easeInOut, easeInOut, easeInOut], output: 'perceptual-scale'}), boxShadow: '0 28px 74px rgba(19,43,52,.18)'}}>
        <div style={{width: 82, height: 104, borderRadius: '41px 41px 18px 18px', backgroundColor: colors.coral, position: 'relative', boxShadow: 'inset 0 -16px 0 rgba(183,61,39,.16)'}}><span style={{position: 'absolute', left: -25, right: -25, bottom: -17, height: 18, borderRadius: 10, backgroundColor: colors.ink}}/></div>
      </Interactive.Div>
      <Interactive.Div name="Act now label" style={{position: 'absolute', bottom: 4, padding: '9px 14px', borderRadius: 9, backgroundColor: colors.ink, color: colors.paper, fontSize: 14, fontWeight: 900, letterSpacing: 2, opacity: interpolate(frame, [52, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), translate: interpolate(frame, [52, 75], ['0px 14px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}>ACT NOW</Interactive.Div>
    </div>
  </Shell>;
};

export const RouteScene = () => {
  const frame = useCurrentFrame();
  return <Shell step={2} label="Safe exit">
    <div style={{position: 'absolute', left: 76, top: 146, width: 520}}>
      <Enter name="Route step" delay={6} direction="left"><Pill><ActionNumber>1</ActionNumber>Exit and descend</Pill></Enter>
      <Enter name="Route headline" delay={16} direction="up"><h1 style={{fontSize: 67, lineHeight: 1, letterSpacing: '-.052em', margin: '24px 0 18px'}}>Take the stairs.<br/><span style={{color: colors.coral}}>Never the lift.</span></h1></Enter>
      <Enter name="Route guidance" delay={32} direction="fade"><p style={{fontSize: 27, lineHeight: 1.4, color: '#536963', margin: 0}}>Walk steadily, use the handrail and move with the evacuation group.</p></Enter>
      <Enter name="No lift cue" delay={64} direction="scale"><div style={{display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 28, padding: '10px 14px', border: `2px solid ${colors.coral}`, borderRadius: 14, color: colors.coral, fontSize: 16, fontWeight: 900}}><span style={{fontSize: 24, lineHeight: 1}}>⊘</span>LIFTS ARE NOT AN EXIT ROUTE</div></Enter>
    </div>

    <Interactive.Div name="Stairwell diagram" style={{position: 'absolute', right: 72, top: 132, width: 550, height: 452, backgroundColor: colors.paper, border: '2px solid #d8e1dc', borderRadius: 34, boxShadow: '0 26px 70px rgba(19,43,52,.13)', overflow: 'hidden', opacity: interpolate(frame, [8, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), translate: interpolate(frame, [8, 34], ['42px 0px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}>
      <div style={{position: 'absolute', left: 28, top: 25, fontSize: 13, fontWeight: 900, letterSpacing: 1.8, color: '#698079'}}>SAFE DESCENT</div>
      <div style={{position: 'absolute', right: 28, top: 22, padding: '6px 9px', borderRadius: 8, backgroundColor: colors.sage, fontSize: 12, fontWeight: 900, color: colors.teal}}>USE HANDRAIL</div>
      {[0, 1, 2, 3].map((i) => <Interactive.Div key={i} name={`Stair ${i + 1}`} style={{position: 'absolute', right: 48 + i * 88, bottom: 46 + i * 76, width: 164, height: 76, borderRadius: '12px 12px 0 0', backgroundColor: i === 3 ? colors.coral : colors.sage, borderTop: `3px solid ${i === 3 ? '#c64f37' : '#9dbfa6'}`, opacity: interpolate(frame, [18 + i * 8, 35 + i * 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), translate: interpolate(frame, [18 + i * 8, 42 + i * 8], ['28px 0px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}/>)}
      <Interactive.Div name="Walking marker halo" style={{position: 'absolute', width: 54, height: 54, borderRadius: '50%', backgroundColor: 'rgba(12,93,100,.14)', left: interpolate(frame, [52, 168], [112, 420], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut}), top: interpolate(frame, [52, 168], [76, 350], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut}), scale: interpolate(frame, [52, 72, 92, 112, 132, 152, 168], [1, 1.18, 1, 1.18, 1, 1.18, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut})}}>
        <div style={{position: 'absolute', inset: 9, borderRadius: '50%', backgroundColor: colors.teal, boxShadow: '0 7px 16px rgba(12,93,100,.28)'}}/>
      </Interactive.Div>
      <Interactive.Div name="Direction arrow" style={{position: 'absolute', left: 54, bottom: 35, fontSize: 18, fontWeight: 900, color: colors.teal, letterSpacing: 1, opacity: interpolate(frame, [75, 94], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>STEADY →</Interactive.Div>
    </Interactive.Div>
  </Shell>;
};

export const GroupScene = () => {
  const frame = useCurrentFrame();
  return <Shell step={3} label="Designated route" dark>
    <div style={{position: 'absolute', left: 76, top: 144, width: 625}}>
      <Enter name="Group step" delay={6} direction="left"><Pill tone="coral"><ActionNumber>2</ActionNumber>Stay together</Pill></Enter>
      <Enter name="Group headline" delay={16} direction="up"><h1 style={{fontSize: 69, lineHeight: .99, letterSpacing: '-.052em', margin: '24px 0 18px'}}>Follow the warden.<br/><span style={{color: colors.coral}}>Follow the route.</span></h1></Enter>
      <Enter name="Group guidance" delay={33} direction="fade"><p style={{fontSize: 27, lineHeight: 1.4, color: colors.mist, margin: 0}}>Stay on the designated walkway. At Block 56, do not take the crossing.</p></Enter>
      <Enter name="Block 56 warning" delay={72} direction="left"><div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, color: '#ffd9d0', fontSize: 16, fontWeight: 900, letterSpacing: .7}}><span style={{display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', backgroundColor: colors.coral, color: 'white'}}>×</span>KEEP TO THE WALKWAY</div></Enter>
    </div>

    <Interactive.Div name="Evacuation route map" style={{position: 'absolute', right: 68, top: 122, width: 500, height: 470, borderRadius: 34, backgroundColor: '#183842', border: '2px solid #3e6069', boxShadow: '0 30px 80px rgba(0,0,0,.24)', overflow: 'hidden', opacity: interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), translate: interpolate(frame, [8, 34], ['40px 0px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}>
      <div style={{position: 'absolute', left: 24, top: 22, zIndex: 3, fontSize: 13, fontWeight: 900, letterSpacing: 1.6, color: colors.mist}}>DESIGNATED WALKWAY</div>
      <div style={{position: 'absolute', right: 22, top: 18, zIndex: 3, padding: '7px 10px', borderRadius: 8, backgroundColor: colors.coral, fontSize: 12, fontWeight: 900}}>BLOCK 56</div>
      <svg width="500" height="470" viewBox="0 0 500 470" fill="none" style={{position: 'absolute', inset: 0}}>
        <path d="M62 390C142 390 136 296 235 296C329 296 305 148 432 104" stroke="#31545d" strokeWidth="42" strokeLinecap="round"/>
        <path d="M62 390C142 390 136 296 235 296C329 296 305 148 432 104" stroke="#f06d4f" strokeWidth="9" strokeDasharray="20 17" strokeLinecap="round" strokeDashoffset={interpolate(frame, [0, 210], [0, -148], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear})}/>
        <path d="M337 201L438 250" stroke="#719097" strokeWidth="18" strokeLinecap="round"/>
        <path d="M382 211L421 250M421 211L382 250" stroke="#f06d4f" strokeWidth="9" strokeLinecap="round"/>
      </svg>
      {[0, 1, 2, 3].map((i) => <Interactive.Div key={i} name={`Evacuation marker ${i + 1}`} style={{position: 'absolute', width: i === 0 ? 38 : 30, height: i === 0 ? 38 : 30, borderRadius: '50%', backgroundColor: i === 0 ? colors.coral : colors.paper, left: interpolate(frame, [28 + i * 11, 152 + i * 11], [46, 414], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut}), top: interpolate(frame, [28 + i * 11, 92 + i * 11, 152 + i * 11], [374, 270, 88], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut}), boxShadow: i === 0 ? '0 0 0 10px rgba(240,109,79,.16)' : '0 0 0 7px rgba(255,255,255,.08)'}}/>)}
      <Interactive.Div name="Route endpoint" style={{position: 'absolute', right: 34, top: 72, fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: '#ffd9d0', opacity: interpolate(frame, [142, 164], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>STAY ON ROUTE</Interactive.Div>
    </Interactive.Div>
  </Shell>;
};

export const AssemblyScene = () => {
  const frame = useCurrentFrame();
  return <Shell step={4} label="Assembly point">
    <div style={{position: 'absolute', left: 76, top: 144, width: 625}}>
      <Enter name="Assembly step" delay={6} direction="left"><Pill><ActionNumber>3</ActionNumber>Reach Zone A</Pill></Enter>
      <Enter name="Assembly headline" delay={16} direction="up"><h1 style={{fontSize: 68, lineHeight: 1, letterSpacing: '-.052em', margin: '24px 0 18px'}}>Gather with CLTE<br/><span style={{color: colors.coral}}>at Admin Field.</span></h1></Enter>
      <Enter name="Assembly guidance" delay={33} direction="fade"><p style={{fontSize: 27, lineHeight: 1.4, color: '#536963', margin: 0}}>Move fully into Zone A. Keep the approach clear and stay for roll call.</p></Enter>
      <Enter name="Clear approach cue" delay={78} direction="left"><div style={{display: 'inline-flex', gap: 10, alignItems: 'center', marginTop: 28, fontSize: 16, fontWeight: 900, color: colors.teal}}><span style={{width: 30, height: 3, backgroundColor: colors.coral}}/>KEEP THE APPROACH CLEAR</div></Enter>
    </div>

    <div style={{position: 'absolute', right: 64, top: 114, width: 520, height: 480, display: 'grid', placeItems: 'center'}}>
      {[0, 1, 2].map((ring) => <Interactive.Div key={ring} name={`Zone signal ${ring + 1}`} style={{position: 'absolute', width: 330 + ring * 66, height: 264 + ring * 52, borderRadius: '48%', border: `3px solid ${ring === 0 ? '#87bb8b' : '#a9cbaa'}`, opacity: interpolate(frame, [22 + ring * 14, 50 + ring * 14, 155 + ring * 10, 190 + ring * 6], [0, .62 - ring * .13, .24, .08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [easeOut, Easing.linear, Easing.linear]}), scale: interpolate(frame, [22 + ring * 14, 190], [.78, 1.08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}/>)}
      <Interactive.Div name="Zone A field" style={{position: 'relative', width: 332, height: 280, borderRadius: '46%', backgroundColor: '#b9d9b9', border: '8px solid #87bb8b', display: 'grid', placeItems: 'center', rotate: interpolate(frame, [8, 44, 180], ['-5deg', '0deg', '1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: [easeOut, easeInOut]}), scale: interpolate(frame, [8, 40], [.78, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({damping: 180}), output: 'perceptual-scale'}), boxShadow: '0 28px 74px rgba(19,43,52,.17)'}}>
        <div style={{textAlign: 'center', position: 'relative', zIndex: 2}}><strong style={{display: 'block', fontSize: 96, lineHeight: .84, color: colors.teal}}>A</strong><span style={{fontSize: 23, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase'}}>CLTE Zone</span><small style={{display: 'block', marginTop: 10, fontSize: 14, fontWeight: 800, letterSpacing: 1.3, color: '#385c45'}}>ADMIN FIELD</small></div>
        {[0, 1, 2, 3, 4].map((i) => <Interactive.Div key={i} name={`Arriving colleague ${i + 1}`} style={{position: 'absolute', width: 18, height: 18, borderRadius: '50%', backgroundColor: i === 0 ? colors.coral : colors.paper, border: `3px solid ${i === 0 ? '#ca5138' : colors.teal}`, left: interpolate(frame, [54 + i * 12, 130 + i * 7], [i % 2 ? 300 : -20, 90 + (i % 3) * 52], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), top: interpolate(frame, [54 + i * 12, 130 + i * 7], [i < 3 ? 250 : -10, 205 + (i % 2) * 22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), opacity: interpolate(frame, [52 + i * 12, 68 + i * 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}/>)}
      </Interactive.Div>
    </div>
  </Shell>;
};

export const AccountScene = () => {
  const frame = useCurrentFrame();
  return <Shell step={5} label="Roll call" dark>
    <div style={{position: 'absolute', left: 76, top: 126, right: 76}}>
      <Enter name="Account step" delay={6} direction="left"><Pill tone="coral"><ActionNumber>4</ActionNumber>Account for everyone</Pill></Enter>
      <Enter name="Account headline" delay={16} direction="up"><h1 style={{fontSize: 59, lineHeight: 1, letterSpacing: '-.052em', margin: '22px 0 13px', maxWidth: 1120}}>Someone missing? <span style={{color: colors.coral}}>Tell the warden.</span></h1></Enter>
      <Enter name="Account guidance" delay={33} direction="fade"><p style={{fontSize: 25, lineHeight: 1.4, color: colors.mist, margin: 0, maxWidth: 890}}>Share their name and last known location. Stay at Zone A—never re-enter to search.</p></Enter>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 38}}>
        {['Leave', 'Follow', 'Gather', 'Account'].map((word, i) => <Interactive.Div key={word} name={`Recap ${word}`} style={{position: 'relative', padding: '19px 18px', borderRadius: 18, backgroundColor: i === 3 ? colors.coral : '#23424b', border: `2px solid ${i === 3 ? '#ff8f73' : '#42616a'}`, opacity: interpolate(frame, [55 + i * 9, 71 + i * 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), translate: interpolate(frame, [55 + i * 9, 78 + i * 9], [i % 2 ? '0px 20px' : '0px -16px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), boxShadow: i === 3 ? '0 15px 34px rgba(240,109,79,.22)' : 'none'}}>
          <small style={{display: 'block', color: i === 3 ? '#fff1ec' : '#8fb0ae', fontSize: 13, fontWeight: 900, marginBottom: 7, letterSpacing: 1}}>0{i + 1}</small>
          <strong style={{fontSize: 27}}>{word}</strong>
          <span style={{position: 'absolute', right: 15, top: 15, display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', backgroundColor: i === 3 ? 'rgba(255,255,255,.22)' : '#31545d', color: colors.paper, fontSize: 14, fontWeight: 900}}>✓</span>
        </Interactive.Div>)}
      </div>

      <Interactive.Div name="Missing person action" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 22, padding: '15px 18px', borderRadius: 16, backgroundColor: '#183842', border: '2px solid #44646d', opacity: interpolate(frame, [105, 127], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut}), translate: interpolate(frame, [105, 132], ['0px 20px', '0px 0px'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut})}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 12, color: '#d6e1de', fontSize: 17, fontWeight: 800}}><b style={{display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', backgroundColor: colors.coral, color: 'white'}}>?</b>Missing person</span>
        <strong style={{color: '#ffd9d0', fontSize: 17, letterSpacing: .4}}>NAME + LAST KNOWN LOCATION → WARDEN</strong>
      </Interactive.Div>
      <Interactive.Div name="Final reminder" style={{marginTop: 17, color: '#b7cfca', fontSize: 15, fontWeight: 800, letterSpacing: .2, opacity: interpolate(frame, [142, 163], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>Follow fire wardens and current posted evacuation instructions.</Interactive.Div>
    </div>
  </Shell>;
};
