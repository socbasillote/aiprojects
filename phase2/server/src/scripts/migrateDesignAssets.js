import "dotenv/config";
import mongoose from "mongoose";

import { connectDatabase } from "../config/database.js";
import { Design } from "../models/Design.js";
import { Asset } from "../models/Asset.js";

function normalizeUrl(value) {
  if (typeof value !== "string") return null;

  return value.trim().replace(/\/+$/, "");
}

function getPathFromUrl(value) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
}

function getPossibleKeys(src) {
  const values = new Set();

  if (typeof src !== "string") {
    return [];
  }

  const normalized = normalizeUrl(src);

  if (normalized) {
    values.add(normalized);
  }

  const path = getPathFromUrl(src);

  if (path) {
    values.add(path);
  }

  if (path?.startsWith("uploads/")) {
    values.add(path.slice("uploads/".length));
  }

  if (path?.startsWith("users/")) {
    values.add(path);
  }

  return [...values];
}

function assetMatchesSource(asset, src) {
  if (!src) return false;

  const sourceValues = new Set(getPossibleKeys(src));

  const assetUrl = normalizeUrl(asset.url);

  if (assetUrl && sourceValues.has(assetUrl)) {
    return true;
  }

  const assetUrlPath = getPathFromUrl(asset.url);

  if (assetUrlPath && sourceValues.has(assetUrlPath)) {
    return true;
  }

  const storageKey = normalizeUrl(asset.storageKey);

  if (storageKey && sourceValues.has(storageKey)) {
    return true;
  }

  return false;
}

async function migrate() {
  await connectDatabase();

  console.log("Starting design asset migration...");

  const designs = await Design.find({}).lean();

  let designsScanned = 0;
  let designsChanged = 0;

  let elementsScanned = 0;
  let elementsMatched = 0;
  let elementsAlreadyLinked = 0;
  let elementsUnmatched = 0;
  let elementsAmbiguous = 0;

  for (const design of designs) {
    designsScanned += 1;

    const document = structuredClone(design.document);

    let changed = false;

    const elements = document?.elements || {};

    /*
     * Only query assets for this design's owner.
     *
     * This prevents accidentally linking an asset
     * belonging to another user.
     */
    const assets = await Asset.find({
      userId: design.userId,
    }).lean();

    for (const element of Object.values(elements)) {
      if (!element || !["image", "svg"].includes(element.type)) {
        continue;
      }

      elementsScanned += 1;

      /*
       * Already migrated.
       *
       * We still refresh src from the Asset record.
       */
      if (element.assetId) {
        const asset = assets.find(
          (item) => item._id.toString() === String(element.assetId),
        );

        if (asset) {
          elementsAlreadyLinked += 1;

          if (element.src !== asset.url) {
            element.src = asset.url;

            changed = true;
          }
        }

        continue;
      }

      const matches = assets.filter((asset) =>
        assetMatchesSource(asset, element.src),
      );

      if (matches.length === 1) {
        const asset = matches[0];

        element.assetId = asset._id.toString();

        element.src = asset.url;

        if (!element.mimeType) {
          element.mimeType = asset.mimeType;
        }

        if (!element.name) {
          element.name = asset.name;
        }

        elementsMatched += 1;
        changed = true;

        console.log(
          `[MATCHED] design=${design._id} element=${element.id} asset=${asset._id}`,
        );
      } else if (matches.length > 1) {
        elementsAmbiguous += 1;

        console.warn(
          `[AMBIGUOUS] design=${design._id} element=${element.id} src=${element.src}`,
        );
      } else {
        elementsUnmatched += 1;

        console.warn(
          `[UNMATCHED] design=${design._id} element=${element.id} src=${element.src}`,
        );
      }
    }

    if (changed) {
      await Design.updateOne(
        {
          _id: design._id,
        },
        {
          $set: {
            document,
          },
        },
      );

      designsChanged += 1;
    }
  }

  console.log("");
  console.log("Migration complete.");
  console.log("");
  console.log(`Designs scanned:       ${designsScanned}`);
  console.log(`Designs changed:       ${designsChanged}`);
  console.log(`Elements scanned:      ${elementsScanned}`);
  console.log(`Already linked:        ${elementsAlreadyLinked}`);
  console.log(`Newly matched:         ${elementsMatched}`);
  console.log(`Unmatched:             ${elementsUnmatched}`);
  console.log(`Ambiguous:             ${elementsAmbiguous}`);
}

try {
  await migrate();
} catch (error) {
  console.error("Design asset migration failed:", error);

  process.exitCode = 1;
} finally {
  await mongoose.connection.close();
}
