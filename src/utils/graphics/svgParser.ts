import { SVGPathData as SVGPathDataParser } from "svg-pathdata";

export interface SVGCommand {
  type: string;
  typeName: string;
  coords: Record<string, number>;
}

export interface SVGPathData {
  path?: string;
  stroke?: string;
  strokeWidth?: number;
  isClosed?: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
  center?: { x: number; y: number };
  commands?: SVGCommand[];
}

export interface SVGDimensions {
  width: number;
  height: number;
}

export interface PathGroup {
  closedPaths: SVGPathData[];
  openPaths: SVGPathData[];
}

export interface ParsedSVG {
  paths: SVGPathData[];
  pathGroups?: PathGroup;
  dimensions: SVGDimensions;
}

/**
 * Checks if a path is closed and calculates its bounds
 */
function analyzePathData(pathString: string): {
  isClosed: boolean;
  bounds: { x: number; y: number; width: number; height: number };
  center?: { x: number; y: number };
  commands: SVGCommand[];
} {
  // console.log("🔍 Analyzing path:", pathString.substring(0, 100));

  const parser = new SVGPathDataParser(pathString);
  const commands = parser.toAbs().commands;

  let isClosed = false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let currentX = 0;
  let currentY = 0;

  const svgCommands: SVGCommand[] = [];

  // Map of command type numbers to names
  const commandTypeNames: Record<number, string> = {
    [SVGPathDataParser.MOVE_TO]: "MOVE_TO",
    [SVGPathDataParser.LINE_TO]: "LINE_TO",
    [SVGPathDataParser.HORIZ_LINE_TO]: "HORIZ_LINE_TO",
    [SVGPathDataParser.VERT_LINE_TO]: "VERT_LINE_TO",
    [SVGPathDataParser.CURVE_TO]: "CURVE_TO",
    [SVGPathDataParser.SMOOTH_CURVE_TO]: "SMOOTH_CURVE_TO",
    [SVGPathDataParser.QUAD_TO]: "QUAD_TO",
    [SVGPathDataParser.SMOOTH_QUAD_TO]: "SMOOTH_QUAD_TO",
    [SVGPathDataParser.ARC]: "ARC",
    [SVGPathDataParser.CLOSE_PATH]: "CLOSE_PATH",
  };

  commands.forEach((command) => {
    if (command.type === SVGPathDataParser.CLOSE_PATH) {
      isClosed = true;
      // console.log("✅ Found CLOSE_PATH command");
    }

    // Extract coordinates for this command
    const coords: Record<string, number> = {};

    // Handle main coordinates
    if ("x" in command && "y" in command) {
      coords.x = command.x;
      coords.y = command.y;
      currentX = command.x;
      currentY = command.y;
      minX = Math.min(minX, command.x);
      minY = Math.min(minY, command.y);
      maxX = Math.max(maxX, command.x);
      maxY = Math.max(maxY, command.y);
    } else if ("x" in command) {
      // HORIZ_LINE_TO only has x
      coords.x = command.x;
      currentX = command.x;
      minX = Math.min(minX, command.x);
      maxX = Math.max(maxX, command.x);
      // Use current Y for bounds
      minY = Math.min(minY, currentY);
      maxY = Math.max(maxY, currentY);
    } else if ("y" in command) {
      // VERT_LINE_TO only has y
      coords.y = command.y;
      currentY = command.y;
      minY = Math.min(minY, command.y);
      maxY = Math.max(maxY, command.y);
      // Use current X for bounds
      minX = Math.min(minX, currentX);
      maxX = Math.max(maxX, currentX);
    }

    // Handle control points for curves
    if ("x1" in command && "y1" in command) {
      coords.x1 = command.x1;
      coords.y1 = command.y1;
      minX = Math.min(minX, command.x1);
      minY = Math.min(minY, command.y1);
      maxX = Math.max(maxX, command.x1);
      maxY = Math.max(maxY, command.y1);
    }
    if ("x2" in command && "y2" in command) {
      coords.x2 = command.x2;
      coords.y2 = command.y2;
      minX = Math.min(minX, command.x2);
      minY = Math.min(minY, command.y2);
      maxX = Math.max(maxX, command.x2);
      maxY = Math.max(maxY, command.y2);
    }

    // Handle arc parameters
    if ("rX" in command) coords.rX = command.rX;
    if ("rY" in command) coords.rY = command.rY;
    if ("xRot" in command) coords.xRot = command.xRot;
    if ("lArcFlag" in command) coords.lArcFlag = command.lArcFlag;
    if ("sweepFlag" in command) coords.sweepFlag = command.sweepFlag;

    svgCommands.push({
      type: command.type.toString(),
      typeName: commandTypeNames[command.type] ?? "UNKNOWN",
      coords,
    });
  });

  // console.log(
  //   `Path analysis result: isClosed=${isClosed}, commands count=${commands.length}`
  // );

  const bounds = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  // Calculate center point for closed paths
  const center = isClosed
    ? {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2,
      }
    : undefined;

  return {
    isClosed,
    bounds,
    center,
    commands: svgCommands,
  };
}

/**
 * Parses an SVG string and extracts path data and dimensions
 * @param svgText - The SVG content as a string
 * @param minimal - If true, excludes the SVG path string from results (for rendering only). If false (default), includes full path data.
 */
export function parseSVG(svgText: string, minimal: boolean = false): ParsedSVG {
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
    const stroke = pathElement.getAttribute("stroke") ?? undefined;
    const strokeWidth = parseFloat(
      pathElement.getAttribute("stroke-width") ?? "1"
    );
    if (d) {
      const { isClosed, bounds, center, commands } = analyzePathData(d);
      paths.push({
        ...(minimal ? {} : { path: d }),
        ...(minimal ? {} : { stroke, strokeWidth }),
        isClosed,
        bounds,
        center,
        commands,
      });
    }
  });

  // Get rect elements and convert them to paths
  svgDoc.querySelectorAll("rect").forEach((rectElement) => {
    const x = parseFloat(rectElement.getAttribute("x") ?? "0");
    const y = parseFloat(rectElement.getAttribute("y") ?? "0");
    const width = parseFloat(rectElement.getAttribute("width") ?? "0");
    const height = parseFloat(rectElement.getAttribute("height") ?? "0");
    const transform = rectElement.getAttribute("transform");
    const stroke = rectElement.getAttribute("stroke") ?? undefined;
    const strokeWidth = parseFloat(
      rectElement.getAttribute("stroke-width") ?? "1"
    );

    // Convert rect to path
    const rectPath = convertRectToPath(x, y, width, height, transform);
    const { isClosed, bounds, center, commands } = analyzePathData(rectPath);
    paths.push({
      ...(minimal ? {} : { path: rectPath }),
      ...(minimal ? {} : { stroke, strokeWidth }),
      isClosed,
      bounds,
      center,
      commands,
    });
  });

  // Group paths by closed/open status
  if (minimal) {
    return { paths, dimensions };
  }

  const pathGroups: PathGroup = {
    closedPaths: paths.filter((p) => p.isClosed),
    openPaths: paths.filter((p) => !p.isClosed),
  };

  return { paths, pathGroups, dimensions };
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
 * @param url - The URL of the SVG file
 * @param minimal - If true, excludes the SVG path string from results (for rendering only). If false (default), includes full path data.
 */
export async function fetchAndParseSVG(
  url: string,
  minimal: boolean = false
): Promise<ParsedSVG> {
  const response = await fetch(url);
  const text = await response.text();
  return parseSVG(text, minimal);
}
