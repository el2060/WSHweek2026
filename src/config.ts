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
    body: 'Someone could trip over it.', prompt: 'What should you do?',
    options: [
      { id: 'store', label: 'Put the bag in a cupboard', correct: true, feedback: 'Keep bags and straps out of the walkway—even if you are only leaving them for a minute.' },
      { id: 'leave', label: 'Leave the bag in the walkway', correct: false, feedback: 'Someone could trip. Put the bag in a cupboard so the walkway stays clear.' },
    ],
  },
  {
    id: 'drawer', label: 'Drawer', title: 'Drawer left open', x: 35, y: 85,
    body: 'It blocks the path. Nobody is using it.', prompt: 'What should you do?',
    options: [
      { id: 'close', label: 'Close the drawer fully', correct: true, feedback: 'Close drawers after use so nobody bumps into them or trips.' },
      { id: 'leave', label: 'Leave the drawer open', correct: false, feedback: 'Someone could walk into it. Close the drawer fully to clear the path.' },
    ],
  },
  {
    id: 'cable', label: 'Cable', title: 'Loose cable', x: 15, y: 81,
    body: 'Someone could catch their foot on it.', prompt: 'What should you do?',
    options: [
      { id: 'secure', label: 'Ask for the cable to be secured away from feet', correct: true, feedback: 'Keep others clear while help is arranged. Don’t handle damaged cables or unplug unfamiliar equipment.' },
      { id: 'leave', label: 'Leave the cable hanging and step over it', correct: false, feedback: 'The next person could trip. Ask for the cable to be secured away from feet.' },
    ],
  },
  {
    id: 'files', label: 'Files', title: 'Files leaning near the edge', x: 29, y: 67,
    body: 'The files could fall off.', prompt: 'What should you do?',
    options: [
      { id: 'store', label: 'Put the files inside a cupboard', correct: true, feedback: 'Store files inside the cupboard, away from the edge. Keep heavier files on lower shelves.' },
      { id: 'leave', label: 'Leave the files leaning at the edge', correct: false, feedback: 'The files could fall on someone. Put them inside a cupboard instead.' },
    ],
  },
  {
    id: 'drink', label: 'Drink', title: 'Drink beside the printer', x: 86.5, y: 71,
    body: 'A spill could damage the printer.', prompt: 'What should you do?',
    options: [
      { id: 'move', label: 'Move the drink to a table away from the printer', correct: true, feedback: 'Keep drinks away from electrical equipment. A lid helps with spills but does not remove the risk.' },
      { id: 'leave', label: 'Leave the drink beside the printer', correct: false, feedback: 'A spill could reach the printer. Move the drink to a table away from electrical equipment.' },
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
