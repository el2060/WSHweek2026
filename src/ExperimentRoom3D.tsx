import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type RoomView = 'entrance' | 'teaching' | 'windows';

const jumps: Record<RoomView, { position: [number, number, number]; yaw: number }> = {
  entrance: { position: [3.2, 1.65, 4.1], yaw: -.32 },
  teaching: { position: [0, 1.65, -1.1], yaw: 0 },
  windows: { position: [3.8, 1.65, 1.2], yaw: -Math.PI / 2 },
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
  solvedIds: string[];
  onInspect: (id: string) => void;
};

function material(color: number, roughness = .82) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: .04 });
}

function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], color: number, name?: string) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color));
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh); return mesh;
}

function cylinder(parent: THREE.Object3D, radius: number, height: number, position: [number, number, number], color: number, rotation: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material(color));
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; parent.add(mesh); return mesh;
}

function table(parent: THREE.Object3D, x: number, z: number, rotation = 0) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = rotation; parent.add(group);
  box(group, [3.15, .12, 1.15], [0, .82, 0], 0xf3eee1);
  [[-1.35,-.43],[1.35,-.43],[-1.35,.43],[1.35,.43]].forEach(([lx,lz]) => cylinder(group,.055,.78,[lx,.39,lz],0xc8d0cc));
  return group;
}

function chair(parent: THREE.Object3D, x: number, z: number, rotation: number, seatColor: number, loose = false) {
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotation; parent.add(g);
  box(g,[.62,.11,.58],[0,.48,0],seatColor); box(g,[.62,.72,.09],[0,.78,.27],0x566366);
  cylinder(g,.045,.43,[-.24,.23,-.18],0x8c9998); cylinder(g,.045,.43,[.24,.23,-.18],0x8c9998);
  cylinder(g,.045,.43,[-.24,.23,.18],0x8c9998); if(!loose) cylinder(g,.045,.43,[.24,.23,.18],0x8c9998);
  return g;
}

function person(parent: THREE.Object3D, x: number, z: number, shirt: number, pose: 'stand'|'sit'|'present' = 'stand', rotation = 0) {
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotation; g.userData.baseY=0; g.userData.person=true; parent.add(g);
  const seated = pose === 'sit';
  cylinder(g,.22,.62,[0,seated ? .92 : 1.12,0],shirt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.18,16,12), material(0xc9875d)); head.position.set(0,seated?1.35:1.55,0); head.castShadow=true; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.185,16,8,0,Math.PI*2,0,Math.PI*.48),material(0x263239)); hair.position.copy(head.position); hair.position.y+=.035; g.add(hair);
  cylinder(g,.065,.56,[-.13,seated?.56:.52,0],0x37484b); cylinder(g,.065,.56,[.13,seated?.56:.52,0],0x37484b);
  const armY = seated ? 1.03 : 1.15;
  const left = cylinder(g,.055,.5,[-.29,armY,0],0xc9875d,[0,0,pose==='present'?-.9:.18]);
  const right = cylinder(g,.055,.5,[.29,armY,0],0xc9875d,[0,0,pose==='present'?.9:-.18]);
  left.userData.arm=true; right.userData.arm=true;
  return g;
}

function tagHazard(group: THREE.Object3D, id: string, color = 0xf0b94a) {
  group.traverse(object => { object.userData.hazardId = id; });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.34,.045,8,22), new THREE.MeshBasicMaterial({color,transparent:true,opacity:.92}));
  ring.name='hazard-ring'; ring.rotation.x=Math.PI/2; ring.position.y=1.18; ring.userData.hazardId=id; group.add(ring);
  const glow = new THREE.PointLight(color,1.2,2.5); glow.position.y=.65; group.add(glow);
  return ring;
}

