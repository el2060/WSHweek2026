import DecisionJourney, { clearDecisionProgress } from './DecisionJourney';

export function clearReportingProgress() { clearDecisionProgress('reporting'); }
export default function ReportingScene({ onComplete }: { onComplete: () => void }) {
  return <DecisionJourney kind="reporting" onComplete={onComplete}/>;
}
