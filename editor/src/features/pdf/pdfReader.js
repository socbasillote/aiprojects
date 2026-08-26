import jsPDF from "jspdf";

import { renderText, hexToRgb } from "./renderText";
import { registerPdfFont } from "./registerPdfFont";

import { PDF_FONTS } from "./fonts";

export async function renderDocumentToPdf(document) {
  const { width, height } = document.settings;

  const pdf = new jsPDF({
    orientation: height >= width ? "portrait" : "landscape",

    unit: "pt",

    format: [width, height],
  });

  await prepareFonts(pdf, document);
  console.log("REGISTERED PDF FONTS:", pdf.getFontList());

  for (let pageIndex = 0; pageIndex < document.pages.length; pageIndex++) {
    const page = document.pages[pageIndex];

    if (pageIndex > 0) {
      pdf.addPage([width, height]);
    }

    await renderPage({
      pdf,
      page,
      settings: document.settings,
    });
  }

  return pdf;
}

async function renderPage({ pdf, page, settings }) {
  renderBackground(pdf, settings);

  for (const element of page.elements) {
    await renderElement(pdf, element);
  }
}

function renderBackground(pdf, settings) {
  const color = hexToRgb(settings.background || "#ffffff");

  if (!color) {
    return;
  }

  pdf.setFillColor(...color);

  pdf.rect(0, 0, settings.width, settings.height, "F");
}

async function renderElement(pdf, element) {
  switch (element.type) {
    case "text":
      renderText(pdf, element);
      break;

    case "image":
      await renderImage(pdf, element);
      break;

    case "shape":
      renderShape(pdf, element);
      break;

    default:
      console.warn("Unknown PDF element:", element.type);
  }
}

function renderShape(pdf, element) {
  const { fill, borderColor, borderWidth = 0 } = element.style;

  const fillColor = hexToRgb(fill);

  const strokeColor = hexToRgb(borderColor);

  /*
   * Circle
   *
   * Rotation has no visual effect
   * on a circle.
   */
  if (element.shape === "circle") {
    if (fillColor) {
      pdf.setFillColor(...fillColor);
    }

    if (strokeColor) {
      pdf.setDrawColor(...strokeColor);
    }

    pdf.setLineWidth(borderWidth);

    const radius = Math.min(element.width, element.height) / 2;

    pdf.circle(
      element.x + element.width / 2,

      element.y + element.height / 2,

      radius,

      getShapeStyle(fill, borderWidth),
    );

    return;
  }

  /*
   * Rectangle.
   *
   * context2d allows us to rotate
   * around the element center.
   */
  renderRotatedRectangle(pdf, element, fillColor, strokeColor, borderWidth);
}

function renderRotatedRectangle(
  pdf,
  element,
  fillColor,
  strokeColor,
  borderWidth,
) {
  const ctx = pdf.context2d;

  const centerX = element.x + element.width / 2;

  const centerY = element.y + element.height / 2;

  const rotation = ((element.rotation || 0) * Math.PI) / 180;

  ctx.save();

  ctx.translate(centerX, centerY);

  ctx.rotate(rotation);

  if (fillColor) {
    ctx.fillStyle = rgbToCss(fillColor);
  }

  if (strokeColor) {
    ctx.strokeStyle = rgbToCss(strokeColor);
  }

  ctx.lineWidth = borderWidth;

  ctx.beginPath();

  ctx.rect(
    -element.width / 2,
    -element.height / 2,
    element.width,
    element.height,
  );

  if (fillColor) {
    ctx.fill();
  }

  if (borderWidth > 0) {
    ctx.stroke();
  }

  ctx.restore();
}

