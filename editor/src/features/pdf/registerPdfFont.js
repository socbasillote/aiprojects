import { PDF_FONTS } from "./fonts";
import { loadFontFile } from "./fontLoader";

const registeredFonts = new WeakMap();

export async function registerPdfFont(pdf, fontFamily, weight = 400) {
  const family = PDF_FONTS[fontFamily];

  if (!family) {
    console.warn(`PDF font family not found: ${fontFamily}`);

    return false;
  }

  const resolvedWeight = resolveClosestWeight(family, weight);

  const font = family[resolvedWeight];

  if (!font) {
    console.warn(`PDF font weight not found: ${fontFamily} ${weight}`);

    return false;
  }

  let pdfFonts = registeredFonts.get(pdf);

  if (!pdfFonts) {
    pdfFonts = new Set();

    registeredFonts.set(pdf, pdfFonts);
  }

  const key = `${fontFamily}-${weight}`;

  if (pdfFonts.has(key)) {
    return true;
  }

  const binary = await loadFontFile(font.file);

  const fileName = `${fontFamily}-${weight}.ttf`;

  pdf.addFileToVFS(fileName, binary);

  const pdfFontName = `${fontFamily}-${resolvedWeight}`;

  pdf.addFont(fileName, pdfFontName, "normal");

  pdfFonts.add(key);

  return true;
}

function resolveClosestWeight(family, requestedWeight) {
  const availableWeights = Object.keys(family)
    .map(Number)
    .filter(Number.isFinite);

  if (availableWeights.length === 0) {
    return null;
  }

  if (family[requestedWeight]) {
    return requestedWeight;
  }

  return availableWeights.reduce((closest, current) => {
    const currentDistance = Math.abs(current - requestedWeight);

    const closestDistance = Math.abs(closest - requestedWeight);

    return currentDistance < closestDistance ? current : closest;
  });
}
