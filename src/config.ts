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
    id: 'bag', label: 'Bag', title: 'Bag blocks the walkway', x: 49, y: 80,
    body: '', prompt: 'Where should the bag go?',
    options: [
      { id: 'store', label: 'In a cupboard', correct: true, feedback: 'Keep bags and straps fully off the walkway.' },
      { id: 'side', label: 'At the side of the walkway', correct: false, feedback: 'Still a trip risk. Store it fully off the walkway.' },
    ],
  },
  {
    id: 'drawer', label: 'Drawer', title: 'Drawer left open', x: 35, y: 85,
    body: '', prompt: 'You need it again soon. What now?',
    options: [
      { id: 'halfway', label: 'Leave it half-open', correct: false, feedback: 'It still sticks into the path. Close it between uses.' },
      { id: 'close', label: 'Close it fully', correct: true, feedback: 'Close drawers between uses so they do not project into the path.' },
    ],
  },
  {
    id: 'cable', label: 'Cable', title: 'Loose cable', x: 15, y: 81,
    body: '', prompt: 'You don’t know what it powers. What now?',
    options: [
      { id: 'unplug', label: 'Unplug it now', correct: false, feedback: 'Don’t unplug unknown equipment. Keep people clear and ask for help.' },
      { id: 'secure', label: 'Keep people clear and ask for help', correct: true, feedback: 'Protect the area and get the cable secured safely.' },
    ],
  },
  {
    id: 'files', label: 'Files', title: 'Heavy files near the edge', x: 29, y: 67,
    body: '', prompt: 'Where should the files go?',
    options: [
      { id: 'store', label: 'On a low cupboard shelf', correct: true, feedback: 'Heavy files are safer stored low and away from edges.' },
      { id: 'high', label: 'On top of the cupboard', correct: false, feedback: 'They could fall from height. Store heavy files low.' },
    ],
  },
  {
    id: 'drink', label: 'Drink', title: 'Drink beside the printer', x: 86.5, y: 71,
    body: '', prompt: 'Where should the drink go?',
    options: [
      { id: 'lid', label: 'Beside the printer, with a lid', correct: false, feedback: 'A lid can still leak. Move the drink away from equipment.' },
      { id: 'move', label: 'On a table away from the printer', correct: true, feedback: 'Distance keeps spills away from electrical equipment.' },
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
