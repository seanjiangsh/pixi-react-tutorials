# SVG Command Type Mappings

This document describes the numeric type values used in the `SVGCommand` interface for representing SVG path commands.

## Command Type Constants

The numeric values correspond to the constants defined in the `svg-pathdata` library's `SVGPathData` class:

| Type Number | Command Name      | Description                                                  |
| ----------- | ----------------- | ------------------------------------------------------------ |
| `1`         | `CLOSE_PATH`      | Close the current path (Z/z command)                         |
| `2`         | `MOVE_TO`         | Move the pen to a new position without drawing (M/m command) |
| `4`         | `HORIZ_LINE_TO`   | Draw a horizontal line (H/h command)                         |
| `8`         | `VERT_LINE_TO`    | Draw a vertical line (V/v command)                           |
| `16`        | `LINE_TO`         | Draw a straight line to a point (L/l command)                |
| `32`        | `CURVE_TO`        | Draw a cubic Bézier curve (C/c command)                      |
| `64`        | `SMOOTH_CURVE_TO` | Draw a smooth cubic Bézier curve (S/s command)               |
| `128`       | `QUAD_TO`         | Draw a quadratic Bézier curve (Q/q command)                  |
| `256`       | `SMOOTH_QUAD_TO`  | Draw a smooth quadratic Bézier curve (T/t command)           |
| `512`       | `ARC`             | Draw an elliptical arc (A/a command)                         |

## Usage

When working with `SVGCommand` objects, compare the `type` field against the constants from the `svg-pathdata` library:

```typescript
import { SVGPathData as SVGPathDataParser } from "svg-pathdata";
import { SVGCommand } from "./svgParser";

function processCommand(cmd: SVGCommand) {
  switch (cmd.type) {
    case SVGPathDataParser.MOVE_TO:
      // Handle move command
      break;
    case SVGPathDataParser.LINE_TO:
      // Handle line command
      break;
    case SVGPathDataParser.CLOSE_PATH:
      // Handle close path command
      break;
    // ... other cases
  }
}
```

## Coordinate Properties by Command Type

Different command types have different coordinate properties in the `coords` object:

### CLOSE_PATH (1)

- No coordinates

### MOVE_TO (2) and LINE_TO (16)

- `x`: target x coordinate
- `y`: target y coordinate

### HORIZ_LINE_TO (4)

- `x`: target x coordinate

### VERT_LINE_TO (8)

- `y`: target y coordinate

### CURVE_TO (32)

- `x1`, `y1`: first control point
- `x2`, `y2`: second control point
- `x`, `y`: end point

### SMOOTH_CURVE_TO (64)

- `x2`, `y2`: second control point
- `x`, `y`: end point

### QUAD_TO (128)

- `x1`, `y1`: control point
- `x`, `y`: end point

### SMOOTH_QUAD_TO (256)

- `x`, `y`: end point

### ARC (512)

- `rX`: x-axis radius
- `rY`: y-axis radius
- `xRot`: x-axis rotation
- `lArcFlag`: large arc flag
- `sweepFlag`: sweep flag
- `x`, `y`: end point

## Notes

- All commands are converted to absolute coordinates by the parser
- The numeric values are powers of 2, allowing for potential bitwise operations
- When transforming coordinates, some commands may be converted to equivalent forms (e.g., `HORIZ_LINE_TO` → `LINE_TO`)
