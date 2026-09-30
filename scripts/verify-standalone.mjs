import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Exercise real components with saved incorrect answers without changing a browser profile.
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
const lms=new Map();
globalThis.window={addEventListener(){},API:{LMSInitialize:()=> 'true',LMSFinish:()=> 'true',LMSCommit:()=> 'true',LMSGetValue:key=>lms.get(key)||'',LMSSetValue:(key,value)=>{lms.set(key,value);return 'true'}}};
window.parent=window;
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
const load=path=>server.ssrLoadModule('/'+path);
try {
const progress=await load('src/activityProgress.ts');
assert.equal(progress.hasAnswer([{id:'wrong'}],'wrong'),true);
assert.equal(progress.hasAnswer([{id:'valid'}],'stale-answer'),false);
assert.equal(progress.normalizeProgress({office:true}).experiment,true,'Preserve completed legacy two-part hazards');
assert.equal(progress.normalizeProgress({office:true,experiment:false}).experiment,false,'Do not complete standalone Experiment Room via pantry');
let saved=progress.initialProgress;
for(const id of ['haze','experiment','walkway','office'])saved=progress.completeActivity(saved,id);
assert.equal(saved.completion,false);
saved=progress.completeActivity(saved,'evacuation');
assert.equal(saved.completion,true,'Extras are not a completion gate');
assert.equal(saved.practice,false);assert.equal(saved.guide,false);
assert.equal(progress.completeActivity(saved,'office').completion,true,'Revisiting keeps completion');

const config=await load('src/config.ts');
const journeys=(await load('src/journeyData.ts')).journeys;
const cases=[
  {file:'src/OfficeScene.tsx',key:'clte-pantry-v1',answers:Object.fromEntries(config.pantryHotspots.map(item=>[item.id,item.options.find(option=>!option.correct).id])),props:{}},
  ...['injury','haze'].map(kind=>({file:'src/DecisionJourney.tsx',key:`clte-decisions-v1-${kind}`,answers:Object.fromEntries(journeys[kind].moments.map(item=>[item.id,item.choices.find(choice=>!choice.correct).id])),props:{kind}})),
  {file:'src/ExperimentRoomScene.tsx',key:'clte-experiment-room-v1',answers:{'aisle-cable':'small-tape','aisle-bag':'table-edge','exit-route':'later','power-adapter':'extend'},props:{onBack(){}}},
];
for(const test of cases){
  const component=(await load(test.file)).default;
  values.clear();
  const fresh=renderToStaticMarkup(React.createElement(component,{...test.props,onComplete(){}}));
  assert.ok(!fresh.includes('Finish &amp; return home'),`${test.key}: fresh scenario cannot claim completion`);
  assert.ok(fresh.includes('disabled=""'),`${test.key}: prompt requires an answer`);
  values.set(test.key,JSON.stringify(test.answers));
  const finished=renderToStaticMarkup(React.createElement(component,{...test.props,onComplete(){}}));
  assert.ok(finished.includes('Finish &amp; return home'),`${test.key}: incorrect answers must not gate completion`);
  assert.ok(finished.includes('A safer next step'),`${test.key}: corrective feedback remains visible`);
  assert.ok(!finished.includes('Warning sign placed'),`${test.key}: do not depict an unsafe choice as a safe action`);
}
const scorm=await load('src/scorm.ts');
scorm.initializeScorm();scorm.saveScormProgress(progress.initialProgress);
assert.equal(lms.get('cmi.core.lesson_status'),'incomplete');
scorm.saveScormProgress(saved);
assert.equal(lms.get('cmi.core.lesson_status'),'completed');
assert.equal(lms.get('cmi.core.lesson_location'),'home');
assert.equal(lms.get('cmi.core.score.raw'),'100');
assert.equal(JSON.parse(lms.get('cmi.suspend_data')).version,2);
console.log('PASS: standalone progress, legacy migration, incorrect-answer completion in four components, feedback, and SCORM completion without extras.');

} finally { await server.close(); }
