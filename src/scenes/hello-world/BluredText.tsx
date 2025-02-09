import { Text } from "@pixi/react";
import { BlurFilter, TextStyle } from "pixi.js";
import { useMemo } from "react";

type BluredTextProps = {
  blurStrngth?: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
};

export default function BluredText(props: BluredTextProps) {
  const { blurStrngth = 2, text, x, y, fontSize } = props;
  const blurFilter = useMemo(() => new BlurFilter(blurStrngth), [blurStrngth]);

  return (
    <Text
      text={text}
      anchor={0.5}
      x={x}
      y={y}
      filters={[blurFilter]}
      style={
        new TextStyle({
          align: "center",
          fill: "0xffffff",
          fontSize,
          letterSpacing: 10,
          dropShadow: true,
          dropShadowColor: "#E72264",
          dropShadowDistance: 6,
        })
      }
    />
  );
}
