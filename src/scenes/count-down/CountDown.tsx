import { useState, useEffect, useCallback } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, TextStyle } from "pixi.js";

import { SceneProps } from "../sceneLoader";
import useSceneSize from "../../utils/useSceneSize";

extend({ Container, Text, Graphics });

const textHeight = 100;
// Start to move the text when the step is over 70
const moveTrashold = 70;
const moveRange = 100 - moveTrashold;

const textStyle = new TextStyle({
  fill: "0xffffff",
  align: "center",
  fontSize: textHeight * 0.8,
});

export default function CountDown({ containerRef }: SceneProps) {
  const { width, height } = useSceneSize();
  const [count, setCount] = useState(11);
  // step is 0 to 100 for the animation
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev === 0 ? 11 : prev - 1));
      setStep(0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // We could use requestAnimationFrame to sync with other countdowns
    // Only for demonstration purposes here
    const animationInterval = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 10);
    return () => clearInterval(animationInterval);
  }, [count]);

  const currentRange = ((moveRange - (100 - step)) / moveRange) * height;

  const text = count > 0 && (
    <>
      {count - 1 > 0 && (
        <pixiText
          text={(count - 1).toString()}
          anchor={0.5}
          y={step < moveTrashold ? -height : currentRange - height}
          style={textStyle}
        />
      )}

      {count <= 10 && (
        <pixiText
          text={count.toString()}
          anchor={0.5}
          y={step < moveTrashold ? 0 : currentRange}
          style={textStyle}
        />
      )}
    </>
  );

  const drawTextBG = useCallback(
    (g: Graphics) => {
      const startY = height / 2 - textHeight / 2;
      g.clear();
      g.setFillStyle({ color: "#ff9f82cc" });
      g.rect(0, startY, width, textHeight);
      g.fill();
    },
    [height, width]
  );

  return (
    <Application
      width={width}
      height={height}
      background={0x1099bb}
      resizeTo={containerRef}
    >
      <pixiGraphics width={width} height={textHeight} draw={drawTextBG} />
      <pixiContainer x={width / 2} y={height / 2}>
        {text}
      </pixiContainer>
    </Application>
  );
}
