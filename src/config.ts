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
  { id: 'bag', title: 'Bag in the walkway', body: 'People will soon be moving through this shared route.', urgency: 2, x: 49, y: 80, choices: [
    { id:'move', label:'Move it to proper storage', feedback:'The route is clear before people begin moving through the area.', best:true },
    { id:'warn', label:'Tell people to step around it', feedback:'A warning still leaves the trip hazard in a shared route.', best:false },
    { id:'later', label:'Leave it until the meeting ends', feedback:'More people will use the route during the meeting, so waiting increases exposure.', best:false },
  ]},
  { id: 'drawer', title: 'Open drawer', body: 'The low drawer projects into a movement area.', urgency: 2, x: 34, y: 85, choices: [
    { id:'close', label:'Close it fully now', feedback:'A quick correction removes the obstruction immediately.', best:true },
    { id:'cone', label:'Place a warning beside it', feedback:'A warning is unnecessary when the drawer can be closed safely in seconds.', best:false },
    { id:'mention', label:'Mention it at the next meeting', feedback:'The obstruction remains while people continue to pass it.', best:false },
  ]},
  { id: 'cable', title: 'Loose charging cable', body: 'The cable crosses a walking route and is connected to electrical equipment.', urgency: 3, x: 15, y: 76, choices: [
    { id:'reroute', label:'Unplug and reroute it safely', feedback:'This removes both the trip exposure and strain on the connection.', best:true },
    { id:'paper', label:'Cover it with a sheet of paper', feedback:'Covering the cable makes it harder to see without removing the hazard.', best:false },
    { id:'step', label:'Ask colleagues to step over it', feedback:'People can forget or be distracted; the exposed cable still crosses the route.', best:false },
  ]},
  { id: 'files', title: 'Unstable stack', body: 'The files are leaning close to the edge of a busy workstation.', urgency: 1, x: 29, y: 67, choices: [
    { id:'store', label:'Reduce the stack and store heavy files lower', feedback:'The stack is stabilised without creating another obstruction.', best:true },
    { id:'floor', label:'Move the stack onto the floor', feedback:'That may prevent a fall from the desk but creates a new trip obstruction.', best:false },
    { id:'steady', label:'Straighten it and leave the same height', feedback:'The tall stack can become unstable again when files are removed.', best:false },
  ]},
  { id: 'drink', title: 'Drink near equipment', body: 'An open drink is beside powered office equipment.', urgency: 3, x: 94, y: 66, choices: [
    { id:'move', label:'Move the drink to a stable surface away', feedback:'Separating liquids from powered equipment prevents a small spill becoming a larger incident.', best:true },
    { id:'lid', label:'Leave it there and add a lid', feedback:'A lid reduces spills, but moving the drink away removes the exposure more reliably.', best:false },
    { id:'equipment', label:'Move the equipment instead', feedback:'Moving powered equipment unnecessarily may introduce cable or handling risks.', best:false },
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
  { id: 'emergency', correct: 'emergency', label: 'Serious injury needing immediate medical help', channel: `Call ${officialInfo.ambulanceNumber}, then inform ${officialInfo.emergencyNumber}`, detail: 'Give 995 a brief description and exact location. Inform the NP Guard Post so security can guide the ambulance to the scene.' },
  { id: 'incident', correct: 'incident', label: 'Injury incident, now stable', channel: 'WSH Portal', detail: 'The immediate situation is stable, but the injury incident should still be reported promptly.' },
  { id: 'near-miss', correct: 'incident', label: 'A heavy box falls nearby; nobody is hurt', channel: 'WSH Portal · Near miss', detail: 'Nobody was injured, but someone could have been. Recording the near miss helps the cause to be addressed before it happens again.' },
  { id: 'fault', correct: 'fault', label: 'Hazard or physical defect spotted', channel: `Call ${officialInfo.faultNumber} or report online`, detail: 'No one is injured and no near miss occurred. Reporting the defect helps prevent an incident.' },
];
