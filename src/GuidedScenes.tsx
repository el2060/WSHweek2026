import DecisionJourney, { clearDecisionProgress } from './DecisionJourney';

export function clearGuidedProgress() {
  clearDecisionProgress('injury');
  clearDecisionProgress('haze');
  try {
    localStorage.removeItem('clte-decisions-v1-reporting');
    localStorage.removeItem('clte-reporting-v1');
  } catch { /* Optional local progress. */ }
}
export function InjuryScene({ onComplete }: { onComplete: () => void }) {
  return <DecisionJourney kind="injury" onComplete={onComplete}/>;
}
export function HazeScene({ onComplete }: { onComplete: () => void }) {
  return <DecisionJourney kind="haze" onComplete={onComplete}/>;
}
