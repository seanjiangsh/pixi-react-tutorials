import { useEffect, useState } from "react";
import { useViewportSize, Size } from "./useViewport";

export default function useSceneSize() {
  const viewportSize = useViewportSize();
  const [sceneHeight, setSceneHeight] = useState(0);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const headerHeightRem = rootStyles.getPropertyValue("--header-height");
    const rootFontSize = parseFloat(rootStyles.fontSize);
    const headerHeightPx = parseFloat(headerHeightRem) * rootFontSize;

    setSceneHeight(viewportSize.height - headerHeightPx);
  }, [viewportSize]);

  const { width } = viewportSize;
  const height = sceneHeight;
  const size: Size = { width, height };

  return size;
}
