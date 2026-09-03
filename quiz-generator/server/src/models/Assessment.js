import mongoose from "mongoose";

const questionOptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "multiple_choice",
        "true_false",
        "short_answer",
        "essay",
        "fill_in_the_blank",
      ],
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    options: {
      type: [questionOptionSchema],
      default: [],
    },

    answer: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },

    points: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "New Section",
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
    },

    questionIds: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    paper: {
      pageSize: {
        type: String,
        default: "A4",
      },

      orientation: {
        type: String,
        enum: ["portrait", "landscape"],
        default: "portrait",
      },

      columns: {
        type: Number,
        min: 1,
        max: 4,
        default: 1,
      },

      margins: {
        top: {
          type: Number,
          default: 20,
        },

        right: {
          type: Number,
          default: 20,
        },

        bottom: {
          type: Number,
          default: 20,
        },

        left: {
          type: Number,
          default: 20,
        },
      },

      header: {
        enabled: {
          type: Boolean,
          default: true,
        },

        schoolName: {
          type: String,
          default: "",
        },

        subject: {
          type: String,
          default: "",
        },

        teacher: {
          type: String,
          default: "",
        },

        date: {
          type: String,
          default: "",
        },

        duration: {
          type: String,
          default: "",
        },
      },

      studentInfo: {
        enabled: {
          type: Boolean,
          default: true,
        },

        name: {
          type: Boolean,
          default: true,
        },

        gradeSection: {
          type: Boolean,
          default: true,
        },

        date: {
          type: Boolean,
          default: true,
        },

        score: {
          type: Boolean,
          default: true,
        },
      },

      instructions: {
        type: String,
        default: "",
      },

      footer: {
        enabled: {
          type: Boolean,
          default: true,
        },

        text: {
          type: String,
          default: "",
        },

        showPageNumber: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
