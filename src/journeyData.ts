import { officialInfo } from './config';

export type JourneyKind = 'injury' | 'haze';
export type JourneyChoice = { id: string; label: string; correct: boolean; feedback: string };
export type JourneyMoment = { id: string; label: string; title: string; story: string; image: string; alt: string; choices: JourneyChoice[] };
export type JourneyDefinition = {
  id: string; heading: string; safety: string;
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
    id: 'walkway', heading: 'Injury response',
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
          { id: 'ask', label: 'Ask a colleague to get first-aid support; give the location', correct: true, feedback: 'Say what happened and where. Stay with the student; report the incident in the WSH Portal after care and safety are addressed.' },
        ],
      },
    ],
  },
  haze: {
    id: 'haze', heading: 'Haze response',
    safety: `Breathing difficulty? Call ${officialInfo.ambulanceNumber} immediately.`,
    reference: [...emergencyReference, 'Reduce haze exposure. People with asthma who develop symptoms should seek medical advice promptly. Check current NEA advice when planning outdoor activities.'],
    links: [{label:'NEA haze advice',href:'https://www.haze.gov.sg/'},{label:'HealthHub haze advice',href:'https://www.healthhub.sg/highlights-and-insights/health-safety-advisory/how-to-protect-yourself-against-haze'},emergencyLink],
    moments: [
      { id: 'plan', label: 'Activity', ...hazeImage,
        title: 'Keep the outdoor activity?', story: 'It’s hazy. A colleague with asthma starts coughing.',
        choices: [
          { id: 'change', label: 'Move the activity indoors or postpone it', correct: true, feedback: 'Reduce outdoor exposure and encourage prompt medical advice. People with asthma who develop symptoms need extra care.' },
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
};
