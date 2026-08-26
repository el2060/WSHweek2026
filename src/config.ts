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
    body: 'The tote bag is in the shared walkway. Someone could catch a foot on it.',
    cue: 'Give the bag a storage spot outside the walking route.',
    action: 'Move the bag into storage', result: 'Bag stored · walkway clear',
    takeaway: '“Just for a minute” is still a trip risk.',
    learning: 'People may not notice a bag while carrying things. Clear the route instead of asking everyone to step around it.',
  },
  {
    id: 'drawer', label: 'Drawer', title: 'Drawer left open', x: 35, y: 85,
    body: 'The open drawer sticks out from the cabinet into the space people walk through.',
    cue: 'Check that nobody is using it, then close it fully.',
    action: 'Close the drawer', result: 'Drawer closed · obstruction removed',
    takeaway: 'A small habit keeps a shared space clear.',
    learning: 'Close drawers after use. A warning is not needed when you can safely remove the obstruction straight away.',
  },
  {
    id: 'cable', label: 'Cable', title: 'Cable hanging beside the desk', x: 15, y: 81,
    body: 'The loose lead hangs down beside the desk, where a foot could catch it.',
    cue: 'Ask the equipment owner to secure the lead away from feet.',
    action: 'Ask for the cable to be secured', result: 'Cable support request practised',
    takeaway: 'You can help without unplugging equipment.',
    learning: 'Keep people clear while the lead is secured. Don’t unplug unfamiliar equipment or handle a damaged cable; ask for support.',
  },
  {
    id: 'files', label: 'Files', title: 'Files leaning near the edge', x: 29, y: 67,
    body: 'Beside the laptop, a pile of files leans towards the edge of the cabinet. It could topple.',
    cue: 'Store the files securely on a shelf, clear of the walkway.',
    action: 'Store the files on a shelf', result: 'Files stored · edge clear',
    takeaway: 'Give loose files a stable home.',
    learning: 'The aim is to stop the pile toppling, not just make it look tidy. Store files securely without creating a new obstacle on the floor.',
  },
  {
    id: 'drink', label: 'Drink', title: 'Drink beside the printer', x: 86.5, y: 71,
    body: 'The cup is beside the printer. A knock could spill liquid onto the equipment.',
    cue: 'Move the drink to a separate surface away from equipment.',
    action: 'Move the drink away from the printer', result: 'Drink moved · equipment kept clear',
    takeaway: 'Make space between drinks and equipment.',
    learning: 'A lid helps with splashes, but distance also matters. Moving the drink removes the nearby spill risk without moving the printer.',
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
