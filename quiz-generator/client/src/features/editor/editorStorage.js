const STORAGE_KEY = "assessment-editor";
const STORAGE_VERSION = 1;

function createStorageDocument(data) {
  return {
    version: STORAGE_VERSION,
    data: {
      title: data.title ?? "",
      questions: Array.isArray(data.questions) ? data.questions : [],
      sections: Array.isArray(data.sections) ? data.sections : [],
      paper: data.paper ?? {},
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

export function saveEditorState(data) {
  try {
    const document = createStorageDocument(data);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  } catch (error) {
    console.error("Failed to save assessment locally:", error);
  }
}

export function loadEditorState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

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
  localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY, STORAGE_VERSION };
