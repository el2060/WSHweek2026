import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {AlarmScene, RouteScene, GroupScene, AssemblyScene, AccountScene} from './scenes';

export const FireProtocol = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={165} name="Alarm sounds"><AlarmScene/></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({direction:'from-right'})} timing={linearTiming({durationInFrames:18})}/>
    <TransitionSeries.Sequence durationInFrames={210} name="Use the safe route"><RouteScene/></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
    <TransitionSeries.Sequence durationInFrames={210} name="Stay with the group"><GroupScene/></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({direction:'from-bottom'})} timing={linearTiming({durationInFrames:18})}/>
    <TransitionSeries.Sequence durationInFrames={210} name="Gather at Zone A"><AssemblyScene/></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:12})}/>
    <TransitionSeries.Sequence durationInFrames={255} name="Account and recap"><AccountScene/></TransitionSeries.Sequence>
  </TransitionSeries>
);
