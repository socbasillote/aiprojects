import NonfictionCover from "./NonfictionCover.jsx";
import NonfictionContents from "./NonfictionContents.jsx";
import NonfictionChapter from "./NonfictionChapter.jsx";
import NonfictionClosing from "./NonfictionClosing.jsx";

const NonfictionPreview = ({ page, template }) => {
  switch (page.type) {
    case "cover":
      return <NonfictionCover template={template} />;

    case "toc":
      return <NonfictionContents template={template} />;

    case "chapter-opening":
      return <NonfictionChapter template={template} mode="opening" />;

    case "chapter-content":
      return <NonfictionChapter template={template} mode="content" />;

    case "closing":
      return <NonfictionClosing template={template} />;

    default:
      return null;
  }
};

export default NonfictionPreview;
