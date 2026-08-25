import CustomCover from "./CustomCover.jsx";
import CustomContents from "./CustomContents.jsx";
import CustomChapter from "./CustomChapter.jsx";
import CustomClosing from "./CustomClosing.jsx";

const CustomPreview = ({ page, template }) => {
  switch (page.type) {
    case "cover":
      return <CustomCover template={template} />;

    case "toc":
      return <CustomContents template={template} />;

    case "chapter-opening":
      return <CustomChapter template={template} mode="opening" />;

    case "chapter-content":
      return <CustomChapter template={template} mode="content" />;

    case "closing":
      return <CustomClosing template={template} />;

    default:
      return null;
  }
};

export default CustomPreview;
