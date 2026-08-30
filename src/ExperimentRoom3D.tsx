import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type RoomView = 'entrance' | 'teaching' | 'windows';

const jumps: Record<RoomView, { position: [number, number, number]; yaw: number }> = {
  entrance: { position: [3.2, 1.65, 4.1], yaw: .32 },
  teaching: { position: [0, 1.65, -1.1], yaw: 0 },
  windows: { position: [3.8, 1.65, 1.2], yaw: Math.PI / 2 },
};

const safeTargets: Record<string, [number, number, number]> = {
  'aisle-cable': [0, .035, 4.72],
  'aisle-bag': [-2.55, 0, 1.2],
  'exit-route': [7.35, 0, -3.82],
  'drink-power': [4.35, .9, -1.72],
  'chair-wheel': [-2.15, .48, 3.62],
  'power-adapter': [-6.85, .05, -1.55],
};

type Props = {
  jumpTo: RoomView;
  jumpSignal: number;
  activeId: string | null;
  solvedIds: string[];
  onInspect: (id: string) => void;
};

function material(color: number, roughness = .82) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: .06 });
}

function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], color: number, name?: string) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color));
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh); return mesh;
}

function cylinder(parent: THREE.Object3D, radius: number, height: number, position: [number, number, number], color: number, rotation: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 20), material(color));
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; parent.add(mesh); return mesh;
}

function rounded(parent: THREE.Object3D, size: [number,number,number], position: [number,number,number], color: number, radius=.06, transparent=false) {
  const mat=new THREE.MeshPhysicalMaterial({color,roughness:.55,metalness:.03,transparent,opacity:transparent?.72:1,side:transparent?THREE.DoubleSide:THREE.FrontSide});
  const mesh=new THREE.Mesh(new RoundedBoxGeometry(size[0],size[1],size[2],4,Math.min(radius,Math.min(...size)/2)),mat); mesh.position.set(...position); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}

function limb(parent:THREE.Object3D,from:[number,number,number],to:[number,number,number],radius:number,color:number) {
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),mid=a.clone().add(b).multiplyScalar(.5),direction=b.clone().sub(a);
  const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,Math.max(.01,direction.length()-radius*2),6,12),material(color,.65)); mesh.position.copy(mid); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()); mesh.castShadow=true; parent.add(mesh); return mesh;
}

function table(parent: THREE.Object3D, x: number, z: number, rotation = 0) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = rotation; parent.add(group);
  rounded(group,[3.15,.09,1.15],[0,.79,0],0xf8f7f3,.035); box(group,[2.48,.38,.035],[0,.55,.52],0x273336);
  [-1.28,1.28].forEach(lx=>{ cylinder(group,.055,.64,[lx,.43,0],0xc7ccca); box(group,[.62,.055,.09],[lx,.09,0],0xbec5c3); [-.27,.27].forEach(zv=>cylinder(group,.045,.045,[lx,.045,zv],0x333c3e,[Math.PI/2,0,0])); });
  return group;
}

function chair(parent: THREE.Object3D, x: number, z: number, rotation: number, seatColor: number, loose = false) {
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotation; parent.add(g);
  cylinder(g,.055,.34,[0,.28,0],0xaeb7b7); rounded(g,[.58,.1,.53],[0,.51,0],seatColor,.08);
  const back=rounded(g,[.62,.66,.055],[0,.88,.25],0x9ca7a6,.1,true); back.rotation.x=-.1;
  [-1,1].forEach(side=>{ limb(g,[0,.12,0],[side*.34,.08,.1],.024,0x929c9c); limb(g,[side*.3,.54,.03],[side*.36,.72,.12],.025,0x4b5658); rounded(g,[.1,.035,.3],[side*.36,.73,.02],0x465153,.02); });
  for(let i=0;i<5;i++){ const a=i*Math.PI*2/5,ex=Math.sin(a)*.34,ez=Math.cos(a)*.34; limb(g,[0,.14,0],[ex,.08,ez],.025,0x8d9797); if(!(loose&&i===1)) cylinder(g,.045,.035,[ex,.045,ez],0x283234,[Math.PI/2,0,0]); }
  return g;
}

