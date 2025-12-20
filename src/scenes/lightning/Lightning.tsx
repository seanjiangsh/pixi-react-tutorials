import { useEffect } from "react";
import { SceneProps } from "src/scenes/Scenes";
import { LightningDOM } from "src/scenes/lightning/LightningDOM";
import { LightningPixi } from "src/scenes/lightning/LightningPixi";
import { useLightningStore } from "src/scenes/lightning/useLightningStore";
import { useSceneStore } from "src/stores/useSceneStore";

export type BorderBoltProps = {
  enableLightning?: boolean;
  jaggedAmplitude?: number;
  jaggedFrequency1?: number;
  jaggedFrequency2?: number;
  jaggedFrequency3?: number;
  timeScale?: number;
  randomness?: number;
  inset?: number;
  borderRadius?: number;
  lineWidth?: number;
  branchProbability?: number;
  branchLength?: number;
  startDelay?: number;
  roundDuration?: number;
  growthDuration?: number;
};

export type TravelBoltProps = {
  boltCount?: number;
  displacement?: number;
  jaggedness?: number;
  branchProbability?: number;
  branchLength?: number;
  travelDuration?: number;
};

export type BoltDemoProps = {
  boltAmount?: number;
  displacement?: number;
  jaggedness?: number;
  segmentPoints?: number;
  segmentDensity?: number;
  envelopeShape?: number;
  smoothingIterations?: number;
  lineWidth?: number;
  lineWidthVariation?: number;
  opacityVariation?: number;
  boltColor1?: string;
  boltColor2?: string;
  boltColor3?: string;
  glowDistance?: number;
  oscillationCycle?: number;
};

export type LightningProps = SceneProps & {
  borderBolt?: BorderBoltProps;
  travelBolt?: TravelBoltProps;
  boltDemo?: BoltDemoProps;
  showBoltDemo?: boolean;
  regenerateTrigger?: boolean;
};

export default function Lightning(props: LightningProps) {
  const {
    isPixi,
    borderBolt,
    travelBolt,
    boltDemo,
    showBoltDemo,
    regenerateTrigger,
  } = props;
  const {
    setBorderBoltControls,
    setTravelBoltControls,
    setBoltDemoControls,
    toggleBoltDemo,
    regenerate,
    showBoltDemo: currentShowBoltDemo,
  } = useLightningStore();

  // Update store when props change
  useEffect(() => {
    if (borderBolt) setBorderBoltControls(borderBolt);
  }, [borderBolt, setBorderBoltControls]);

  useEffect(() => {
    if (travelBolt) setTravelBoltControls(travelBolt);
  }, [travelBolt, setTravelBoltControls]);

  useEffect(() => {
    if (boltDemo) setBoltDemoControls(boltDemo);
  }, [boltDemo, setBoltDemoControls]);

  // Handle showBoltDemo toggle from Storybook
  useEffect(() => {
    if (showBoltDemo !== undefined && showBoltDemo !== currentShowBoltDemo) {
      toggleBoltDemo();
    }
  }, [showBoltDemo, currentShowBoltDemo, toggleBoltDemo]);

  // Handle regenerate trigger from Storybook
  useEffect(() => {
    if (regenerateTrigger !== undefined) {
      regenerate();
    }
  }, [regenerateTrigger, regenerate]);

  // Set canvas pointer-events to none for DOM interactions
  useEffect(() => {
    const { setCanvasPointerEvents } = useSceneStore.getState();
    setCanvasPointerEvents("none");
    return () => setCanvasPointerEvents("auto");
  }, []);

  if (isPixi) {
    return <LightningPixi />;
  } else {
    return <LightningDOM />;
  }
}
