import { useState, useEffect } from "react";
import { Stage, Container, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";

// We could turn these into props for production use
const width = 200;
const height = 100;
// Start to move the text when the step is over 70
const moveTrashold = 70;
const moveRange = 100 - moveTrashold;

const textStyle = new TextStyle({
  fill: "0xffffff",
  align: "center",
  fontSize: height * 0.8,
});

export default function CountDown() {
  // const { width, height } = useSceneSize();
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
        <Text
          text={(count - 1).toString()}
          anchor={0.5}
          y={step < moveTrashold ? -height : currentRange - height}
          style={textStyle}
        />
      )}

      {count <= 10 && (
        <Text
          text={count.toString()}
          anchor={0.5}
          y={step < moveTrashold ? 0 : currentRange}
          style={textStyle}
        />
      )}
    </>
  );

  return (
    <Stage width={width} height={height}>
      <Container x={width / 2} y={height / 2}>
        {text}
      </Container>
    </Stage>
  );
}
