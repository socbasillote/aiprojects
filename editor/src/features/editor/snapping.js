const DEFAULT_THRESHOLD = 6;

export function snapElementPosition({
  element,
  proposedX,
  proposedY,
  page,
  threshold = DEFAULT_THRESHOLD,
}) {
  let x = proposedX;
  let y = proposedY;

  const guides = [];

  const elementWidth = element.width;
  const elementHeight = element.height;

  const pageWidth = page.width;
  const pageHeight = page.height;

  /*
   * Element horizontal anchors.
   */
  const elementLeft = proposedX;

  const elementCenterX = proposedX + elementWidth / 2;

  const elementRight = proposedX + elementWidth;

  /*
   * Element vertical anchors.
   */
  const elementTop = proposedY;

  const elementCenterY = proposedY + elementHeight / 2;

  const elementBottom = proposedY + elementHeight;

  /*
   * Page horizontal guides.
   */
  const horizontalTargets = [
    {
      position: 0,
      type: "left",
    },

    {
      position: pageWidth / 2,
      type: "center",
    },

    {
      position: pageWidth,
      type: "right",
    },
  ];

  /*
   * Page vertical guides.
   */
  const verticalTargets = [
    {
      position: 0,
      type: "top",
    },

    {
      position: pageHeight / 2,
      type: "center",
    },

    {
      position: pageHeight,
      type: "bottom",
    },
  ];

  /*
   * Horizontal snapping.
   */
  for (const target of horizontalTargets) {
    const leftDistance = Math.abs(elementLeft - target.position);

    if (leftDistance <= threshold) {
      x = target.position;

      guides.push({
        type: "vertical",
        position: target.position,
      });

      break;
    }

    const centerDistance = Math.abs(elementCenterX - target.position);

    if (centerDistance <= threshold) {
      x = target.position - elementWidth / 2;

      guides.push({
        type: "vertical",
        position: target.position,
      });

      break;
    }

    const rightDistance = Math.abs(elementRight - target.position);

    if (rightDistance <= threshold) {
      x = target.position - elementWidth;

      guides.push({
        type: "vertical",
        position: target.position,
      });

      break;
    }
  }

  /*
   * Vertical snapping.
   */
  for (const target of verticalTargets) {
    const topDistance = Math.abs(elementTop - target.position);

    if (topDistance <= threshold) {
      y = target.position;

      guides.push({
        type: "horizontal",
        position: target.position,
      });

      break;
    }

    const centerDistance = Math.abs(elementCenterY - target.position);

    if (centerDistance <= threshold) {
      y = target.position - elementHeight / 2;

      guides.push({
        type: "horizontal",
        position: target.position,
      });

      break;
    }

    const bottomDistance = Math.abs(elementBottom - target.position);

    if (bottomDistance <= threshold) {
      y = target.position - elementHeight;

      guides.push({
        type: "horizontal",
        position: target.position,
      });

      break;
    }
  }

  return {
    x,
    y,
    guides,
  };
}
