import { Text, BlurFilter, TextStyle } from "pixi.js";
import { extend } from "@pixi/react";
import { useMemo } from "react";

extend({
  Text,
});

type BluredTextProps = {
  blurStrngth?: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
};

export default function BluredText(props: BluredTextProps) {
  const { blurStrngth = 1, text, x, y, fontSize } = props;
  const blurFilter = useMemo(
    () => new BlurFilter({ strength: blurStrngth }),
    [blurStrngth]
  );

  return (
    <pixiText
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
          dropShadow: {
            color: "#E72264",
            distance: 6,
          },
        })
      }
    />
  );
}
