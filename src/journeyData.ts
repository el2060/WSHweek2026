import { officialInfo } from './config';

export type JourneyKind = 'injury' | 'haze' | 'reporting';
export type JourneyChoice = { id: string; label: string; correct: boolean; feedback: string };
export type JourneyMoment = { id: string; label: string; title: string; story: string; image: string; alt: string; choices: JourneyChoice[] };
export type JourneyDefinition = {
  id: string; heading: string; next: string; safety: string;
  reference: string[]; links: { label: string; href: string }[]; moments: JourneyMoment[];
};
const injuryImage = { image: '/assets/walkway.webp', alt: 'A student seated on a wet campus walkway while colleagues help and guide people around.' };
const hazeImage = { image: '/assets/haze-response.png', alt: 'A colleague coughing on a hazy campus walkway, with another colleague beside them.' };
const emergencyReference = [
  `Serious injury or difficulty breathing: call ${officialInfo.ambulanceNumber} immediately. Give the exact location and follow the operator’s instructions.`,
  `Then inform Guard Post: ${officialInfo.emergencyNumber}, so responders can be guided in.`,
];
const emergencyLink = { label: 'SCDF emergency advice', href: 'https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services' };

// Each scene asks for a judgement, not a click to reveal an already-given answer.
// Keep each setup short and each feedback to one useful distinction.
export const journeys: Record<JourneyKind, JourneyDefinition> = {
  injury: {
    id: 'walkway', heading: '03 · Injury response', next: 'Haze',
    safety: `Serious injury or breathing difficulty? Call ${officialInfo.ambulanceNumber}.`,
    reference: [...emergencyReference, 'For this practice: the student is awake, breathing normally and seated beside Block 73. Arrange first aid; report the incident after care and safety are addressed.'],
    links: [emergencyLink],
    moments: [
      { id: 'care', label: 'Check in', ...injuryImage,
        title: 'What comes first?', story: 'The student is awake and seated. “My ankle hurts.”',
        choices: [
          { id: 'stand', label: 'Help them stand to check they can walk', correct: false, feedback: 'Standing could worsen an injury. Avoid moving them unnecessarily; check how they feel and arrange first-aid support.' },
          { id: 'check', label: 'Check how they feel without moving them', correct: true, feedback: 'Care comes first. Reassure them, avoid unnecessary movement and arrange first-aid support.' },
        ],
      },
      { id: 'space', label: 'Keep clear', ...injuryImage,
        title: 'Keep the area safe.', story: 'The tiles are wet and more people are approaching.',
        choices: [
          { id: 'guide', label: 'Ask a colleague to guide people around', correct: true, feedback: 'Stay with the student while someone guides others around the wet area. This helps prevent another slip.' },
          { id: 'mop', label: 'Leave a warning sign and fetch a mop', correct: false, feedback: 'A sign helps, but don’t leave the student alone. Ask a colleague to redirect people and arrange cleaning.' },
        ],
      },
      { id: 'help', label: 'Get help', ...injuryImage,
        title: 'Get first-aid support.', story: 'The student is awake and breathing normally.',
        choices: [
          { id: 'chat', label: 'Send a photo to the group chat and wait', correct: false, feedback: 'The message may be missed. Ask directly for first-aid support and give the exact location.' },
          { id: 'ask', label: 'Ask a colleague for first aid; give the location', correct: true, feedback: 'Say what happened and where. Stay with the student; report the incident in the WSH Portal after care and safety are addressed.' },
        ],
      },
    ],
  },
  haze: {
    id: 'haze', heading: '04 · Haze response', next: 'Report',
    safety: `Breathing difficulty? Call ${officialInfo.ambulanceNumber} immediately.`,
    reference: [...emergencyReference, 'Reduce haze exposure. People with asthma who develop symptoms should seek medical advice promptly. Check current NEA advice when planning outdoor activities.'],
    links: [{label:'NEA haze advice',href:'https://www.haze.gov.sg/'},{label:'HealthHub haze advice',href:'https://www.healthhub.sg/highlights-and-insights/health-safety-advisory/how-to-protect-yourself-against-haze'},emergencyLink],
    moments: [
      { id: 'plan', label: 'Activity', ...hazeImage,
        title: 'Keep the outdoor activity?', story: 'It’s hazy. A colleague with asthma starts coughing.',
        choices: [
          { id: 'change', label: 'Move it indoors or postpone it', correct: true, feedback: 'Reduce outdoor exposure and encourage prompt medical advice. People with asthma who develop symptoms need extra care.' },
          { id: 'shorten', label: 'Shorten the outdoor session', correct: false, feedback: 'A shorter session still means exposure. Move indoors or postpone, and encourage medical advice for your colleague’s symptoms.' },
        ],
      },
      { id: 'shelter', label: 'Cleaner air', ...hazeImage,
        title: 'Where should you go?', story: 'They can walk comfortably but are still coughing.',
        choices: [
          { id: 'covered', label: 'Rest under the covered walkway', correct: false, feedback: 'Covered is still outdoors. Go together to a room with cleaner air and seek medical advice promptly.' },
          { id: 'indoors', label: 'Go together into a room with cleaner air', correct: true, feedback: 'Cleaner indoor air reduces exposure. Stay with them and seek medical advice promptly for their asthma symptoms.' },
        ],
      },
      { id: 'urgent', label: 'Urgent help', ...hazeImage,
        title: 'They’re struggling to breathe.', story: 'Their breathing gets worse, even after resting.',
        choices: [
          { id: 'call', label: `Call ${officialInfo.ambulanceNumber} now`, correct: true, feedback: `Call ${officialInfo.ambulanceNumber}, give your exact location and follow instructions. Then alert Guard Post: ${officialInfo.emergencyNumber}.` },
          { id: 'reading', label: 'Wait for the next air-quality reading', correct: false, feedback: `Breathing difficulty needs urgent help. Call ${officialInfo.ambulanceNumber} now; don’t wait for a haze reading.` },
        ],
      },
    ],
  },
  reporting: {
    id: 'reporting', heading: '05 · Get help & report', next: 'report practice', safety: '',
    reference: [...emergencyReference, 'WSH Portal: incidents and near misses. A near miss is an event that could have hurt someone, but did not.', `Fault reporting: ${officialInfo.faultNumber}. Keep defective equipment out of use. An incident can also need a repair request.`],
    links: [emergencyLink],
    moments: [
      { id: 'help', label: 'Breathing', ...hazeImage,
        title: 'What comes first?', story: 'A colleague is struggling to breathe.',
        choices: [
          { id: 'call', label: `Call ${officialInfo.ambulanceNumber} now`, correct: true, feedback: `Call ${officialInfo.ambulanceNumber} first and give the exact location. Then alert Guard Post: ${officialInfo.emergencyNumber}. Reporting comes later.` },
          { id: 'form', label: 'Submit an urgent WSH report', correct: false, feedback: `A form cannot send urgent medical help. Call ${officialInfo.ambulanceNumber} immediately; reporting can wait.` },
        ],
      },
      { id: 'injury', label: 'Fall', ...injuryImage,
        title: 'How should this be recorded?', story: 'A student was hurt in a fall. First aid is arranged.',
        choices: [
          { id: 'fault', label: 'Fault report for the wet floor only', correct: false, feedback: 'A fault report addresses the floor, not the injury. Also record the incident in the WSH Portal.' },
          { id: 'incident', label: 'WSH Portal: incident', correct: true, feedback: 'Someone was injured, so report an incident. A fault report may also be needed to fix the floor.' },
        ],
      },
      { id: 'near-miss', label: 'Falling box', image: '/assets/report-near-miss.png', alt: 'A fallen box beside an unhurt colleague in an office storage area.',
        title: 'Does it need a report?', story: 'A box narrowly missed a colleague. Nobody was hurt.',
        choices: [
          { id: 'near-miss', label: 'Record a near miss in the WSH Portal', correct: true, feedback: 'A near miss is a warning, even without injury. Reporting helps fix the cause before someone is hurt.' },
          { id: 'restack', label: 'Restack the boxes; no report needed', correct: false, feedback: 'Restacking alone misses the lesson. Report the near miss so its cause can be addressed.' },
        ],
      },
      { id: 'repair', label: 'Chair', image: '/assets/report-chair-defect.png', alt: 'An unused chair with a cracked leg, tagged out of use while a colleague arranges a repair.',
        title: 'Which report fits?', story: 'A cracked chair is out of use. No incident occurred.',
        choices: [
          { id: 'near-miss', label: 'WSH Portal: near miss', correct: false, feedback: 'A defect without an event is not a near miss. Request a repair and keep the chair out of use.' },
          { id: 'fault', label: 'Fault report: request a repair', correct: true, feedback: `Keep it out of use. Report the fault with its exact location: ${officialInfo.faultNumber}.` },
        ],
      },
    ],
  },
};
