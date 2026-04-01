import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  MutableRefObject,
} from "react";
import {
  Graphics,
  Container as PixiContainer,
  RenderTexture,
  Sprite,
  Matrix,
} from "pixi.js";
import { extend, useTick, useApplication } from "@pixi/react";
import { KawaseBlurFilter } from "pixi-filters";

extend({ Graphics, Sprite });

interface EdgeBlurEffectProps {
  shapesContainerRef: MutableRefObject<PixiContainer | null>;
  boundary: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  edgeThreshold: number;
  blurStrength: number;
  sceneWidth: number;
  sceneHeight: number;
}

export function EdgeBlurEffect({
  shapesContainerRef,
  boundary,
  blurStrength,
  sceneWidth,
  sceneHeight,
}: EdgeBlurEffectProps) {
  const { app } = useApplication();
  const renderTextureRef = useRef<RenderTexture | null>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const maskGraphicsRef = useRef<Graphics | null>(null);

  // Create blur filter
  const blurFilter = useMemo(
    () =>
      blurStrength > 0
        ? new KawaseBlurFilter({ strength: blurStrength, quality: 10 })
        : null,
    [blurStrength],
  );

  // Create render texture with full scene size
  useEffect(() => {
    if (sceneWidth > 0 && sceneHeight > 0) {
      // Destroy old texture first
      if (renderTextureRef.current) {
        renderTextureRef.current.destroy(true);
      }

      renderTextureRef.current = RenderTexture.create({
        width: sceneWidth,
        height: sceneHeight,
      });

      // Reset sprite texture to the new RenderTexture
      if (spriteRef.current) {
        spriteRef.current.texture = renderTextureRef.current;
      }
    }

    return () => {
      if (renderTextureRef.current) {
        renderTextureRef.current.destroy(true);
        renderTextureRef.current = null;
      }
    };
  }, [sceneWidth, sceneHeight]);

  // Draw mask for area outside the boundary
  const drawOutsideMask = useCallback(
    (g: Graphics) => {
      g.clear();

      // Draw the outer frame (everything outside the boundary)
      // Top bar
      g.rect(0, 0, sceneWidth, boundary.y);
      // Left bar
      g.rect(0, boundary.y, boundary.x, boundary.height);
      // Right bar
      g.rect(
        boundary.x + boundary.width,
        boundary.y,
        sceneWidth - (boundary.x + boundary.width),
        boundary.height,
      );
      // Bottom bar
      g.rect(
        0,
        boundary.y + boundary.height,
        sceneWidth,
        sceneHeight - (boundary.y + boundary.height),
      );

      g.fill({ color: 0xffffff });
    },
    [sceneWidth, sceneHeight, boundary],
  );

  // Set up mask on sprite
  useEffect(() => {
    if (spriteRef.current && maskGraphicsRef.current) {
      spriteRef.current.mask = maskGraphicsRef.current;
    }
  }, []);

  // Render container to texture on every tick
  useTick(() => {
    if (
      !shapesContainerRef.current ||
      !renderTextureRef.current ||
      !spriteRef.current ||
      !app
    )
      return;

    const shapesContainer = shapesContainerRef.current;
    const renderer = app.renderer;

    if (!renderer) return;

    // Create transform matrix to position shapes at boundary offset
    const transform = new Matrix();
    transform.translate(boundary.x, boundary.y);

    // Render the shapes container to texture
    renderer.render({
      container: shapesContainer,
      target: renderTextureRef.current,
      transform,
    });

    // Update sprite texture
    spriteRef.current.texture = renderTextureRef.current;
  });

  if (!blurFilter) return null;

  return (
    <>
      {/* Mask graphics (hidden) - covers full scene, cuts out boundary */}
      <pixiGraphics
        x={-boundary.x}
        y={-boundary.y}
        ref={(ref: Graphics | null) => {
          maskGraphicsRef.current = ref;
          if (spriteRef.current && ref) {
            spriteRef.current.mask = ref;
          }
        }}
        draw={drawOutsideMask}
      />

      {/* Sprite displaying the blurred texture - positioned to cover full scene */}
      <pixiSprite
        x={-boundary.x}
        y={-boundary.y}
        ref={(ref: Sprite | null) => {
          spriteRef.current = ref;
          if (maskGraphicsRef.current && ref) {
            ref.mask = maskGraphicsRef.current;
          }
        }}
        texture={RenderTexture.EMPTY}
        filters={blurFilter ? [blurFilter] : undefined}
      />
    </>
  );
}
