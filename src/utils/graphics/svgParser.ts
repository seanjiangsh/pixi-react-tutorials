import { SVGPathData as SVGPathDataParser } from "svg-pathdata";

export interface SVGPathData {
  path: string;
  stroke?: string;
  strokeWidth?: number;
  isClosed?: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface SVGDimensions {
  width: number;
  height: number;
}

export interface ParsedSVG {
  paths: SVGPathData[];
  dimensions: SVGDimensions;
}

/**
 * Checks if a path is closed and calculates its bounds
 */
function analyzePathData(pathString: string): {
  isClosed: boolean;
  bounds: { x: number; y: number; width: number; height: number };
} {
  // console.log("🔍 Analyzing path:", pathString.substring(0, 100));

  const parser = new SVGPathDataParser(pathString);
  const commands = parser.toAbs().commands;

  let isClosed = false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  commands.forEach((command) => {
    if (command.type === SVGPathDataParser.CLOSE_PATH) {
      isClosed = true;
      // console.log("✅ Found CLOSE_PATH command");
    }

    // Handle main coordinates
    if ("x" in command && "y" in command) {
      minX = Math.min(minX, command.x);
      minY = Math.min(minY, command.y);
      maxX = Math.max(maxX, command.x);
      maxY = Math.max(maxY, command.y);
    }

    // Handle control points for curves
    if ("x1" in command && "y1" in command) {
      minX = Math.min(minX, command.x1);
      minY = Math.min(minY, command.y1);
      maxX = Math.max(maxX, command.x1);
      maxY = Math.max(maxY, command.y1);
    }
    if ("x2" in command && "y2" in command) {
      minX = Math.min(minX, command.x2);
      minY = Math.min(minY, command.y2);
      maxX = Math.max(maxX, command.x2);
      maxY = Math.max(maxY, command.y2);
    }
  });

  // console.log(
  //   `Path analysis result: isClosed=${isClosed}, commands count=${commands.length}`
  // );

  return {
    isClosed,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}

/**
 * Parses an SVG string and extracts path data and dimensions
 */
export function parseSVG(svgText: string): ParsedSVG {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

  // Get SVG viewBox dimensions
  const svgElement = svgDoc.querySelector("svg");
  const viewBox = svgElement?.getAttribute("viewBox");
  let dimensions: SVGDimensions = { width: 0, height: 0 };

  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(parseFloat);
    dimensions = { width, height };
  }

  // Extract all path and rect elements
  const paths: SVGPathData[] = [];

  // Get path elements
  svgDoc.querySelectorAll("path").forEach((pathElement) => {
    const d = pathElement.getAttribute("d");
    const stroke = pathElement.getAttribute("stroke") || undefined;
    const strokeWidth = parseFloat(
      pathElement.getAttribute("stroke-width") || "1"
    );
    if (d) {
      const { isClosed, bounds } = analyzePathData(d);
      paths.push({ path: d, stroke, strokeWidth, isClosed, bounds });
    }
  });

  // Get rect elements and convert them to paths
  svgDoc.querySelectorAll("rect").forEach((rectElement) => {
    const x = parseFloat(rectElement.getAttribute("x") || "0");
    const y = parseFloat(rectElement.getAttribute("y") || "0");
    const width = parseFloat(rectElement.getAttribute("width") || "0");
    const height = parseFloat(rectElement.getAttribute("height") || "0");
    const transform = rectElement.getAttribute("transform");
    const stroke = rectElement.getAttribute("stroke") || undefined;
    const strokeWidth = parseFloat(
      rectElement.getAttribute("stroke-width") || "1"
    );

    // Convert rect to path
    const rectPath = convertRectToPath(x, y, width, height, transform);
    const { isClosed, bounds } = analyzePathData(rectPath);
    paths.push({ path: rectPath, stroke, strokeWidth, isClosed, bounds });
  });

  return { paths, dimensions };
}

/**
 * Converts a rect element to an SVG path string
 */
function convertRectToPath(
  x: number,
  y: number,
  width: number,
  height: number,
  transform?: string | null
): string {
  let rectPath = `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${
    y + height
  } L ${x} ${y + height} Z`;

  // Handle rotation transform
  if (transform?.includes("rotate")) {
    const match = transform.match(/rotate\(([^)]+)\)/);
    if (match) {
      const [angle, cx, cy] = match[1].split(/\s+/).map(parseFloat);
      if (angle === -90 || angle === 270) {
        const corners = [
          { x: 0, y: 0 },
          { x: width, y: 0 },
          { x: width, y: height },
          { x: 0, y: height },
        ];

        const rotated = corners.map((point) => {
          const rad = (angle * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          return {
            x: cx + (point.x * cos - point.y * sin),
            y: cy + (point.x * sin + point.y * cos),
          };
        });

        rectPath = `M ${rotated[0].x} ${rotated[0].y} L ${rotated[1].x} ${rotated[1].y} L ${rotated[2].x} ${rotated[2].y} L ${rotated[3].x} ${rotated[3].y} Z`;
      }
    }
  }

  return rectPath;
}

/**
 * Fetches and parses an SVG file from a URL
 */
export async function fetchAndParseSVG(url: string): Promise<ParsedSVG> {
  const response = await fetch(url);
  const text = await response.text();
  return parseSVG(text);
}
