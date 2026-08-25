export const FIT_VIEWPORT_EVENT = "editor:fit-viewport";

export function requestFitViewport() {
  window.dispatchEvent(new Event(FIT_VIEWPORT_EVENT));
}
