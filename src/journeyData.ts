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
    reference: [...emergencyReference, 'For this practice: the student is awake, breathing normally and seated beside Block 73. Arrange first aid, then report once things are safe.'],
    links: [emergencyLink],
    moments: [
      { id: 'care', label: 'Check in', ...injuryImage,
        title: 'What comes first?', story: 'The student is awake and seated. “My ankle hurts.”',
        choices: [
          { id: 'stand', label: 'Help them stand to check they can walk', correct: false, feedback: 'Standing could make it worse. Don’t move them—check how they feel and arrange first aid.' },
          { id: 'check', label: 'Check how they feel without moving them', correct: true, feedback: 'Care comes first. Reassure them, avoid moving them and arrange first aid.' },
        ],
      },
      { id: 'space', label: 'Keep clear', ...injuryImage,
        title: 'Keep the area safe.', story: 'The tiles are wet and more people are approaching.',
        choices: [
          { id: 'guide', label: 'Ask a colleague to guide people around', correct: true, feedback: 'Stay with the student while someone guides others around the wet area—this helps prevent another slip.' },
          { id: 'mop', label: 'Leave a warning sign and fetch a mop', correct: false, feedback: 'A sign helps, but don’t leave the student alone. Ask a colleague to redirect people and arrange cleanup.' },
        ],
      },
      { id: 'help', label: 'Get help', ...injuryImage,
        title: 'Get first-aid support.', story: 'The student is awake and breathing normally.',
        choices: [
          { id: 'chat', label: 'Send a photo to the group chat and wait', correct: false, feedback: 'A chat message can be missed. Ask directly for first-aid support and give the exact location.' },
          { id: 'ask', label: 'Ask a colleague to get first-aid support; give the location', correct: true, feedback: 'Say what happened and where. Stay with the student, then report it once things are safe.' },
        ],
      },
    ],
  },
  haze: {
    id: 'haze', heading: 'Haze response',
    safety: `Breathing difficulty? Call ${officialInfo.ambulanceNumber} immediately.`,
    reference: [...emergencyReference, 'Reduce haze exposure. Anyone with asthma who develops symptoms should see a doctor promptly. Check current NEA advice before planning outdoor activities.'],
    links: [{label:'NEA haze advice',href:'https://www.haze.gov.sg/'},{label:'HealthHub haze advice',href:'https://www.healthhub.sg/highlights-and-insights/health-safety-advisory/how-to-protect-yourself-against-haze'},emergencyLink],
    moments: [
      { id: 'plan', label: 'Activity', ...hazeImage,
        title: 'Keep the outdoor activity?', story: 'It’s hazy. A colleague with asthma starts coughing.',
        choices: [
          { id: 'change', label: 'Move the activity indoors or postpone it', correct: true, feedback: 'Move things indoors and encourage prompt medical advice—asthma symptoms need extra care.' },
          { id: 'shorten', label: 'Shorten the outdoor session', correct: false, feedback: 'A shorter session still means exposure. Move indoors or postpone, and suggest medical advice for your colleague’s symptoms.' },
        ],
      },
      { id: 'shelter', label: 'Cleaner air', ...hazeImage,
        title: 'Where should you go?', story: 'They can walk comfortably but are still coughing.',
        choices: [
          { id: 'covered', label: 'Rest under the covered walkway', correct: false, feedback: 'Covered is still outdoors. Go together to a room with cleaner air and seek medical advice promptly.' },
          { id: 'indoors', label: 'Go together into a room with cleaner air', correct: true, feedback: 'Cleaner air reduces exposure. Stay with them and seek prompt medical advice for their asthma symptoms.' },
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
