import { useMemo } from "react";
import { useViewportSize, Size } from "src/utils/useViewport";

export default function useSceneSize() {
  const viewportSize = useViewportSize();

  const sceneHeight = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const headerHeightRem = rootStyles.getPropertyValue("--header-height");
    const rootFontSize = parseFloat(rootStyles.fontSize);
    const headerHeightPx = parseFloat(headerHeightRem) * rootFontSize;

    return viewportSize.height - headerHeightPx;
  }, [viewportSize.height]);

  const { width } = viewportSize;
  const height = sceneHeight;
  const size: Size = { width, height };

  return size;
}
