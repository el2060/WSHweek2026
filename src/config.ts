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
    body: 'Its owner will be back in a minute.', prompt: 'Which is the safer option?',
    options: [
      { id: 'store', label: 'Put the bag in a cupboard', correct: true, feedback: 'Even a quick stop can cause a trip. Keep bags and straps completely out of the walkway.' },
      { id: 'side', label: 'Move it to the side of the walkway', correct: false, feedback: 'The side is still part of the walkway. Put the bag in a cupboard so the whole path stays clear.' },
    ],
  },
  {
    id: 'drawer', label: 'Drawer', title: 'Drawer left open', x: 35, y: 85,
    body: 'You’ll need another file in a minute.', prompt: 'Which is the safer option?',
    options: [
      { id: 'halfway', label: 'Push it halfway in for now', correct: false, feedback: 'Half-open drawers still stick into the path. Close it fully, even if you’ll need it again shortly.' },
      { id: 'close', label: 'Close it fully and reopen it when needed', correct: true, feedback: 'Close drawers between uses. Even a partly open drawer can catch someone walking past.' },
    ],
  },
  {
    id: 'cable', label: 'Cable', title: 'Loose cable', x: 15, y: 81,
    body: 'You don’t know what this cable is connected to.', prompt: 'Which is the safer option?',
    options: [
      { id: 'unplug', label: 'Unplug it to clear the path straight away', correct: false, feedback: 'Unplugging could interrupt equipment in use. Keep others clear and ask the colleague using it to secure the cable.' },
      { id: 'secure', label: 'Keep others clear and ask for the cable to be secured', correct: true, feedback: 'Clear the trip risk without unplugging unfamiliar equipment. Ask the colleague using it to arrange a safe fix.' },
    ],
  },
  {
    id: 'files', label: 'Files', title: 'Files leaning near the edge', x: 29, y: 67,
    body: 'These heavy files need a safer storage spot.', prompt: 'Which is the safer option?',
    options: [
      { id: 'store', label: 'Put them on a lower shelf inside the cupboard', correct: true, feedback: 'Store heavy files low. They are easier to lift and less likely to fall from height.' },
      { id: 'high', label: 'Put them on top of the cupboard to free up space', correct: false, feedback: 'Heavy files overhead are harder to lift and could fall. Use a lower shelf inside the cupboard instead.' },
    ],
  },
  {
    id: 'drink', label: 'Drink', title: 'Drink beside the printer', x: 86.5, y: 71,
    body: 'You’re waiting for a large print job.', prompt: 'Which is the safer option?',
    options: [
      { id: 'lid', label: 'Put a lid on it and keep it beside the printer', correct: false, feedback: 'A lid helps, but the drink can still spill. Move it to a table away from the printer.' },
      { id: 'move', label: 'Put it on a table away from the printer', correct: true, feedback: 'Distance protects the printer from spills. A lid alone does not remove the risk.' },
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
