import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check } from 'lucide-react';
import { scenarios, type ScenarioId } from './activityProgress';
import { ReadingText } from './ReadingText';

const takeaways: Record<ScenarioId, string> = {
  office: 'Keep walkways clear and deal with hazards promptly.',
  cubicles: 'Adjust your workstation and use suitable equipment to reach items stored up high.',
  experiment: 'Keep unsafe equipment out of use, warn others and report the fault.',
  evacuation: 'Follow the warden to Zone A, then stay with CLTE for roll call.',
  walkway: 'Care for the person, keep the area clear and arrange first aid.',
  haze: 'Reduce exposure and seek appropriate help when symptoms develop.',
};

export default function ScenarioClosure({ scenarioId, completed, onHome, onReview, returnFocusTo }: {
  scenarioId: ScenarioId; completed: number; onHome: () => void; onReview: () => void; returnFocusTo: HTMLElement | null;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const review = useRef(onReview);
  review.current = onReview;
  const scenario = scenarios.find(item => item.id === scenarioId)!;
  useEffect(() => {
    const trigger = returnFocusTo;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    title.current?.focus({ preventScroll: true });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); review.current(); return; }
      if (event.key !== 'Tab') return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyboard);
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<div className="scenario-closure-backdrop">
    <div ref={dialog} className="scenario-closure" role="dialog" aria-modal="true" aria-labelledby="scenario-closure-title" aria-describedby="scenario-closure-takeaway">
      <span className="scenario-closure-check" aria-hidden="true"><Check size={24}/></span>
      <p className="eyebrow">{scenario.title}</p>
      <h2 ref={title} id="scenario-closure-title" tabIndex={-1}>Scenario complete.</h2>
      <p id="scenario-closure-takeaway"><ReadingText>{takeaways[scenarioId]}</ReadingText></p>
      <p className="scenario-closure-progress">{completed === scenarios.length ? 'All 6 scenarios completed.' : `${completed} of ${scenarios.length} scenarios completed.`}</p>
      <div className="scenario-closure-actions">
        <button className="primary" onClick={onHome}>Back to home <ArrowRight size={18}/></button>
        <button className="text-button" onClick={onReview}>Review scenario</button>
      </div>
    </div>
  </div>, document.body);
}
