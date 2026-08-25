export function selectActivePage(state) {
  const { pages, activePageId } = state.editor.present.document;

  return pages.find((page) => page.id === activePageId) ?? null;
}

export function selectSelectedElement(state) {
  const elementId = state.editor.present.selectedElementId;

  if (!elementId) {
    return null;
  }

  const page = selectActivePage(state);

  if (!page) {
    return null;
  }

  return page.elements.find((element) => element.id === elementId) ?? null;
}

export function selectActivePageElements(state) {
  const page = selectActivePage(state);

  return page?.elements ?? [];
}
