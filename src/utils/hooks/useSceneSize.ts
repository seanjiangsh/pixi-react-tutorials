import { useMemo } from "react";
import { useViewportSize, Size } from "src/utils/hooks/useViewport";

export default function useSceneSize() {
  const viewportSize = useViewportSize();

  const sceneHeight = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const headerHeightRem = rootStyles.getPropertyValue("--header-height");

    // If no header height is defined (e.g., in Storybook), use full viewport height
    if (!headerHeightRem) {
      return viewportSize.height;
    }

    const rootFontSize = parseFloat(rootStyles.fontSize);
    const headerHeightPx = parseFloat(headerHeightRem) * rootFontSize;

    return viewportSize.height - headerHeightPx;
  }, [viewportSize.height]);

  const { width } = viewportSize;
  const height = sceneHeight;
  const size: Size = { width, height };

  return size;
}
