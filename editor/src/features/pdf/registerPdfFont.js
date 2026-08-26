import { PDF_FONTS } from "./fonts";
import { loadFontFile } from "./fontLoader";

const registeredFonts = new WeakMap();

export async function registerPdfFont(pdf, fontFamily, weight = 400) {
  const family = PDF_FONTS[fontFamily];

  if (!family) {
    console.warn(`PDF font family not found: ${fontFamily}`);

    return false;
  }

  const font = family[weight] ?? family[400];

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

  pdf.addFont(fileName, fontFamily, font.style);

  pdfFonts.add(key);

  return true;
}
