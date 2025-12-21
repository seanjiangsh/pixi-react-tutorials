import { create } from "zustand";

import { ParsedSVG } from "src/utils/graphics/svgParser";
import { useSceneStore } from "src/stores/useSceneStore";

interface SVGParserState {
  parsedSVG: ParsedSVG | null;
  setParsedSVG: (svg: ParsedSVG | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null> | null;
  setFileInputRef: (ref: React.RefObject<HTMLInputElement | null>) => void;
}

export const useSVGParserStore = create<SVGParserState>((set) => ({
  parsedSVG: null,
  setParsedSVG: (svg) => {
    set({ parsedSVG: svg });
    // Update canvas pointer-events based on whether SVG is loaded
    const { setCanvasPointerEvents } = useSceneStore.getState();
    setCanvasPointerEvents(svg ? "auto" : "none");
  },
  fileInputRef: null,
  setFileInputRef: (ref) => set({ fileInputRef: ref }),
}));
