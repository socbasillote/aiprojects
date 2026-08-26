export async function loadFontFile(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }

  const buffer = await response.arrayBuffer();

  return arrayBufferToBinary(buffer);
}

function arrayBufferToBinary(buffer) {
  let binary = "";

  const bytes = new Uint8Array(buffer);

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);

    binary += String.fromCharCode(...chunk);
  }

  return binary;
}