function person(parent: THREE.Object3D, x: number, z: number, shirt: number, pose: 'stand'|'sit'|'present' = 'stand', rotation = 0) {
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotation; g.userData.baseY=0; g.userData.person=true; parent.add(g);
  const seated = pose === 'sit';
  const skin=0xc88967,trousers=0x394b52,torsoY=seated?1.01:1.18;
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.42,8,16),material(shirt,.62)); torso.position.y=torsoY; torso.scale.set(1.08,1,.62); torso.castShadow=true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.155,24,18), material(skin,.62)); head.position.set(0,seated?1.43:1.6,0); head.scale.set(.9,1.08,.94); head.castShadow=true; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.16,24,12,0,Math.PI*2,0,Math.PI*.56),material(0x273034,.72)); hair.position.copy(head.position); hair.position.y+=.025; hair.scale.copy(head.scale); g.add(hair);
  [-.045,.045].forEach(ex=>{const eye=new THREE.Mesh(new THREE.SphereGeometry(.011,10,8),material(0x20282a,.55));eye.position.set(ex,head.position.y+.025,-.145);g.add(eye);});
  if(seated){ limb(g,[-.11,.85,0],[-.12,.55,-.2],.065,trousers); limb(g,[-.12,.55,-.2],[-.12,.13,-.05],.055,trousers); limb(g,[.11,.85,0],[.12,.55,-.2],.065,trousers); limb(g,[.12,.55,-.2],[.12,.13,-.05],.055,trousers); }
  else { limb(g,[-.11,.91,0],[-.12,.15,0],.07,trousers); limb(g,[.11,.91,0],[.12,.15,0],.07,trousers); rounded(g,[.19,.07,.34],[-.12,.07,-.07],0xf0eee6,.035); rounded(g,[.19,.07,.34],[.12,.07,-.07],0xf0eee6,.035); }
  const left = limb(g,[-.19,torsoY+.16,0],pose==='present'?[-.52,torsoY+.06,-.15]:[-.27,torsoY-.28,0],.05,skin);
  const right = limb(g,[.19,torsoY+.16,0],pose==='present'?[.52,torsoY+.06,-.15]:[.27,torsoY-.28,0],.05,skin);
  left.userData.arm=true; right.userData.arm=true;
  return g;
}

function tagHazard(group: THREE.Object3D, id: string, color = 0xf0b94a) {
  group.traverse(object => { object.userData.hazardId = id; });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.24,.025,10,28), new THREE.MeshBasicMaterial({color,transparent:true,opacity:.72}));
  ring.name='hazard-ring'; ring.rotation.x=Math.PI/2; ring.position.y=.56; ring.userData.hazardId=id; group.add(ring);
  const glow = new THREE.PointLight(color,.72,1.8); glow.name='hazard-glow'; glow.position.y=.42; group.add(glow);
  return ring;
}

