import { useRef, useEffect } from "react";
import { useControls } from "leva";

import { SceneProps } from "src/scenes/Scenes";
import { fetchAndParseSVG } from "src/utils/graphics/svgParser";
import { useSceneStore } from "src/stores/useSceneStore";

import { SVGParserPixi } from "./SVGParserPixi";
import { useSVGParserStore } from "./useSVGParserStore";

export default function SVGParser({ isPixi }: SceneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setParsedSVG, fileInputRef: storeFileInputRef } = useSVGParserStore();
  const { setCanvasPointerEvents } = useSceneStore();

  const { showLabels, minimal } = useControls("SVG Parser", {
    showLabels: false,
    minimal: false,
  });

  // Set canvas pointer-events to auto on mount
  useEffect(() => {
    setCanvasPointerEvents("auto");
  }, [setCanvasPointerEvents]);

  // Set fileInputRef when !isPixi
  useEffect(() => {
    if (isPixi || !fileInputRef.current) return;
    useSVGParserStore.getState().setFileInputRef(fileInputRef);
  }, [isPixi]);

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use the URL.createObjectURL to create a temporary URL for the file
    const url = URL.createObjectURL(file);

    try {
      // Parse using the fetchAndParseSVG utility with minimal mode
      const parsed = await fetchAndParseSVG(url, minimal);

      // Filter closed paths from the parsed paths
      const closedPaths = parsed.paths.filter((p) => p.isClosed);

      console.log("Parsed SVG", parsed);

      setParsedSVG({
        paths: closedPaths,
        dimensions: parsed.dimensions,
      });
    } finally {
      // Clean up the object URL
      URL.revokeObjectURL(url);
    }
  };

  const handleButtonClick = () => {
    storeFileInputRef?.current?.click();
  };

  // DOM elements (file input button)
  if (!isPixi) {
    return (
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleFileLoad}
        style={{ display: "none" }}
      />
    );
  }

  // Pixi elements
  return (
    <SVGParserPixi onButtonClick={handleButtonClick} showLabels={showLabels} />
  );
}
