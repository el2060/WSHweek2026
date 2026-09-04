import {Composition, Folder} from 'remotion';
import {FireProtocol} from './FireProtocol';
import {AlarmScene, RouteScene, GroupScene, AssemblyScene, AccountScene} from './scenes';

export const RemotionRoot = () => (
  <>
    <Folder name="Fire-Emergency-Scenes">
      <Composition id="01-Alarm" component={AlarmScene} durationInFrames={165} fps={30} width={1280} height={720}/>
      <Composition id="02-Route" component={RouteScene} durationInFrames={210} fps={30} width={1280} height={720}/>
      <Composition id="03-StayTogether" component={GroupScene} durationInFrames={210} fps={30} width={1280} height={720}/>
      <Composition id="04-Assembly" component={AssemblyScene} durationInFrames={210} fps={30} width={1280} height={720}/>
      <Composition id="05-Account" component={AccountScene} durationInFrames={255} fps={30} width={1280} height={720}/>
    </Folder>
    <Composition id="FireEmergencyProtocol" component={FireProtocol} durationInFrames={990} fps={30} width={1280} height={720}/>
  </>
);