function createRoom(scene: THREE.Scene) {
  const room = new THREE.Group(); scene.add(room);
  // Fine-striped carpet based on the photographed room.
  const carpetCanvas=document.createElement('canvas'); carpetCanvas.width=256; carpetCanvas.height=256; const ctx=carpetCanvas.getContext('2d')!; ctx.fillStyle='#5a6163';ctx.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=8){ctx.fillStyle=y%24===0?'#707879':'#626a6b';ctx.fillRect(0,y,256,2);} for(let i=0;i<70;i++){ctx.fillStyle=i%3===0?'#c7a45b44':'#e6dfc91e';ctx.fillRect((i*47)%256,(i*83)%256,18+(i%5)*7,1);}
  const carpetTexture=new THREE.CanvasTexture(carpetCanvas); carpetTexture.wrapS=carpetTexture.wrapT=THREE.RepeatWrapping; carpetTexture.repeat.set(5,4); carpetTexture.colorSpace=THREE.SRGBColorSpace;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,10),new THREE.MeshStandardMaterial({map:carpetTexture,roughness:.96,metalness:0})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; room.add(floor);
  // Walls and a tiled acoustic ceiling.
  box(room,[16,.1,10],[0,3.45,0],0xf6f4ee); const ceilingSurface=new THREE.Mesh(new THREE.PlaneGeometry(16,10),new THREE.MeshBasicMaterial({color:0xebe9e3}));ceilingSurface.position.y=3.39;ceilingSurface.rotation.x=Math.PI/2;room.add(ceilingSurface); box(room,[16,3.4,.14],[0,1.7,-5],0xf3f1eb); box(room,[.14,3.4,10],[8,1.7,0],0xefede6); box(room,[16,3.4,.14],[0,1.7,5],0xefede6);
  for(let x=-8;x<=8;x+=1.2) box(room,[.018,.012,10],[x,3.385,0],0xc9cac6); for(let z=-5;z<=5;z+=1.2) box(room,[16,.012,.018],[0,3.385,z],0xc9cac6);
  [[-5,-3],[-2,-3],[1,-3],[4,-3],[-5,0],[-2,0],[1,0],[4,0],[-5,3],[-2,3],[1,3],[4,3]].forEach(([x,z])=>{ const panel=new THREE.Mesh(new RoundedBoxGeometry(1.02,.035,.5,2,.03),new THREE.MeshBasicMaterial({color:0xfff8dc}));panel.position.set(x,3.34,z);room.add(panel); });
  // Window wall with dark frames and planted terrace beyond.
  const glassMat=new THREE.MeshPhysicalMaterial({color:0xa7d1cf,transparent:true,opacity:.34,roughness:.18,metalness:.03,side:THREE.DoubleSide});
  for(let z=-4.3;z<=4.3;z+=1.72){ const pane=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.5),glassMat);pane.position.set(-7.91,2,z);pane.rotation.y=Math.PI/2;room.add(pane); box(room,[.06,1.65,.055],[-7.87,2,z+.81],0x26383c); }
  box(room,[.1,.08,10],[-7.86,1.2,0],0x26383c); box(room,[.12,1.15,10],[-7.94,.58,0],0xe8ece8);
  for(let z=-4.5;z<5;z+=.65){ cylinder(room,.025,.6,[-8.18,.52,z],0x426b43); const leaf=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8),material(z%1.3>.5?0x6c995c:0x527f4d,.9));leaf.scale.set(.7,1.7,.45);leaf.position.set(-8.18,.85,z);room.add(leaf); }
  // Signature whiteboard with teal lower cabinets and orange acoustic panels.
  rounded(room,[10.8,1.48,.08],[-.2,1.93,-4.84],0xf9f8f3,.025); box(room,[10.8,.045,.1],[-.2,1.17,-4.76],0x656d6e);
  for(let x=-5.1;x<5;x+=1.35) rounded(room,[1.27,.5,.15],[x,.38,-4.76],x<3.4?0x2b9d99:0xf19a24,.025);
  for(let x=-5.15;x<5.2;x+=1.75) rounded(room,[1.68,.46,.13],[x,3.08,-4.76],x<3.1?0xef951e:0xd7d1c5,.025);
  // Exit door and sign.
  rounded(room,[1.08,2.45,.12],[6.68,1.28,-4.77],0xe8e7e1,.025); rounded(room,[.55,1.62,.04],[6.68,1.38,-4.68],0xb7d3d1,.02); cylinder(room,.035,.12,[6.3,1.28,-4.63],0x4e5555,[Math.PI/2,0,0]);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=72;const labelCtx=labelCanvas.getContext('2d')!;labelCtx.fillStyle='#148b7e';labelCtx.fillRect(0,0,256,72);labelCtx.fillStyle='white';labelCtx.font='bold 42px Arial';labelCtx.textAlign='center';labelCtx.fillText('EXIT',128,51);const labelTex=new THREE.CanvasTexture(labelCanvas);labelTex.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(.8,.23),new THREE.MeshBasicMaterial({map:labelTex}));label.position.set(6.68,2.74,-4.67);room.add(label);
  // Mobile flat displays with slim metal stands and casters.
  const display=(x:number,z:number,rot:number)=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;room.add(g);rounded(g,[1.65,1.02,.08],[0,1.74,0],0x171b1c,.035);rounded(g,[1.5,.87,.012],[0,1.74,-.047],0x252a2b,.02);cylinder(g,.04,.65,[0,.9,0],0xb8c0c0);box(g,[.72,.045,.32],[0,.55,0],0xb8c0c0);[-.3,.3].forEach(v=>cylinder(g,.04,.04,[v,.51,.12],0x31393a,[Math.PI/2,0,0]));};
  [[-7.55,-3.5,Math.PI/2],[-7.55,-.8,Math.PI/2],[-7.55,1.9,Math.PI/2],[2.25,-4.53,0],[4.75,-4.53,0]].forEach(([x,z,r])=>display(x,z,r));
  // Ceiling projectors and air-conditioning cassettes.
  [[-2,0],[3.2,1.5]].forEach(([x,z])=>{const g=new THREE.Group();g.position.set(x,3.08,z);room.add(g);rounded(g,[.86,.22,.58],[0,0,0],0xe8e8e4,.055);cylinder(g,.11,.035,[0,-.01,-.31],0x24313a,[Math.PI/2,0,0]);});
  [[-5,-1.5],[0,2.5],[5,-2]].forEach(([x,z])=>{rounded(room,[1.05,.035,1.05],[x,3.33,z],0xd8d6d0,.02); for(let i=0;i<4;i++){const vent=box(room,[.78,.018,.04],[x,3.3,z+(i-1.5)*.16],0x8c908f);vent.rotation.y=i%2?Math.PI/2:0;}});
  // Furniture layout closely follows the clustered mobile tables in the photos.
  const positions:[number,number,number][]=[[-4,-2,0],[-.4,-2,0],[3.3,-1.7,0],[-3,1.2,0],[1,1.35,0],[4.5,2.2,0]];
  positions.forEach(([x,z,r],i)=>{ table(room,x,z,r); chair(room,x-1,z+.82,0,i%2?0x58b7b0:0xe39a36); chair(room,x+.7,z+.82,0,i%2?0xe39a36:0x58b7b0); });
  // Natural-proportion colleagues in an active workshop.
  person(room,-4.25,-1.7,0x107a72,'sit',Math.PI); person(room,-2.9,-1.7,0xc85e43,'sit',Math.PI);
  person(room,.75,1.15,0xe0ad74,'sit',Math.PI); person(room,1.45,1.05,0x176f67,'sit',Math.PI);
  person(room,3.3,-3.15,0x187b70,'present',Math.PI); person(room,-.2,2.9,0x345b70,'stand',0);
  person(room,5.4,1.8,0xc55e43,'sit',-Math.PI/2);

  const hazards = new Map<string, THREE.Object3D>();
  // Cable crossing the walking route.
  const cable = new THREE.Group(); cable.position.set(0,.035,2.55); room.add(cable);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.4,0,0),new THREE.Vector3(-.8,.02,.2),new THREE.Vector3(.9,0,-.15),new THREE.Vector3(2.7,.01,.15)]);
  const lead = new THREE.Mesh(new THREE.TubeGeometry(curve,32,.045,8,false),material(0x172226)); lead.castShadow=true; cable.add(lead); tagHazard(cable,'aisle-cable'); hazards.set('aisle-cable',cable);
  // Bag.
  const bag=new THREE.Group(); bag.position.set(-.25,0,1.2); room.add(bag); rounded(bag,[.64,.58,.36],[0,.31,0],0x263238,.09); box(bag,[.5,.025,.02],[0,.37,-.19],0x4b5a5e); const handle=new THREE.Mesh(new THREE.TorusGeometry(.21,.035,10,24,Math.PI),material(0x263238)); handle.position.y=.66; bag.add(handle); tagHazard(bag,'aisle-bag'); hazards.set('aisle-bag',bag);
  // Blocked exit.
  const exit=new THREE.Group(); exit.position.set(6.05,0,-3.82); room.add(exit); rounded(exit,[.75,.58,.72],[0,.29,0],0xb88b58,.035); chair(exit,.2,.45,0,0xe39a36); tagHazard(exit,'exit-route'); hazards.set('exit-route',exit);
  // Drink beside laptop.
  const drink=new THREE.Group(); drink.position.set(2.1,.9,-1.72); room.add(drink); const cup=cylinder(drink,.105,.32,[0,.16,0],0xb8764c);cup.scale.set(.88,1,1); cylinder(drink,.12,.025,[0,.33,0],0xeee7da); rounded(drink,[.68,.035,.48],[-.5,.035,0],0x292f31,.025); tagHazard(drink,'drink-power'); hazards.set('drink-power',drink);
  // Loose caster and incomplete chair.
  const wheel=new THREE.Group(); wheel.position.set(-2.15,.08,3.62); room.add(wheel); const w=cylinder(wheel,.13,.09,[0,0,0],0x222829,[Math.PI/2,0,0]); w.userData.hazardId='chair-wheel'; tagHazard(wheel,'chair-wheel'); hazards.set('chair-wheel',wheel);
  // Overloaded adapter.
  const power=new THREE.Group(); power.position.set(-5.55,.05,-1.55); room.add(power); rounded(power,[.9,.1,.26],[0,.06,0],0xe7e3d9,.035); [-.26,0,.26].forEach(x=>{ cylinder(power,.032,.34,[x,.24,0],0x252b2c); }); tagHazard(power,'power-adapter'); hazards.set('power-adapter',power);
  hazards.forEach((group,id) => { group.userData.unsafePosition = group.position.clone(); group.userData.safePosition = new THREE.Vector3(...safeTargets[id]); });
  return { room, hazards };
}