async function renderImage(pdf, element) {
  if (!element.src) {
    return;
  }

  const rotation = element.rotation || 0;

  if (rotation === 0) {
    const image = await loadImage(element.src);

    pdf.addImage(
      image,
      getImageFormat(element.src),
      element.x,
      element.y,
      element.width,
      element.height,
    );

    return;
  }

  const rotated = await createRotatedImageDataUrl(
    element.src,
    element.width,
    element.height,
    rotation,
  );

  /*
   * Keep the ORIGINAL element center.
   */
  const centerX = element.x + element.width / 2;

  const centerY = element.y + element.height / 2;

  /*
   * Place the rotated bounding box
   * around that same center.
   */
  const x = centerX - rotated.boundingWidth / 2;

  const y = centerY - rotated.boundingHeight / 2;

  pdf.addImage(
    rotated.dataUrl,
    "PNG",
    x,
    y,
    rotated.boundingWidth,
    rotated.boundingHeight,
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    image.src = src;
  });
}

function rgbToCss([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function getShapeStyle(fill, borderWidth) {
  const hasFill = fill && fill !== "transparent";

  const hasBorder = Number(borderWidth) > 0;

  if (hasFill && hasBorder) {
    return "FD";
  }

  if (hasFill) {
    return "F";
  }

  if (hasBorder) {
    return "D";
  }

  return "S";
}

export async function downloadDocumentAsPdf(
  document,
  filename = "document.pdf",
) {
  const pdf = await renderDocumentToPdf(document);

  pdf.save(filename);
}

async function createRotatedImageDataUrl(src, width, height, rotation) {
  const image = await loadImage(src);

  const scale = 3;

  const radians = (rotation * Math.PI) / 180;

  const absCos = Math.abs(Math.cos(radians));

  const absSin = Math.abs(Math.sin(radians));

  const boundingWidth = width * absCos + height * absSin;

  const boundingHeight = width * absSin + height * absCos;

  const canvas = document.createElement("canvas");

  canvas.width = Math.ceil(boundingWidth * scale);

  canvas.height = Math.ceil(boundingHeight * scale);

  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.rotate(radians);

  /*
   * IMPORTANT:
   *
   * The image itself retains its
   * original width/height ratio.
   */
  ctx.drawImage(
    image,
    (-width * scale) / 2,
    (-height * scale) / 2,
    width * scale,
    height * scale,
  );

  return {
    dataUrl: canvas.toDataURL("image/png", 1),

    boundingWidth,
    boundingHeight,
  };
}

function getImageFormat(src) {
  if (src.startsWith("data:image/png")) {
    return "PNG";
  }

  if (src.startsWith("data:image/webp")) {
    return "WEBP";
  }

  if (src.startsWith("data:image/jpeg")) {
    return "JPEG";
  }

  if (src.startsWith("data:image/jpg")) {
    return "JPEG";
  }

  return "JPEG";
}

async function prepareFonts(pdf, document) {
  const fonts = new Map();

  for (const page of document.pages) {
    for (const element of page.elements) {
      if (element.type !== "text") {
        continue;
      }

      const requestedFamily = element.style?.fontFamily;

      const family = resolvePdfFontFamily(requestedFamily);

      const weight = normalizeFontWeight(element.style?.fontWeight);

      const key = `${family}-${weight}`;

      if (!fonts.has(key)) {
        fonts.set(key, {
          family,
          weight,
        });
      }
    }
  }

  for (const { family, weight } of fonts.values()) {
    try {
      const registered = await registerPdfFont(pdf, family, weight);

      if (!registered) {
        console.warn(`PDF font not available: ${family} ${weight}`);
      }
    } catch (error) {
      console.warn(`Unable to load PDF font ${family} ${weight}`, error);
    }
  }
}

function resolvePdfFontFamily(fontFamily) {
  /*
   * Currently Roboto is our
   * only bundled PDF font.
   */
  if (PDF_FONTS[fontFamily]) {
    return fontFamily;
  }

  return "Roboto";
}

function normalizeFontWeight(weight) {
  if (weight === "bold") {
    return 700;
  }

  const numeric = Number(weight);

  return Number.isFinite(numeric) ? numeric : 400;
}
