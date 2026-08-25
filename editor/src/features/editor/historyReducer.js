const UNDO_ACTION = "editor/undo";
const REDO_ACTION = "editor/redo";

const COMMIT_MOVE_ACTION = "editor/commitMoveElement";

const COMMIT_RESIZE_ACTION = "editor/commitResizeElement";

const NON_HISTORY_ACTIONS = new Set([
  "editor/selectElement",
  "editor/clearSelection",
  "editor/selectPage",

  "editor/previewMoveElement",
  "editor/previewResizeElement",

  "editor/setZoom",
  "editor/setPan",
  "editor/resetViewport",
  "editor/setViewport",
]);

export function createHistoryReducer(reducer) {
  return function historyReducer(state, action) {
    if (!state) {
      return {
        past: [],

        present: reducer(undefined, {
          type: "@@INIT",
        }),

        future: [],
      };
    }

    /*
     * Undo
     */
    if (action.type === UNDO_ACTION) {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];

      return {
        past: state.past.slice(0, -1),

        present: previous,

        future: [state.present, ...state.future],
      };
    }

    /*
     * Redo
     */
    if (action.type === REDO_ACTION) {
      if (state.future.length === 0) {
        return state;
      }

      const next = state.future[0];

      return {
        past: [...state.past, state.present],

        present: next,

        future: state.future.slice(1),
      };
    }

    /*
     * Drag commit
     *
     * The preview actions have already
     * modified `present`.
     *
     * We only add the state from before
     * the drag to history.
     */
    if (action.type === COMMIT_MOVE_ACTION) {
      return commitHistory(state, action.payload?.before);
    }

    /*
     * Resize commit
     */
    if (action.type === COMMIT_RESIZE_ACTION) {
      return commitHistory(state, action.payload?.before);
    }

    /*
     * Preview / selection actions
     *
     * These update the current state but
     * do NOT create history entries.
     */
    if (NON_HISTORY_ACTIONS.has(action.type)) {
      const nextPresent = reducer(state.present, action);

      if (nextPresent === state.present) {
        return state;
      }

      return {
        ...state,

        present: nextPresent,
      };
    }

    /*
     * Normal document mutation
     *
     * Every normal editor command becomes
     * one history entry.
     */
    const nextPresent = reducer(state.present, action);

    if (nextPresent === state.present) {
      return state;
    }

    return {
      past: [...state.past, state.present],

      present: nextPresent,

      future: [],
    };
  };
}

function commitHistory(state, before) {
  if (!before) {
    return state;
  }

  /*
   * Nothing actually changed.
   *
   * This prevents a click/drag that didn't
   * move anything from creating an undo entry.
   */
  if (areStatesEqual(before, state.present)) {
    return state;
  }

  return {
    past: [...state.past, before],

    present: state.present,

    future: [],
  };
}

function areStatesEqual(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}
