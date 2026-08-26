const fontCache = new Map();

export const FONT_FAMILIES = ["Roboto", "Inter", "Poppins", "Montserrat"];

export async function loadGoogleFont(fontFamily, weight = 400) {
  const cacheKey = `${fontFamily}-${weight}`;

  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey);
  }

  const promise = fetchGoogleFont(fontFamily, weight);

  fontCache.set(cacheKey, promise);

  return promise;
}

async function fetchGoogleFont(fontFamily, weight) {
  const family = encodeURIComponent(fontFamily);

  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;

  const response = await fetch(cssUrl, {
    headers: {
      /*
       * Google Fonts returns
       * different CSS depending
       * on the user agent.
       */
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Google Font: ${fontFamily}`);
  }

  const css = await response.text();

  const fontUrl = extractFontUrl(css);
  console.log("Google Font URL:", fontUrl);
  if (!fontUrl) {
    throw new Error(`Could not find font file for ${fontFamily}`);
  }

  const fontResponse = await fetch(fontUrl);

  if (!fontResponse.ok) {
    throw new Error(`Failed to download font file: ${fontFamily}`);
  }

  const buffer = await fontResponse.arrayBuffer();

  const base64 = arrayBufferToBase64(buffer);

  return {
    family: fontFamily,
    weight,
    base64,
    fileName: createFontFileName(fontFamily, weight),
  };
}

function extractFontUrl(css) {
  /*
   * Google Fonts CSS contains:
   *
   * src: url(https://...)
   */
  const match = css.match(/src:\s*url\(([^)]+)\)/);

  return match?.[1]?.replace(/['"]/g, "")?.trim();
}

function arrayBufferToBase64(buffer) {
  let binary = "";

  const bytes = new Uint8Array(buffer);

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function createFontFileName(family, weight) {
  const safeName = family.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

  return `${safeName}-${weight}.ttf`;
}
