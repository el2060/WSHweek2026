import DecisionJourney, { clearDecisionProgress } from './DecisionJourney';

export function clearGuidedProgress() {
  clearDecisionProgress('injury');
  clearDecisionProgress('haze');
}
export function InjuryScene({ onComplete }: { onComplete: () => void }) {
  return <DecisionJourney kind="injury" onComplete={onComplete}/>;
}
export function HazeScene({ onComplete }: { onComplete: () => void }) {
  return <DecisionJourney kind="haze" onComplete={onComplete}/>;
}
