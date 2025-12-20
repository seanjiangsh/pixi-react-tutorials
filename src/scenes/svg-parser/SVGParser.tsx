import { useRef, useEffect } from "react";

import { SceneProps } from "src/scenes/Scenes";
import { fetchAndParseSVG } from "src/utils/graphics/svgParser";
import { useSceneStore } from "src/stores/useSceneStore";

import { SVGParserPixi } from "./SVGParserPixi";
import { useSVGParserStore } from "./useSVGParserStore";

export default function SVGParser({ isPixi }: SceneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setParsedSVG, fileInputRef: storeFileInputRef } = useSVGParserStore();
  const { setCanvasPointerEvents } = useSceneStore();

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
      // Parse using the fetchAndParseSVG utility
      const parsed = await fetchAndParseSVG(url);

      // Use closed paths from the pathGroups
      const closedPaths = parsed.pathGroups.closedPaths;

      console.log("Parsed SVG", parsed);

      setParsedSVG({
        paths: closedPaths,
        pathGroups: {
          closedPaths,
          openPaths: parsed.pathGroups.openPaths,
        },
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
  return <SVGParserPixi onButtonClick={handleButtonClick} />;
}
