import { useState, useEffect, useRef } from "react";
import { useTick } from "@pixi/react";

import {
  getBoardBounds,
  getAllCellCorners,
  type BoardBounds,
  type CellCorners,
} from "./geometry";
import {
  createSpotlights,
  updateSpotlightPhysics,
  assignSpotlightsToCells,
  type Spotlight,
  type AnimationPhase,
} from "./physics";
import { DimmingLayer } from "./DimmingLayer";
import { SpotlightLayer } from "./SpotlightLayer";

type AnimationControls = {
  autoAdvance: boolean;
  focusDuration: number;
  expandDuration: number;
  expandPause: number;
  velocityWeight: number;
};

type SpotlightGfxProps = {
  showDimming?: boolean;
  dimmingOpacity?: number;
  spotlightCount?: number;
  spotlightRadius?: number;
  maxSpeed?: number;
  acceleration?: number;
  friction?: number;
  animationPhase?: AnimationPhase;
  focusedCells?: number[];
  animationControls?: AnimationControls;
  cellCornersCache?: Map<number, CellCorners>;
  onPhaseComplete?: () => void;
};

export function SpotlightGfx(props: SpotlightGfxProps) {
  const {
    showDimming = true,
    dimmingOpacity = 0.75,
    spotlightCount = 2,
    spotlightRadius = 80,
    maxSpeed = 100,
    acceleration = 50,
    friction = 0.95,
    animationPhase = "searching",
    focusedCells = [],
    animationControls = {
      autoAdvance: true,
      focusDuration: 1.0,
      expandDuration: 0.8,
      expandPause: 0.3,
      velocityWeight: 50,
    },
    onPhaseComplete,
  } = props;

  // Cache board bounds and cell corners
  const [boardBounds, setBoardBounds] = useState<BoardBounds | null>(null);
  const [cellCornersCache, setCellCornersCache] = useState<
    Map<number, CellCorners>
  >(new Map());

  // Spotlight state
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const canvasSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Phase timing refs
  const phaseStartTimeRef = useRef<number>(0);
  const [assignedCells, setAssignedCells] = useState<number[]>([]);
  const [expandingStartTime, setExpandingStartTime] = useState<number>(0);

  // Initialize spotlights
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas || !boardBounds) return;

    const rect = canvas.getBoundingClientRect();
    canvasSizeRef.current = { width: rect.width, height: rect.height };

    setSpotlights(
      createSpotlights(spotlightCount, spotlightRadius, maxSpeed, boardBounds)
    );
  }, [spotlightCount, maxSpeed, spotlightRadius, boardBounds]);

  // Reset phase timer when phase changes
  useEffect(() => {
    phaseStartTimeRef.current = Date.now();
    if (animationPhase === "focusing" || animationPhase === "expanding") {
      setAssignedCells(
        assignSpotlightsToCells(
          spotlights,
          focusedCells,
          cellCornersCache,
          animationControls.velocityWeight
        )
      );
    }
    // Reset expanding timer when phase changes away from expanding
    if (animationPhase !== "expanding") {
      setExpandingStartTime(0);
    }
  }, [
    animationPhase,
    spotlights,
    focusedCells,
    cellCornersCache,
    animationControls.velocityWeight,
  ]);

  // Animation loop for spotlight physics
  useTick((ticker) => {
    const { width, height } = canvasSizeRef.current;
    if (width === 0 || height === 0 || !boardBounds) return;

    const deltaTime = ticker.deltaTime / 60; // Convert to seconds

    // Initialize expanding phase timer synchronously when phase changes
    if (animationPhase === "expanding" && expandingStartTime === 0) {
      setExpandingStartTime(Date.now());
    }

    // Phase timing and auto-advance
    const currentElapsedTime = (Date.now() - phaseStartTimeRef.current) / 1000;
    if (animationControls.autoAdvance && onPhaseComplete) {
      if (
        animationPhase === "focusing" &&
        currentElapsedTime > animationControls.focusDuration
      ) {
        onPhaseComplete();
        return;
      } else if (
        animationPhase === "expanding" &&
        currentElapsedTime >
          animationControls.expandPause + animationControls.expandDuration
      ) {
        onPhaseComplete();
        return;
      }
    }

    // Update spotlight physics and assignments
    if (animationPhase === "focusing") {
      const newAssignments = assignSpotlightsToCells(
        spotlights,
        focusedCells,
        cellCornersCache,
        animationControls.velocityWeight
      );
      setAssignedCells(newAssignments);
    }

    // Clone spotlights array before mutating
    const updatedSpotlights = spotlights.map((s) => ({ ...s }));
    updateSpotlightPhysics({
      spotlights: updatedSpotlights,
      animationPhase,
      deltaTime,
      maxSpeed,
      acceleration,
      friction,
      boardBounds,
      assignedCells,
      cellCornersCache,
    });
    setSpotlights(updatedSpotlights);
  });

  // Measure board and cells on mount and resize
  useEffect(() => {
    const measureGeometry = () => {
      const bounds = getBoardBounds();
      setBoardBounds(bounds);

      const cellMap = getAllCellCorners(37);
      setCellCornersCache(cellMap);
    };

    // Initial measurement with delay to ensure DOM is ready
    setTimeout(measureGeometry, 100);

    // Re-measure on resize
    window.addEventListener("resize", measureGeometry);
    return () => window.removeEventListener("resize", measureGeometry);
  }, []);

  return (
    <>
      <DimmingLayer
        showDimming={showDimming}
        boardBounds={boardBounds}
        opacity={dimmingOpacity}
      />
      <SpotlightLayer
        showDimming={showDimming}
        spotlights={spotlights}
        animationPhase={animationPhase}
        expandingStartTime={expandingStartTime}
        assignedCells={assignedCells}
        cellCornersCache={cellCornersCache}
        animationControls={animationControls}
      />
    </>
  );
}
