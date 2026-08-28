export default function PaperFooter({ footer, pageNumber }) {
  if (!footer.enabled) {
    return null;
  }

  return (
    <footer className="border-t border-slate-300 pt-3 text-center text-xs text-slate-500">
      {footer.text}

      {footer.showPageNumber && <span className="ml-4">Page {pageNumber}</span>}
    </footer>
  );
}
