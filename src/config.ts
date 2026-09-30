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

export const pantryHotspots = [
  {
    id: 'spill', label: 'Spill', title: 'Water on the pantry floor', x: 76, y: 86,
    body: '', prompt: 'Colleagues are approaching. What do you do first?',
    options: [
      { id: 'protect', label: 'Keep people clear and arrange cleanup', correct: true, feedback: 'Warn approaching colleagues. Clean up only if safe, or get help, and keep the area clear until the floor is dry.' },
      { id: 'later', label: 'Leave it for the next cleaning round', correct: false, feedback: 'Someone could slip before then. Keep people clear and arrange prompt cleanup; the floor needs to be dry before normal use.' },
    ],
  },
  {
    id: 'pantry-bag', label: 'Bag', title: 'Bag and strap in the walkway', x: 48, y: 78,
    body: '', prompt: 'You’re only stopping for a drink. Where should your bag go?',
    options: [
      { id: 'chair', label: 'Beside a chair, with the strap in the aisle', correct: false, feedback: 'The strap can still catch someone’s foot. Store both the bag and its straps fully clear of the walkway.' },
      { id: 'store', label: 'In a storage space clear of the walkway', correct: true, feedback: 'Keep the whole bag and its straps out of walking routes, even during a quick pantry break.' },
    ],
  },
  {
    id: 'pantry-cable', label: 'Cable', title: 'Air purifier cable across the aisle', x: 35, y: 90,
    body: '', prompt: 'The purifier is running. What is the safer next step?',
    options: [
      { id: 'mat', label: 'Hide the cable under a loose mat', correct: false, feedback: 'A loose mat can conceal the cable and add another trip hazard. Keep people clear and ask for a safe cable route.' },
      { id: 'secure', label: 'Keep people clear and ask for safe rerouting', correct: true, feedback: 'Ask the person responsible to reposition the purifier or secure its cable away from walking routes. Don’t move powered equipment by pulling its cable.' },
    ],
  },
  {
    id: 'hot-mug', label: 'Hot mug', title: 'Hot drink near the table edge', x: 43, y: 41,
    body: '', prompt: 'A sleeve or bag could catch the handle. What would help?',
    options: [
      { id: 'move', label: 'Move it back from the edge, handle inward', correct: true, feedback: 'If safe to handle, place the mug on a stable surface away from the edge with its handle clear of passing people. This reduces the chance of a knock and scald.' },
      { id: 'warn', label: 'Leave it there and tell people to be careful', correct: false, feedback: 'A warning alone leaves the hot drink within reach of a passing sleeve or bag. Move it safely away from the edge, with the handle inward.' },
    ],
  },
  {
    id: 'cupboard', label: 'Cupboard', title: 'Cupboard door left open', x: 86, y: 66,
    body: '', prompt: 'You’ll need another cup soon. What should you do?',
    options: [
      { id: 'ajar', label: 'Leave it partly open for the next person', correct: false, feedback: 'A partly open door still projects into the aisle. Close it fully between uses so people can pass safely.' },
      { id: 'close', label: 'Close it fully between uses', correct: true, feedback: 'Closing the door removes an obstruction at knee height. If it won’t close properly, keep people clear and report the defect.' },
    ],
  },
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
