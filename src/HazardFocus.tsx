import { useId, useState } from 'react';
import { Focus, Scan } from 'lucide-react';

export type FocusRegion = { x: number; y: number; width: number; height: number };

/** Percent-based bounds follow the uncropped artwork at every screen size. */
export default function HazardFocus({ region, label }: { region: FocusRegion; label: string }) {
  const maskId = useId();
  const [overview, setOverview] = useState(false);
  return <div className={`hazard-focus ${overview ? 'is-overview' : ''}`}>
    <svg className="hazard-focus-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><mask id={maskId}><rect width="100" height="100" fill="white"/><rect className="hazard-focus-window" {...region} rx="3" fill="black"/></mask></defs>
      <rect width="100" height="100" fill="#17343b" fillOpacity=".64" mask={`url(#${maskId})`}/>
      <rect className="hazard-focus-window hazard-focus-outline" {...region} rx="3" fill="none" stroke="#ffe0a0" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
    </svg>
    <button className="hazard-focus-toggle" type="button" aria-pressed={overview} aria-label={`${overview ? 'Focus on hazard' : 'Show full scene'} for ${label}`} onClick={() => setOverview(value => !value)}>
      {overview ? <Focus size={16}/> : <Scan size={16}/>}<span>{overview ? 'Focus on hazard' : 'Show full scene'}</span>
    </button>
  </div>;
}
