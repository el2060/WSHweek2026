export const officialInfo = {
  ambulanceNumber: '995',
  emergencyNumber: '6460 6999',
  sasNumber: '6460 6777',
  faultNumber: '6460 6000',
  assemblyArea: 'Admin Field',
  assemblyZone: 'Zone A',
  assemblyOrigin: 'Block 27',
  links: {
    wshPortal: '',
    faultReport: '',
    emergencyInfo: '',
    studentInsurance: '',
    hazeSop: '',
    oneMap: '',
  },
};

export type DecisionOption = { id: string; label: string; feedback: string; best: boolean };
export type Hotspot = { id: string; title: string; body: string; urgency: number; choices: DecisionOption[]; x: number; y: number };

export const officeHotspots: Hotspot[] = [
  { id: 'bag', title: 'Bag in the walkway', body: 'It blocks a shared route.', urgency: 2, x: 49, y: 80, choices: [
    { id:'move', label:'Store it safely', feedback:'Clear route. Risk removed.', best:true },
    { id:'warn', label:'Ask people to step around it', feedback:'The trip hazard is still there.', best:false },
    { id:'later', label:'Move it after the meeting', feedback:'Waiting leaves people exposed.', best:false },
  ]},
  { id: 'drawer', title: 'Open drawer', body: 'It projects into the walkway.', urgency: 2, x: 34, y: 85, choices: [
    { id:'close', label:'Close it now', feedback:'Obstruction removed.', best:true },
    { id:'cone', label:'Put a warning beside it', feedback:'Close it instead of marking it.', best:false },
    { id:'mention', label:'Mention it later', feedback:'The obstruction remains.', best:false },
  ]},
  { id: 'cable', title: 'Loose cable', body: 'It crosses the walking route.', urgency: 3, x: 15, y: 76, choices: [
    { id:'reroute', label:'Unplug and reroute it', feedback:'Trip and cable strain removed.', best:true },
    { id:'paper', label:'Cover it with paper', feedback:'Hidden is not safe.', best:false },
    { id:'step', label:'Ask people to step over it', feedback:'The trip hazard remains.', best:false },
  ]},
  { id: 'files', title: 'Unstable stack', body: 'Files could fall from the desk.', urgency: 1, x: 29, y: 67, choices: [
    { id:'store', label:'Store heavy files lower', feedback:'Stack secured.', best:true },
    { id:'floor', label:'Put the stack on the floor', feedback:'That creates a trip hazard.', best:false },
    { id:'steady', label:'Straighten the stack', feedback:'It can become unstable again.', best:false },
  ]},
  { id: 'drink', title: 'Drink near equipment', body: 'A spill could reach powered equipment.', urgency: 3, x: 94, y: 66, choices: [
    { id:'move', label:'Move the drink away', feedback:'Liquid and equipment separated.', best:true },
    { id:'lid', label:'Add a lid', feedback:'Safer, but the exposure remains.', best:false },
    { id:'equipment', label:'Move the equipment', feedback:'Move the drink, not powered equipment.', best:false },
  ]},
];

export const wetDecisions = [
  { stage:'First 30 seconds', prompt:'The student is seated on the ground. What is your first move?', options:[
    { id:'care', label:'Check on the student and ask what help is needed', feedback:'Wellbeing comes first. Avoid moving the person unnecessarily while you assess what help is needed.', best:true },
    { id:'photo', label:'Photograph the wet tiles before they dry', feedback:'Evidence may help later, but delaying the wellbeing check puts documentation before care.', best:false },
    { id:'portal', label:'Open the WSH Portal immediately', feedback:'The report matters, but first attend to the person and stabilise the scene.', best:false },
  ]},
  { stage:'Prevent another incident', prompt:'The student is responsive. People are still approaching the wet area. What next?', options:[
    { id:'protect', label:'Ask someone to redirect people while help is arranged', feedback:'This protects the student and prevents a second person from slipping.', best:true },
    { id:'leave', label:'Leave the area to look for cleaning supplies', feedback:'Leaving the scene unattended exposes others to the same condition.', best:false },
    { id:'questions', label:'Begin collecting a full witness account', feedback:'Detailed follow-up can wait until the person and the immediate area are safe.', best:false },
  ]},
  { stage:'Close the loop', prompt:'The injury appears minor and the area is controlled. Which response closes the loop?', options:[
    { id:'follow', label:'Seek first aid, alert the area owner, record and report', feedback:'This connects care, hazard control and prompt WSH Portal reporting so follow-up can happen.', best:true },
    { id:'fault', label:'Submit only a fault report for the wet surface', feedback:'A student was affected, so the injury incident also needs prompt reporting through the WSH Portal.', best:false },
    { id:'wait', label:'Wait a few days to see whether pain develops', feedback:'Prompt reporting preserves useful details and enables timely wellbeing and insurance follow-up.', best:false },
  ]},
] as const;

export const evacuationActions = [
  { id:'stop', label:'Stop the activity and ask everyone to leave calmly', correct:true, feedback:'Clear direction helps the group respond without delay.' },
  { id:'route', label:'Follow fire wardens and the designated route', correct:true, feedback:'The posted route and fire wardens guide the safe movement of occupants.' },
  { id:'assist', label:'Assist anyone who may need help', correct:true, feedback:'Support should be offered without obstructing the evacuation flow.' },
  { id:'belongings', label:'Collect laptops and personal belongings first', correct:false, feedback:'Unnecessary belongings delay evacuation. Leave them and move promptly.' },
  { id:'lift', label:'Use the lift to reach the ground floor faster', correct:false, feedback:'Do not use the lift unless emergency instructions specifically direct you to do so.' },
  { id:'assembly', label:'Proceed to Zone A at Admin Field', correct:true, feedback:'Block 27 is allocated to Zone A, where the CLTE group can be accounted for.' },
  { id:'roll', label:'Remain with the group for roll call', correct:true, feedback:'Stay until officially dismissed and report anyone who may be missing.' },
  { id:'leave', label:'Leave once you reach the assembly area', correct:false, feedback:'Leaving before roll call can make someone appear unaccounted for.' },
];

export const routes = [
  { id: 'emergency', correct: 'emergency', label: 'Serious injury', channel: `Call ${officialInfo.ambulanceNumber}, then Guard Post`, detail: 'Give the exact location. Guard Post can guide responders in.' },
  { id: 'incident', correct: 'incident', label: 'Stable injury', channel: 'WSH Portal', detail: 'Report the incident promptly.' },
  { id: 'near-miss', correct: 'incident', label: 'Falling box; nobody hurt', channel: 'WSH Portal · Near miss', detail: 'Record it so the cause can be fixed.' },
  { id: 'fault', correct: 'fault', label: 'Hazard or defect', channel: `Call ${officialInfo.faultNumber} or report online`, detail: 'Report it before someone is hurt.' },
];