function createRoom(scene: THREE.Scene) {
  const room = new THREE.Group(); scene.add(room);
  box(room,[16,.12,10],[0,-.06,0],0x5d6667);
  const grid = new THREE.GridHelper(16,16,0x7f8c8b,0x697473); grid.position.y=.01; room.add(grid);
  box(room,[16,.12,10],[0,3.42,0],0xe7e1d4);
  box(room,[16,3.4,.16],[0,1.7,-5],0xf2eee3); box(room,[.16,3.4,10],[8,1.7,0],0xe6e1d7); box(room,[16,3.4,.16],[0,1.7,5],0xe6e1d7);
  // Window wall and greenery beyond it.
  box(room,[.12,3.4,10],[-8,1.7,0],0xd9e2df);
  for(let z=-4.25;z<=4.25;z+=1.7){ box(room,[.08,1.45,1.48],[-7.93,1.95,z],0x8bc5c0); box(room,[.1,1.55,.08],[-7.86,1.95,z+.78],0x26383c); }
  for(let z=-4.5;z<5;z+=.8){ const plant=cylinder(room,.18,.8,[-8.25,.45,z],0x557c48); plant.scale.set(1,.7,1); }
  // Signature orange/teal teaching wall.
  box(room,[10.7,1.5,.12],[-.3,1.85,-4.86],0xf3eee2); box(room,[10.7,.48,.18],[-.3,.3,-4.78],0x2a9c98);
  box(room,[10.7,.48,.16],[-.3,3.05,-4.78],0xf19a24);
  box(room,[1.15,2.45,.18],[6.65,1.35,-4.78],0xe8e7df); box(room,[.72,1.85,.08],[6.65,1.42,-4.66],0xa8c8c5);
  box(room,[1.1,.28,.12],[6.65,3.08,-4.65],0x20a58e);
  // Display screens and ceiling projectors.
  [[-7.72,-3.5],[-7.72,-.8],[-7.72,1.9]].forEach(([x,z])=>{ const s=box(room,[.12,1.25,1.8],[x,1.72,z],0x172124); s.rotation.y=Math.PI/2; });
  box(room,[2.3,1.25,.15],[2.3,1.78,-4.65],0x172124);
  [[-2,0],[3.2,1.5]].forEach(([x,z])=>box(room,[.9,.22,.62],[x,3.14,z],0xe8e7df));
  // Furniture layout.
  const positions:[number,number,number][]=[[-4,-2,0],[-.4,-2,0],[3.3,-1.7,0],[-3,1.2,0],[1,1.35,0],[4.5,2.2,0]];
  positions.forEach(([x,z,r],i)=>{ table(room,x,z,r); chair(room,x-1,z+.85,0,i%2?0x15998f:0xe89627); chair(room,x+.7,z+.85,0,i%2?0xe89627:0x15998f); });
  // Animated colleagues bring the room into use.
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
  const bag=new THREE.Group(); bag.position.set(-.25,0,1.2); room.add(bag); box(bag,[.65,.62,.38],[0,.31,0],0x233036); const handle=new THREE.Mesh(new THREE.TorusGeometry(.22,.045,8,16,Math.PI),material(0x233036)); handle.position.y=.68; bag.add(handle); tagHazard(bag,'aisle-bag'); hazards.set('aisle-bag',bag);
  // Blocked exit.
  const exit=new THREE.Group(); exit.position.set(6.05,0,-3.82); room.add(exit); box(exit,[.75,.58,.72],[0,.29,0],0xb88b58); chair(exit,.2,.45,0,0xe89627); tagHazard(exit,'exit-route'); hazards.set('exit-route',exit);
  // Drink beside laptop.
  const drink=new THREE.Group(); drink.position.set(2.1,.9,-1.72); room.add(drink); cylinder(drink,.11,.34,[0,.17,0],0xa65b35); box(drink,[.68,.04,.48],[-.5,.04,0],0x252b2c); tagHazard(drink,'drink-power'); hazards.set('drink-power',drink);
  // Loose caster and incomplete chair.
  const wheel=new THREE.Group(); wheel.position.set(-2.15,.08,3.62); room.add(wheel); const w=cylinder(wheel,.13,.09,[0,0,0],0x222829,[Math.PI/2,0,0]); w.userData.hazardId='chair-wheel'; tagHazard(wheel,'chair-wheel'); hazards.set('chair-wheel',wheel);
  // Overloaded adapter.
  const power=new THREE.Group(); power.position.set(-5.55,.05,-1.55); room.add(power); box(power,[.9,.12,.26],[0,.06,0],0xe7e3d9); [-.26,0,.26].forEach(x=>{ cylinder(power,.035,.34,[x,.25,0],0x252b2c); }); tagHazard(power,'power-adapter'); hazards.set('power-adapter',power);
  hazards.forEach((group,id) => { group.userData.unsafePosition = group.position.clone(); group.userData.safePosition = new THREE.Vector3(...safeTargets[id]); });
  return { room, hazards };
}