export default function ExperimentRoom3D({ jumpTo, jumpSignal, activeId, solvedIds, onInspect }: Props) {
  const hostRef=useRef<HTMLDivElement>(null); const onInspectRef=useRef(onInspect); const solvedRef=useRef(solvedIds); const activeRef=useRef(activeId);
  const jumpRef=useRef<(view:RoomView)=>void>(()=>{});
  useEffect(()=>{onInspectRef.current=onInspect;},[onInspect]);
  useEffect(()=>{solvedRef.current=solvedIds;},[solvedIds]);
  useEffect(()=>{activeRef.current=activeId;},[activeId]);
  useEffect(()=>{jumpRef.current(jumpTo);},[jumpTo,jumpSignal]);

  useEffect(()=>{
    const host=hostRef.current; if(!host) return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0xe6eeea); scene.fog=new THREE.Fog(0xe6eeea,18,34);
    const camera=new THREE.PerspectiveCamera(62,1,.08,40); camera.rotation.order='YXZ';
    let yaw=0,pitch=-.08,lastActiveId:string|null=null,focusUntil=0,focusYaw=0,focusPitch=-.08; const velocity=new THREE.Vector3(); const keys=new Set<string>(); let dragging=false,lastX=0,lastY=0,startX=0,startY=0;
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08; host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','First-person 3D walkthrough of the CLTE Experiment Room'); renderer.domElement.tabIndex=0;
    scene.add(new THREE.HemisphereLight(0xfffdf5,0x60777a,1.55)); const sun=new THREE.DirectionalLight(0xfff8e8,2.15); sun.position.set(-5,8,5); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);scene.add(sun);
    for(let x=-5;x<=5;x+=2.5){ const light=new THREE.PointLight(0xfff4d9,.72,7);light.position.set(x,3.05,0);scene.add(light); }
    const {room,hazards}=createRoom(scene);
    const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2(); const focusPoint=new THREE.Vector3(); const startedAt=performance.now(); let lastFrame=startedAt;
    function jump(view:RoomView){ const target=jumps[view]; camera.position.set(...target.position); yaw=target.yaw; pitch=-.08; camera.rotation.set(pitch,yaw,0); }
    jumpRef.current=jump; jump(jumpTo);
    const resize=()=>{ const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/Math.max(h,1); camera.updateProjectionMatrix(); }; resize(); const observer=new ResizeObserver(resize); observer.observe(host);
    const down=(e:KeyboardEvent)=>{ if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); keys.add(e.code); };
    const up=(e:KeyboardEvent)=>keys.delete(e.code);
    const pointerDown=(e:PointerEvent)=>{ dragging=true; focusUntil=0; lastX=e.clientX; lastY=e.clientY; startX=e.clientX; startY=e.clientY; renderer.domElement.setPointerCapture(e.pointerId); };
    const pointerMove=(e:PointerEvent)=>{ if(!dragging)return; const dx=e.clientX-lastX,dy=e.clientY-lastY; lastX=e.clientX;lastY=e.clientY; if(Math.abs(dx)+Math.abs(dy)>1){ yaw-=dx*.004; pitch=Math.max(-.8,Math.min(.6,pitch-dy*.003)); }};
    const pointerUp=(e:PointerEvent)=>{ const moved=Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY); dragging=false; if(moved<7){ const rect=renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1)); raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects([...hazards.values()],true).find(item=>item.object.userData.hazardId); if(hit) onInspectRef.current(hit.object.userData.hazardId); } };
    const controlDown=(e:Event)=>{ const code=(e.currentTarget as HTMLElement).dataset.key; if(code)keys.add(code); };
    const controlUp=(e:Event)=>{ const code=(e.currentTarget as HTMLElement).dataset.key; if(code)keys.delete(code); };
    const controls=[...host.parentElement!.querySelectorAll<HTMLElement>('[data-key]')]; controls.forEach(el=>{el.addEventListener('pointerdown',controlDown);el.addEventListener('pointerup',controlUp);el.addEventListener('pointercancel',controlUp);});
    window.addEventListener('keydown',down,{passive:false});window.addEventListener('keyup',up);renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);
    let frame=0;
    const animate=(now=performance.now())=>{ frame=requestAnimationFrame(animate); const dt=Math.min((now-lastFrame)/1000,.05),t=(now-startedAt)/1000; lastFrame=now; const currentActive=activeRef.current; if(currentActive!==lastActiveId){ lastActiveId=currentActive; const target=currentActive?hazards.get(currentActive):undefined; if(target){ target.getWorldPosition(focusPoint); focusPoint.y+=.55; const dx=focusPoint.x-camera.position.x,dz=focusPoint.z-camera.position.z,horizontal=Math.hypot(dx,dz); focusYaw=Math.atan2(-dx,-dz); focusPitch=Math.max(-.6,Math.min(.7,Math.atan2(focusPoint.y-camera.position.y,horizontal))); focusUntil=t+.65; } } if(t<focusUntil&&!dragging){ const turn=Math.atan2(Math.sin(focusYaw-yaw),Math.cos(focusYaw-yaw)); const ease=Math.min(1,dt*7); yaw+=turn*ease; pitch+=(focusPitch-pitch)*ease; } camera.rotation.set(pitch,yaw,0);
      const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0); const side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
      velocity.set(Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward+Math.sin(yaw)*side); if(velocity.lengthSq()) velocity.normalize().multiplyScalar(3.1*dt); camera.position.add(velocity); camera.position.x=Math.max(-7.2,Math.min(7.2,camera.position.x));camera.position.z=Math.max(-4.25,Math.min(4.35,camera.position.z));camera.position.y=1.65+Math.sin(t*9)*(velocity.lengthSq()?0.018:0);
      room.traverse(obj=>{ if(obj.userData.person) obj.position.y=(obj.userData.baseY||0)+Math.sin(t*1.7+obj.position.x)*.018; if(obj.userData.arm) obj.rotation.y=Math.sin(t*1.4+obj.position.x)*.12; });
      hazards.forEach((group,id)=>{ const solved=solvedRef.current.includes(id); const current=activeRef.current===id; const target=(solved?group.userData.safePosition:group.userData.unsafePosition) as THREE.Vector3; group.position.lerp(target,Math.min(1,dt*3.5)); const ring=group.getObjectByName('hazard-ring') as THREE.Mesh|undefined; if(ring){ ring.rotation.z=t*.8; ring.position.y=.56+Math.sin(t*2+group.position.x)*.035; const pulse=current?1+Math.sin(t*2.8)*.1:1; ring.scale.setScalar(pulse); (ring.material as THREE.MeshBasicMaterial).color.setHex(solved?0x63d3b8:0xf0b94a); (ring.material as THREE.MeshBasicMaterial).opacity=solved?.24:.72; } const glow=group.getObjectByName('hazard-glow') as THREE.PointLight|undefined; if(glow) glow.intensity=current?1.05+Math.sin(t*2.8)*.22:.35; });
      const focused=activeRef.current?hazards.get(activeRef.current):undefined; if(focused){ focused.getWorldPosition(focusPoint); focusPoint.y+=.38; focusPoint.project(camera); const visible=focusPoint.z>-1&&focusPoint.z<1; host.classList.toggle('has-focus',visible); if(visible){ const x=Math.max(5,Math.min(95,(focusPoint.x*.5+.5)*100)); const y=Math.max(7,Math.min(93,(-focusPoint.y*.5+.5)*100)); host.style.setProperty('--room-focus-x',`${x}%`); host.style.setProperty('--room-focus-y',`${y}%`); } } else host.classList.remove('has-focus');
      renderer.render(scene,camera);
    }; animate();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);controls.forEach(el=>{el.removeEventListener('pointerdown',controlDown);el.removeEventListener('pointerup',controlUp);el.removeEventListener('pointercancel',controlUp);});host.removeChild(renderer.domElement);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});};
  },[]);
  return <div className="experiment-3d-host" ref={hostRef}/>;
}
