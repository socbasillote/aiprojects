import mongoose from "mongoose";
import { Design } from "../models/Design.js";
import { Asset } from "../models/Asset.js";
import {
  createDesignSchema,
  updateDesignSchema,
} from "../schemas/designSchemas.js";
import { normalizeDesignDocument } from "../utils/normalizeDesign.js";

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function serialize(design) {
  return {
    id: design._id.toString(),
    name: design.name,
    width: design.width,
    height: design.height,
    document: design.document,
    thumbnail: design.thumbnail,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
  };
}

/**
 * Resolve image/SVG elements against the user's Asset records.
 *
 * assetId is the source of truth.
 * The URL stored in the Asset document becomes src.
 *
 * This prevents stale R2 URLs from being saved
 * into design documents.
 */
async function resolveAssetSources(document, userId) {
  const source = structuredClone(document);

  const assetIds = [];

  for (const element of Object.values(source.elements || {})) {
    if (!element || !["image", "svg"].includes(element.type)) {
      continue;
    }

    if (!element.assetId) {
      continue;
    }

    if (!validId(element.assetId)) {
      const error = new Error(`Invalid asset id: ${element.assetId}`);

      error.statusCode = 400;

      throw error;
    }

    assetIds.push(String(element.assetId));
  }

  if (assetIds.length === 0) {
    return source;
  }

  const uniqueIds = [...new Set(assetIds)];

  const assets = await Asset.find({
    _id: {
      $in: uniqueIds,
    },

    userId,
  }).lean();

  const assetsById = new Map(
    assets.map((asset) => [asset._id.toString(), asset]),
  );

  for (const element of Object.values(source.elements || {})) {
    if (!element || !["image", "svg"].includes(element.type)) {
      continue;
    }

    if (!element.assetId) {
      continue;
    }

    const asset = assetsById.get(String(element.assetId));

    if (!asset) {
      const error = new Error(
        `Asset ${element.assetId} was not found or does not belong to the current user.`,
      );

      error.statusCode = 400;

      throw error;
    }

    /*
     * Asset.url is authoritative.
     *
     * Even if the frontend sends an old URL,
     * we replace it with the current URL from
     * the Asset record.
     */
    element.src = asset.url;

    element.mimeType = asset.mimeType;

    if (!element.name) {
      element.name = asset.name;
    }

    /*
     * Make sure the element type agrees
     * with the stored Asset type.
     */
    element.type = asset.type === "svg" ? "svg" : "image";
  }

  return source;
}

export async function listDesigns(req, res) {
  const designs = await Design.find({
    userId: req.user._id,
  }).sort({
    updatedAt: -1,
  });

  res.json({
    designs: designs.map(serialize),
  });
}

export async function createDesign(req, res) {
  let document = normalizeDesignDocument(req.body?.document);

  document = await resolveAssetSources(document, req.user._id);

  const input = createDesignSchema.parse({
    ...req.body,
    document,
  });

  const design = await Design.create({
    userId: req.user._id,

    name: input.name,

    width: input.document.canvas.width,

    height: input.document.canvas.height,

    document: input.document,

    thumbnail: input.thumbnail || null,
  });

  res.status(201).json({
    design: serialize(design),
  });
}

export async function getDesign(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid design id",
    });
  }

  const design = await Design.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!design) {
    return res.status(404).json({
      message: "Design not found",
    });
  }

  res.json({
    design: serialize(design),
  });
}

export async function updateDesign(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid design id",
    });
  }

  let document;

  if (req.body?.document !== undefined) {
    document = normalizeDesignDocument(req.body.document);

    document = await resolveAssetSources(document, req.user._id);
  }

  const input = updateDesignSchema.parse({
    ...req.body,

    ...(document !== undefined ? { document } : {}),
  });

  const update = {};

  if (input.name !== undefined) {
    update.name = input.name;
  }

  if (input.document !== undefined) {
    update.document = input.document;

    update.width = input.document.canvas.width;

    update.height = input.document.canvas.height;
  }

  if (input.thumbnail !== undefined) {
    update.thumbnail = input.thumbnail;
  }

  const design = await Design.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },

    update,

    {
      new: true,
      runValidators: true,
    },
  );

  if (!design) {
    return res.status(404).json({
      message: "Design not found",
    });
  }

  res.json({
    design: serialize(design),
  });
}

export async function deleteDesign(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid design id",
    });
  }

  const result = await Design.deleteOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!result.deletedCount) {
    return res.status(404).json({
      message: "Design not found",
    });
  }

  res.status(204).end();
}
