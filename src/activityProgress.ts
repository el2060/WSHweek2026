export const scenarios = [
  { id: 'office', title: 'Pantry hazards', label: 'Pantry', description: 'Spot everyday hazards in the CLTE pantry.', image: '/assets/clte-pantry-hazards-v2.png', detail: '4 decisions' },
  { id: 'cubicles', title: 'Office cubicle hazards', label: 'Cubicles', description: 'Consider posture, glare, IT equipment and safe reaching.', image: '/assets/clte-cubicle-hazards-v2.png', detail: '4 decisions' },
  { id: 'experiment', title: 'Experiment Room', label: 'Experiment Room', description: 'Check electrical equipment and damaged seating.', image: '/assets/experiment-room/training-illustrated-v4.png', detail: '3 decisions' },
  { id: 'evacuation', title: 'Fire evacuation', label: 'Fire', description: 'Make your way safely from Block 27 to the assembly point.', image: '/assets/fire-route/route-01.webp', detail: '7 decisions' },
  { id: 'walkway', title: 'Injury response', label: 'Injury', description: 'Decide what to do when someone is hurt.', image: '/assets/walkway.webp', detail: '3 decisions' },
  { id: 'haze', title: 'Haze response', label: 'Haze', description: 'Make practical decisions when air quality changes.', image: '/assets/haze-response.png', detail: '3 decisions' },
] as const;

export type ScenarioId = typeof scenarios[number]['id'];
export type Progress = Record<ScenarioId, boolean> & { guide: boolean; completion: boolean };
export const initialProgress: Progress = { office: false, cubicles: false, experiment: false, walkway: false, haze: false, evacuation: false, guide: false, completion: false };

export function normalizeProgress(saved: Partial<Progress> | null): Progress {
  // The old office completion included both pantry and Experiment Room.
  const progress = { ...initialProgress,
    office: Boolean(saved?.office), cubicles: Boolean(saved?.cubicles), experiment: Boolean(saved?.experiment ?? saved?.office),
    walkway: Boolean(saved?.walkway), haze: Boolean(saved?.haze), evacuation: Boolean(saved?.evacuation),
    guide: Boolean(saved?.guide),
  };
  return { ...progress, completion: scenarios.every(scenario => progress[scenario.id]) };
}

export function completeActivity(progress: Progress, key: ScenarioId | 'guide'): Progress {
  return normalizeProgress({ ...progress, [key]: true });
}

// Completion measures participation. Correctness only controls learning feedback.
export function hasAnswer(options: readonly { id: string }[], answer: string | undefined) {
  return options.some(option => option.id === answer);
}
