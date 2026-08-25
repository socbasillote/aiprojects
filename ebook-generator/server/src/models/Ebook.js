import mongoose from "mongoose";

const ebookSpecificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    targetAudience: {
      type: String,
      default: "",
      trim: true,
    },

    objective: {
      type: String,
      default: "",
      trim: true,
    },

    tone: {
      type: String,
      default: "",
      trim: true,
    },

    writingStyle: {
      type: String,
      default: "",
      trim: true,
    },

    difficultyLevel: {
      type: String,
      default: "",
      trim: true,
    },

    language: {
      type: String,
      default: "",
      trim: true,
    },

    estimatedWordCount: {
      type: Number,
      default: 0,
    },

    estimatedPageCount: {
      type: Number,
      default: 0,
    },

    chapterCount: {
      type: Number,
      default: 0,
    },

    themes: {
      type: [String],
      default: [],
    },

    requiredTopics: {
      type: [String],
      default: [],
    },

    excludedTopics: {
      type: [String],
      default: [],
    },

    structuralRequirements: {
      type: [String],
      default: [],
    },

    formattingRequirements: {
      type: [String],
      default: [],
    },

    imageRequirements: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const ebookSettingsSchema = new mongoose.Schema(
  {
    targetAudience: {
      type: String,
      default: "",
      trim: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    tone: {
      type: String,
      default: "",
      trim: true,
    },

    ebookLength: {
      type: String,
      default: "",
      trim: true,
    },

    chapterCount: {
      type: Number,
      default: 0,
    },

    writingStyle: {
      type: String,
      default: "",
      trim: true,
    },

    contentType: {
      type: String,
      default: "",
      trim: true,
    },

    imageMode: {
      type: String,
      enum: ["none", "ai", "placeholders", "selected", "all"],
      default: "none",
    },

    imageStyle: {
      type: String,
      default: "editorial",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const ebookChapterSchema = new mongoose.Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "generating", "generated", "approved", "error"],
      default: "pending",
    },

    generationProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const ebookImageSchema = new mongoose.Schema(
  {
    imageNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    chapterNumber: {
      type: Number,
      default: null,
    },

    type: {
      type: String,
      enum: ["diagram", "illustration", "flowchart", "concept", "editorial"],
      default: "editorial",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    prompt: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "generating", "generated", "approved", "error"],
      default: "pending",
    },

    url: {
      type: String,
      default: "",
    },

    altText: {
      type: String,
      default: "",
      trim: true,
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| Ebook Cover
|--------------------------------------------------------------------------
|
| Keep the cover as a real Mongoose subdocument instead of Mixed.
| This prevents cover.status / cover.url from becoming stale or
| inconsistently persisted.
|
*/

const ebookCoverSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["generating", "generated", "approved", "error"],
      default: "generating",
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },

    prompt: {
      type: String,
      default: "",
    },

    altText: {
      type: String,
      default: "",
      trim: true,
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const ebookAssemblyImageSchema = new mongoose.Schema(
  {
    imageNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      default: "",
    },

    altText: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["diagram", "illustration", "flowchart", "concept", "editorial"],
      default: "editorial",
    },
  },
  {
    _id: false,
  },
);

const ebookAssemblyChapterSchema = new mongoose.Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    summary: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    images: {
      type: [ebookAssemblyImageSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const ebookAssemblySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "assembling", "ready_for_review", "approved", "error"],
      default: "pending",
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    authorName: {
      type: String,
      default: "",
      trim: true,
    },

    coverUrl: {
      type: String,
      default: "",
    },

    tableOfContents: {
      type: [
        {
          chapterNumber: {
            type: Number,
            required: true,
          },

          title: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },

    chapters: {
      type: [ebookAssemblyChapterSchema],
      default: [],
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    chapterCount: {
      type: Number,
      default: 0,
    },

    assembledAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const ebookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    originalPrompt: {
      type: String,
      required: true,
      trim: true,
    },

    authorName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    /*
    |--------------------------------------------------------------------------
    | Specification
    |--------------------------------------------------------------------------
    */

    specification: {
      type: ebookSpecificationSchema,
      default: null,
    },

    specificationApproved: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    */

    settings: {
      type: ebookSettingsSchema,
      default: () => ({}),
    },

    /*
    |--------------------------------------------------------------------------
    | Outline
    |--------------------------------------------------------------------------
    */

    outline: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Chapters
    |--------------------------------------------------------------------------
    */

    chapters: {
      type: [ebookChapterSchema],
      default: [],
    },

    chaptersApproved: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Images
    |--------------------------------------------------------------------------
    */

    images: {
      type: [ebookImageSchema],
      default: [],
    },

    imagesApproved: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Book Memory
    |--------------------------------------------------------------------------
    */

    bookMemory: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Cover
    |--------------------------------------------------------------------------
    */

    cover: {
      type: ebookCoverSchema,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Ebook Status
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "planning",
        "outline_ready",
        "generating",
        "ready_for_review",
        "ready_for_export",
        "completed",
        "exporting",
        "error",
      ],
      default: "draft",
    },

    /*
    |--------------------------------------------------------------------------
    | Design 
    |--------------------------------------------------------------------------
    */

    design: {
      category: {
        type: String,
        enum: ["custom", "non-fiction", "childrens-book"],
        default: "custom",
      },

      templateId: {
        type: String,
        default: "custom",
        trim: true,
      },

      templateName: {
        type: String,
        default: "",
        trim: true,
      },

      version: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Assembly 
    |--------------------------------------------------------------------------
    */

    assembly: {
      type: ebookAssemblySchema,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Generation Progress
    |--------------------------------------------------------------------------
    */

    generationProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    wordCount: {
      type: Number,
      default: 0,
    },

    chapterCount: {
      type: Number,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Export
    |--------------------------------------------------------------------------
    */
    export: {
      status: {
        type: String,
        enum: ["pending", "exporting", "ready", "error"],
        default: "pending",
      },

      pdf: {
        status: {
          type: String,
          enum: ["pending", "generating", "ready", "error"],
          default: "pending",
        },

        url: {
          type: String,
          default: "",
        },

        errorMessage: {
          type: String,
          default: "",
        },

        generatedAt: {
          type: Date,
          default: null,
        },
      },

      epub: {
        status: {
          type: String,
          enum: ["pending", "generating", "ready", "error"],
          default: "pending",
        },

        url: {
          type: String,
          default: "",
        },

        errorMessage: {
          type: String,
          default: "",
        },

        generatedAt: {
          type: Date,
          default: null,
        },
      },

      errorMessage: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

ebookSchema.index({
  userId: 1,
  updatedAt: -1,
});

const Ebook = mongoose.model("Ebook", ebookSchema);

export default Ebook;
