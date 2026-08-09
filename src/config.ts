export const officialInfo = {
  ambulanceNumber: '995',
  emergencyNumber: '6460 6999',
  sasNumber: '6460 6777',
  faultNumber: '6460 6000',
  assemblyArea: 'Admin Field',
  links: {
    wshPortal: '',
    faultReport: '',
    emergencyInfo: '',
    studentInsurance: '',
    hazeSop: '',
  },
};

export type Hotspot = { id: string; title: string; body: string; action: string; x: number; y: number };

export const officeHotspots: Hotspot[] = [
  { id: 'bag', title: 'Bag in the walkway', body: 'Easy to overlook on a busy day, but it could cause someone to trip.', action: 'Move it into a proper storage area and keep the shared route clear.', x: 49, y: 80 },
  { id: 'drawer', title: 'Open drawer', body: 'A low open drawer projects into a movement area and can catch a passing foot.', action: 'Close it fully once you have what you need.', x: 34, y: 85 },
  { id: 'cable', title: 'Loose charging cable', body: 'The cable crosses the route and adds an electrical and trip concern.', action: 'Unplug or reroute it along the desk edge with a cable guide.', x: 15, y: 76 },
  { id: 'files', title: 'Unstable stack', body: 'The files are leaning where they could fall or block access.', action: 'Reduce the stack and store heavier items lower down.', x: 29, y: 67 },
  { id: 'drink', title: 'Drink near equipment', body: 'A spill beside electrical equipment could create a bigger problem.', action: 'Move the drink to a stable surface away from the equipment.', x: 94, y: 66 },
];

export const wetActions = [
  ['care', 'Check on the student', 'Start with wellbeing. Ask what help is needed and avoid moving them unnecessarily.'],
  ['help', 'Seek first aid or emergency help', 'For a minor injury, seek a trained first aider. For a serious injury, call 995 immediately and inform the NP Guard Post at 6460 6999 with the exact location.'],
  ['protect', 'Keep others away from the wet area', 'This reduces the chance of a second incident while help is arranged.'],
  ['alert', 'Alert the area owner or support service', 'The continuing hazard needs attention by the relevant team.'],
  ['record', 'Record useful details', 'Location, time, conditions and immediate action help the follow-up.'],
  ['report', 'Report the incident', 'A stable situation still needs prompt reporting through the WSH Portal.'],
  ['follow', 'Follow up on wellbeing', 'Support continues after the immediate situation is safe.'],
] as const;

export const evacuationActions = [
  'Stop the activity', 'Ask participants to leave calmly', 'Follow fire wardens and the designated route',
  'Assist anyone who may need help', 'Leave unnecessary belongings', 'Proceed to the CLTE assembly area',
  'Remain with the group for roll call', 'Report anyone who may be unaccounted for',
];

export const routes = [
  { id: 'emergency', correct: 'emergency', label: 'Serious injury needing immediate medical help', channel: `Call ${officialInfo.ambulanceNumber}, then inform ${officialInfo.emergencyNumber}`, detail: 'Give 995 a brief description and exact location. Inform the NP Guard Post so security can guide the ambulance to the scene.' },
  { id: 'incident', correct: 'incident', label: 'Injury incident, now stable', channel: 'WSH Portal', detail: 'The immediate situation is stable, but the injury incident should still be reported promptly.' },
  { id: 'near-miss', correct: 'incident', label: 'A heavy box falls nearby; nobody is hurt', channel: 'WSH Portal · Near miss', detail: 'Nobody was injured, but someone could have been. Recording the near miss helps the cause to be addressed before it happens again.' },
  { id: 'fault', correct: 'fault', label: 'Hazard or physical defect spotted', channel: `Call ${officialInfo.faultNumber} or report online`, detail: 'No one is injured and no near miss occurred. Reporting the defect helps prevent an incident.' },
];