export default function ExperimentRoom3D({ jumpTo, jumpSignal, solvedIds, onInspect }: Props) {
  const hostRef=useRef<HTMLDivElement>(null); const onInspectRef=useRef(onInspect); const solvedRef=useRef(solvedIds);
  const jumpRef=useRef<(view:RoomView)=>void>(()=>{});
  useEffect(()=>{onInspectRef.current=onInspect;},[onInspect]);
  useEffect(()=>{solvedRef.current=solvedIds;},[solvedIds]);
  useEffect(()=>{jumpRef.current(jumpTo);},[jumpTo,jumpSignal]);

  useEffect(()=>{
    const host=hostRef.current; if(!host) return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0xc9ded9); scene.fog=new THREE.Fog(0xc9ded9,12,24);
    const camera=new THREE.PerspectiveCamera(70,1,.08,40); camera.rotation.order='YXZ';
    let yaw=0,pitch=.08; const velocity=new THREE.Vector3(); const keys=new Set<string>(); let dragging=false,lastX=0,lastY=0,startX=0,startY=0;
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','First-person 3D walkthrough of the CLTE Experiment Room'); renderer.domElement.tabIndex=0;
    scene.add(new THREE.HemisphereLight(0xf7f0da,0x44676d,2.2)); const sun=new THREE.DirectionalLight(0xfff2d8,2.8); sun.position.set(3,8,4); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
    for(let x=-6;x<=6;x+=3){ const light=new THREE.PointLight(0xfff0cb,1.1,7); light.position.set(x,3.05,0); scene.add(light); }
    const {room,hazards}=createRoom(scene);
    const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2(); const startedAt=performance.now(); let lastFrame=startedAt;
    function jump(view:RoomView){ const target=jumps[view]; camera.position.set(...target.position); yaw=target.yaw; pitch=.08; camera.rotation.set(pitch,yaw,0); }
    jumpRef.current=jump; jump(jumpTo);
    const resize=()=>{ const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/Math.max(h,1); camera.updateProjectionMatrix(); }; resize(); const observer=new ResizeObserver(resize); observer.observe(host);
    const down=(e:KeyboardEvent)=>{ if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); keys.add(e.code); };
    const up=(e:KeyboardEvent)=>keys.delete(e.code);
    const pointerDown=(e:PointerEvent)=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; startX=e.clientX; startY=e.clientY; renderer.domElement.setPointerCapture(e.pointerId); };
    const pointerMove=(e:PointerEvent)=>{ if(!dragging)return; const dx=e.clientX-lastX,dy=e.clientY-lastY; lastX=e.clientX;lastY=e.clientY; if(Math.abs(dx)+Math.abs(dy)>1){ yaw-=dx*.004; pitch=Math.max(-.8,Math.min(.6,pitch-dy*.003)); }};
    const pointerUp=(e:PointerEvent)=>{ const moved=Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY); dragging=false; if(moved<7){ const rect=renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1)); raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects([...hazards.values()],true).find(item=>item.object.userData.hazardId); if(hit) onInspectRef.current(hit.object.userData.hazardId); } };
    const controlDown=(e:Event)=>{ const code=(e.currentTarget as HTMLElement).dataset.key; if(code)keys.add(code); };
    const controlUp=(e:Event)=>{ const code=(e.currentTarget as HTMLElement).dataset.key; if(code)keys.delete(code); };
    const controls=[...host.parentElement!.querySelectorAll<HTMLElement>('[data-key]')]; controls.forEach(el=>{el.addEventListener('pointerdown',controlDown);el.addEventListener('pointerup',controlUp);el.addEventListener('pointercancel',controlUp);});
    window.addEventListener('keydown',down,{passive:false});window.addEventListener('keyup',up);renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);
    let frame=0;
    const animate=(now=performance.now())=>{ frame=requestAnimationFrame(animate); const dt=Math.min((now-lastFrame)/1000,.05),t=(now-startedAt)/1000; lastFrame=now; camera.rotation.set(pitch,yaw,0);
      const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0); const side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
      velocity.set(Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward+Math.sin(yaw)*side); if(velocity.lengthSq()) velocity.normalize().multiplyScalar(3.1*dt); camera.position.add(velocity); camera.position.x=Math.max(-7.2,Math.min(7.2,camera.position.x));camera.position.z=Math.max(-4.25,Math.min(4.35,camera.position.z));camera.position.y=1.65+Math.sin(t*9)*(velocity.lengthSq()?0.018:0);
      room.traverse(obj=>{ if(obj.userData.person) obj.position.y=(obj.userData.baseY||0)+Math.sin(t*1.7+obj.position.x)*.018; if(obj.userData.arm) obj.rotation.y=Math.sin(t*1.4+obj.position.x)*.12; });
      hazards.forEach((group,id)=>{ const solved=solvedRef.current.includes(id); const target=(solved?group.userData.safePosition:group.userData.unsafePosition) as THREE.Vector3; group.position.lerp(target,Math.min(1,dt*3.5)); const ring=group.getObjectByName('hazard-ring') as THREE.Mesh|undefined; if(ring){ ring.rotation.z=t*1.2; ring.position.y=1.16+Math.sin(t*2+group.position.x)*.08; (ring.material as THREE.MeshBasicMaterial).color.setHex(solved?0x63d3b8:0xf0b94a); (ring.material as THREE.MeshBasicMaterial).opacity=solved?.3:.92; }});
      renderer.render(scene,camera);
    }; animate();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);controls.forEach(el=>{el.removeEventListener('pointerdown',controlDown);el.removeEventListener('pointerup',controlUp);el.removeEventListener('pointercancel',controlUp);});host.removeChild(renderer.domElement);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});};
  },[]);
  return <div className="experiment-3d-host" ref={hostRef}/>;
}
