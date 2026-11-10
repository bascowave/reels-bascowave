import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Edit, END_SECONDS, FPS } from "./Edit";
import data from "./edit-data.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="GrokbotNaPratica"
        component={Edit}
        durationInFrames={Math.ceil((data.duration + END_SECONDS) * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
