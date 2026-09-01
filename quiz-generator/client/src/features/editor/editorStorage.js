import { createInitialEditorState } from "./editorSlice";

const STORAGE_KEY = "assessments";
const LEGACY_STORAGE_KEY = "assessment-editor";
const STORAGE_VERSION = 1;
const DEFAULT_PAPER = {
  pageSize: "A4",
  orientation: "portrait",
  columns: 1,

  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },

  header: {
    enabled: true,
    text: "",
  },

  studentInfo: {
    enabled: true,
  },

  instructions: "",

  footer: {
    enabled: true,
    text: "",
  },
};
/*
 * --------------------------------------------------
 * Helpers
 * --------------------------------------------------
 */

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createStorageDocument(data = {}) {
  return {
    version: STORAGE_VERSION,

    data: {
      title: data.title ?? "",

      questions: Array.isArray(data.questions) ? data.questions : [],

      sections: Array.isArray(data.sections) ? data.sections : [],

      paper: {
        ...DEFAULT_PAPER,
        ...(data.paper ?? {}),

        margins: {
          ...DEFAULT_PAPER.margins,
          ...(data.paper?.margins ?? {}),
        },

        header: {
          ...DEFAULT_PAPER.header,
          ...(data.paper?.header ?? {}),
        },

        studentInfo: {
          ...DEFAULT_PAPER.studentInfo,
          ...(data.paper?.studentInfo ?? {}),
        },

        footer: {
          ...DEFAULT_PAPER.footer,
          ...(data.paper?.footer ?? {}),
        },
      },
    },
  };
}

function isValidStorageDocument(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (value.version !== STORAGE_VERSION) {
    return false;
  }

  if (!value.data || typeof value.data !== "object") {
    return false;
  }

  if (!Array.isArray(value.data.questions)) {
    return false;
  }

  if (!Array.isArray(value.data.sections)) {
    return false;
  }

  if (!value.data.paper || typeof value.data.paper !== "object") {
    return false;
  }

  return true;
}

function readAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error("Failed to read local assessments:", error);

    return {};
  }
}

function writeAssessments(assessments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));

    return true;
  } catch (error) {
    console.error("Failed to write local assessments:", error);

    return false;
  }
}

/*
 * --------------------------------------------------
 * Create
 * --------------------------------------------------
 */

export function createAssessment(data = {}) {
  const id = createId();

  const now = new Date().toISOString();

  const initialState = createInitialEditorState();

  const document = createStorageDocument({
    ...initialState,

    ...data,

    paper: {
      ...initialState.paper,
      ...(data.paper ?? {}),

      margins: {
        ...initialState.paper.margins,
        ...(data.paper?.margins ?? {}),
      },

      header: {
        ...initialState.paper.header,
        ...(data.paper?.header ?? {}),
      },

      studentInfo: {
        ...initialState.paper.studentInfo,
        ...(data.paper?.studentInfo ?? {}),
      },

      footer: {
        ...initialState.paper.footer,
        ...(data.paper?.footer ?? {}),
      },
    },
  });

  const assessment = {
    id,
    createdAt: now,
    updatedAt: now,
    ...document,
  };

  const assessments = readAssessments();

  assessments[id] = assessment;

  writeAssessments(assessments);

  return assessment;
}

/*
 * --------------------------------------------------
 * Save
 * --------------------------------------------------
 */

export function saveAssessment(id, data) {
  if (!id) {
    throw new Error("Assessment ID is required.");
  }

  const assessments = readAssessments();

  const existing = assessments[id];

  const now = new Date().toISOString();

  const document = createStorageDocument(data);

  const assessment = {
    id,

    createdAt: existing?.createdAt ?? now,

    updatedAt: now,

    ...document,
  };

  assessments[id] = assessment;

  writeAssessments(assessments);

  return assessment;
}

/*
 * --------------------------------------------------
 * Load
 * --------------------------------------------------
 */

export function loadAssessment(id) {
  if (!id) {
    return null;
  }

  const assessments = readAssessments();

  const assessment = assessments[id];

  if (!assessment) {
    return null;
  }

  if (!isValidStorageDocument(assessment)) {
    console.warn("Saved assessment data is invalid.");

    return null;
  }

  return assessment;
}

/*
 * --------------------------------------------------
 * List
 * --------------------------------------------------
 */

export function listAssessments() {
  const assessments = readAssessments();

  return Object.values(assessments)
    .filter(isValidStorageDocument)
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

/*
 * --------------------------------------------------
 * Delete
 * --------------------------------------------------
 */

export function deleteAssessment(id) {
  if (!id) {
    return;
  }

  const assessments = readAssessments();

  delete assessments[id];

  writeAssessments(assessments);
}

/*
 * --------------------------------------------------
 * Legacy support
 * --------------------------------------------------
 *
 * These two functions keep the current editor
 * persistence API working temporarily.
 *
 * We'll remove them after the Editor has been
 * switched to assessment IDs.
 */

export function saveEditorState(data) {
  try {
    const document = createStorageDocument(data);

    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(document));
  } catch (error) {
    console.error("Failed to save assessment locally:", error);
  }
}

export function loadEditorState() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!isValidStorageDocument(parsed)) {
      console.warn("Saved assessment data is invalid.");

      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to load assessment locally:", error);

    return null;
  }
}

export function clearEditorState() {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export { STORAGE_KEY, STORAGE_VERSION };
