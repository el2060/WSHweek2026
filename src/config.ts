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

export const officeHotspots = [
  {
    id: 'bag', label: 'Bag', title: 'Bag in the walkway', x: 49, y: 80,
    body: 'Someone could trip over it.', prompt: 'Choose a storage spot',
    options: [
      { id: 'cubby', label: 'Storage cubby', feedback: 'Out of the walkway—even a bag left briefly can trip someone.' },
      { id: 'hook', label: 'Sturdy bag hook', feedback: 'A suitable hook keeps the bag and its straps off the walking route.' },
    ],
  },
  {
    id: 'drawer', label: 'Drawer', title: 'Drawer left open', x: 35, y: 85,
    body: 'It blocks the path. Nobody is using it.', prompt: 'How will you get it closed?',
    options: [
      { id: 'close', label: 'Close it myself', feedback: 'A quick close removes the obstruction. Make it a habit after use.' },
      { id: 'ask', label: 'Ask a colleague', feedback: 'Ask the nearby colleague to close it. Keep the path clear until it is shut.' },
    ],
  },
  {
    id: 'cable', label: 'Cable', title: 'Loose cable', x: 15, y: 81,
    body: 'A foot could catch this hanging lead.', prompt: 'Who could help secure it?',
    options: [
      { id: 'owner', label: 'Equipment owner', feedback: 'Keep others clear while it is secured. Don’t unplug unfamiliar equipment or handle damaged cables.' },
      { id: 'facilities', label: 'Facilities team', feedback: 'Ask for help if it needs fixing. Keep others clear; don’t handle damaged cables.' },
    ],
  },
  {
    id: 'files', label: 'Files', title: 'Files leaning near the edge', x: 29, y: 67,
    body: 'This leaning pile could topple.', prompt: 'Choose a secure home',
    options: [
      { id: 'shelf', label: 'Shelf with bookends', feedback: 'Bookends support the files. Keep the shelf stable and the walkway clear.' },
      { id: 'cupboard', label: 'Filing cupboard', feedback: 'Store them securely inside—not in a pile on the floor.' },
    ],
  },
  {
    id: 'drink', label: 'Drink', title: 'Drink beside the printer', x: 86.5, y: 71,
    body: 'A spill could reach the equipment.', prompt: 'Choose a separate surface',
    options: [
      { id: 'table', label: 'Clear side table', feedback: 'A separate surface keeps spills away from the printer. A lid alone does not remove the risk.' },
      { id: 'pantry', label: 'Pantry counter', feedback: 'Keep it away from appliances there too. Distance from equipment matters.' },
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
