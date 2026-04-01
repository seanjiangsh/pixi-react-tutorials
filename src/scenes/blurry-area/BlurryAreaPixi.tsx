import { useCallback, useMemo, useState, useRef } from "react";
import { Container, Graphics, FederatedPointerEvent, Rectangle } from "pixi.js";
import { extend } from "@pixi/react";
import { useControls } from "leva";
import useSceneSize from "src/utils/hooks/useSceneSize";
import { blurryAreaControls } from "./blurryAreaControls";
import { BlurAreaShapeGfx } from "./BlurAreaShapeGfx";
import { EdgeBlurEffect } from "./EdgeBlurEffect";

extend({ Container, Graphics });

// Generate random gradient configuration
const generateRandomGradient = () => {
  const isRadial = Math.random() > 0.5;
  const color1 = Math.floor(Math.random() * 0xffffff);
  const color2 = Math.floor(Math.random() * 0xffffff);
  const color3 = Math.floor(Math.random() * 0xffffff);

  const stops = [
    { offset: 0, color: `#${color1.toString(16).padStart(6, "0")}` },
    { offset: 0.5, color: `#${color2.toString(16).padStart(6, "0")}` },
    { offset: 1, color: `#${color3.toString(16).padStart(6, "0")}` },
  ];

  return {
    type: isRadial ? ("radial" as const) : ("linear" as const),
    colorStops: stops,
  };
};

// Initialize 3 shapes with relative positions (0-1)
const initializeShapes = () => {
  return [
    {
      id: 0,
      relX: 0.3,
      relY: 0.3,
      gradient: generateRandomGradient(),
      baseSize: 1.0,
      shapeType: "circle" as const,
    },
    {
      id: 1,
      relX: 0.7,
      relY: 0.4,
      gradient: generateRandomGradient(),
      baseSize: 1.2,
      shapeType: "rect" as const,
    },
    {
      id: 2,
      relX: 0.5,
      relY: 0.7,
      gradient: generateRandomGradient(),
      baseSize: 0.9,
      shapeType: "rect" as const,
    },
  ];
};

export function BlurryAreaPixi() {
  const { width, height } = useSceneSize();

  const [controls] = useControls("Blurry Area", () => ({
    areaMargin: { ...blurryAreaControls.areaMargin },
    blurStrength: { ...blurryAreaControls.blurStrength },
    shapeSize: { ...blurryAreaControls.shapeSize },
    edgeThreshold: { ...blurryAreaControls.edgeThreshold },
  }));

  // Calculate boundary rectangle
  const boundary = useMemo(() => {
    const marginX = width * controls.areaMargin;
    const marginY = height * controls.areaMargin;
    return {
      x: marginX,
      y: marginY,
      width: width - marginX * 2,
      height: height - marginY * 2,
    };
  }, [width, height, controls.areaMargin]);

  // Calculate shape size based on viewport
  const shapeRadius = useMemo(
    () => Math.min(width, height) * controls.shapeSize,
    [width, height, controls.shapeSize],
  );

  // Initialize shapes once with relative positions
  const [shapes, setShapes] = useState(() => initializeShapes());

  // Dragging state
  const [draggedShapeId, setDraggedShapeId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const shapesContainerRef = useRef<Container | null>(null);

  // Update shape relative position
  const updateShapePosition = useCallback(
    (id: number, relX: number, relY: number) => {
      setShapes((prev) =>
        prev.map((shape) =>
          shape.id === id ? { ...shape, relX, relY } : shape,
        ),
      );
    },
    [],
  );

  // Handle pointer down on shape
  const handleShapePointerDown = useCallback(
    (id: number, shapeX: number, shapeY: number, e: FederatedPointerEvent) => {
      setDraggedShapeId(id);
      const localPos = e.getLocalPosition(e.currentTarget.parent!);
      dragOffset.current = {
        x: localPos.x - shapeX,
        y: localPos.y - shapeY,
      };
    },
    [],
  );

  // Handle pointer move on container
  const handleContainerPointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      if (draggedShapeId === null) return;

      const shape = shapes.find((s) => s.id === draggedShapeId);
      if (!shape) return;

      const localPos = e.getLocalPosition(e.currentTarget);
      let newX = localPos.x - dragOffset.current.x;
      let newY = localPos.y - dragOffset.current.y;

      // Constrain within boundary
      const radius = shapeRadius * shape.baseSize;
      newX = Math.max(radius, Math.min(boundary.width - radius, newX));
      newY = Math.max(radius, Math.min(boundary.height - radius, newY));

      // Convert to relative position
      const relX = newX / boundary.width;
      const relY = newY / boundary.height;

      updateShapePosition(draggedShapeId, relX, relY);
    },
    [draggedShapeId, shapes, boundary, shapeRadius, updateShapePosition],
  );

  // Handle pointer up
  const handleContainerPointerUp = useCallback(() => {
    setDraggedShapeId(null);
  }, []);

  // Draw boundary
  const drawBoundary = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(0, 0, boundary.width, boundary.height);
      g.stroke({ width: 2, color: 0x444444 });
    },
    [boundary],
  );

  // Convert relative positions to absolute
  const shapesWithAbsolutePos = useMemo(
    () =>
      shapes.map((shape) => ({
        ...shape,
        x: shape.relX * boundary.width,
        y: shape.relY * boundary.height,
      })),
    [shapes, boundary],
  );

  // Create hitArea for the container to capture all pointer events
  // Expand hitArea when dragging to capture pointer moves outside boundary
  const containerHitArea = useMemo(() => {
    if (draggedShapeId !== null) {
      // When dragging, use full scene area (accounting for boundary offset)
      return new Rectangle(-boundary.x, -boundary.y, width, height);
    }
    // Normal state: just the boundary
    return new Rectangle(0, 0, boundary.width, boundary.height);
  }, [draggedShapeId, boundary, width, height]);

  return (
    <pixiContainer
      x={boundary.x}
      y={boundary.y}
      eventMode="static"
      hitArea={containerHitArea}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerUpOutside={handleContainerPointerUp}
    >
      {/* Boundary rectangle */}
      <pixiGraphics draw={drawBoundary} />

      {/* Edge blur effects (rendered behind shapes) */}
      <EdgeBlurEffect
        shapesContainerRef={shapesContainerRef}
        boundary={boundary}
        edgeThreshold={controls.edgeThreshold}
        blurStrength={controls.blurStrength}
        sceneWidth={width}
        sceneHeight={height}
      />

      {/* Shapes container */}
      <pixiContainer
        ref={(ref: Container | null) => {
          shapesContainerRef.current = ref;
        }}
      >
        {/* Draggable shapes */}
        {shapesWithAbsolutePos.map((shape) => (
          <BlurAreaShapeGfx
            key={shape.id}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            radius={shapeRadius * shape.baseSize}
            gradient={shape.gradient}
            shapeType={shape.shapeType}
            isDragging={draggedShapeId === shape.id}
            onPointerDown={handleShapePointerDown}
          />
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}
