const DEFAULT_THRESHOLD = 6;

export function snapElementPosition({
  element,
  proposedX,
  proposedY,
  page,
  otherElements = [],
  threshold = DEFAULT_THRESHOLD,
}) {
  const horizontalCandidates = [
    ...createPageHorizontalCandidates({
      element,
      proposedX,
      pageWidth: page.width,
    }),

    ...createElementHorizontalCandidates({
      element,
      proposedX,
      otherElements,
    }),
  ];

  const verticalCandidates = [
    ...createPageVerticalCandidates({
      element,
      proposedY,
      pageHeight: page.height,
    }),

    ...createElementVerticalCandidates({
      element,
      proposedY,
      otherElements,
    }),
  ];

  const horizontalSnap = findClosestCandidate(horizontalCandidates, threshold);

  const verticalSnap = findClosestCandidate(verticalCandidates, threshold);

  return {
    x: horizontalSnap?.value ?? proposedX,

    y: verticalSnap?.value ?? proposedY,

    guides: [
      ...(horizontalSnap
        ? [
            {
              type: "vertical",
              position: horizontalSnap.guide,
            },
          ]
        : []),

      ...(verticalSnap
        ? [
            {
              type: "horizontal",
              position: verticalSnap.guide,
            },
          ]
        : []),
    ],
  };
}

function createPageHorizontalCandidates({ element, proposedX, pageWidth }) {
  const width = element.width;

  const left = proposedX;

  const center = proposedX + width / 2;

  const right = proposedX + width;

  return [
    {
      distance: Math.abs(left),
      value: 0,
      guide: 0,
    },

    {
      distance: Math.abs(center - pageWidth / 2),

      value: pageWidth / 2 - width / 2,

      guide: pageWidth / 2,
    },

    {
      distance: Math.abs(right - pageWidth),

      value: pageWidth - width,

      guide: pageWidth,
    },
  ];
}

function createPageVerticalCandidates({ element, proposedY, pageHeight }) {
  const height = element.height;

  const top = proposedY;

  const center = proposedY + height / 2;

  const bottom = proposedY + height;

  return [
    {
      distance: Math.abs(top),
      value: 0,
      guide: 0,
    },

    {
      distance: Math.abs(center - pageHeight / 2),

      value: pageHeight / 2 - height / 2,

      guide: pageHeight / 2,
    },

    {
      distance: Math.abs(bottom - pageHeight),

      value: pageHeight - height,

      guide: pageHeight,
    },
  ];
}

function findClosestCandidate(candidates, threshold) {
  let closest = null;

  for (const candidate of candidates) {
    if (candidate.distance > threshold) {
      continue;
    }

    if (!closest || candidate.distance < closest.distance) {
      closest = candidate;
    }
  }

  return closest;
}

function createElementHorizontalCandidates({
  element,
  proposedX,
  otherElements,
}) {
  const width = element.width;

  const left = proposedX;

  const center = proposedX + width / 2;

  const right = proposedX + width;

  const candidates = [];

  for (const other of otherElements) {
    if (other.id === element.id) {
      continue;
    }

    const otherLeft = other.x;

    const otherCenter = other.x + other.width / 2;

    const otherRight = other.x + other.width;

    /*
     * Left ↔ Left
     */
    candidates.push({
      distance: Math.abs(left - otherLeft),

      value: otherLeft,

      guide: otherLeft,
    });

    /*
     * Center ↔ Center
     */
    candidates.push({
      distance: Math.abs(center - otherCenter),

      value: otherCenter - width / 2,

      guide: otherCenter,
    });

    /*
     * Right ↔ Right
     */
    candidates.push({
      distance: Math.abs(right - otherRight),

      value: otherRight - width,

      guide: otherRight,
    });

    /*
     * Left ↔ Right
     */
    candidates.push({
      distance: Math.abs(left - otherRight),

      value: otherRight,

      guide: otherRight,
    });

    /*
     * Right ↔ Left
     */
    candidates.push({
      distance: Math.abs(right - otherLeft),

      value: otherLeft - width,

      guide: otherLeft,
    });
  }

  return candidates;
}

function createElementVerticalCandidates({
  element,
  proposedY,
  otherElements,
}) {
  const height = element.height;

  const top = proposedY;

  const center = proposedY + height / 2;

  const bottom = proposedY + height;

  const candidates = [];

  for (const other of otherElements) {
    if (other.id === element.id) {
      continue;
    }

    const otherTop = other.y;

    const otherCenter = other.y + other.height / 2;

    const otherBottom = other.y + other.height;

    /*
     * Top ↔ Top
     */
    candidates.push({
      distance: Math.abs(top - otherTop),

      value: otherTop,

      guide: otherTop,
    });

    /*
     * Center ↔ Center
     */
    candidates.push({
      distance: Math.abs(center - otherCenter),

      value: otherCenter - height / 2,

      guide: otherCenter,
    });

    /*
     * Bottom ↔ Bottom
     */
    candidates.push({
      distance: Math.abs(bottom - otherBottom),

      value: otherBottom - height,

      guide: otherBottom,
    });

    /*
     * Top ↔ Bottom
     */
    candidates.push({
      distance: Math.abs(top - otherBottom),

      value: otherBottom,

      guide: otherBottom,
    });

    /*
     * Bottom ↔ Top
     */
    candidates.push({
      distance: Math.abs(bottom - otherTop),

      value: otherTop - height,

      guide: otherTop,
    });
  }

  return candidates;
}
