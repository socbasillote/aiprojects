import ChildrensCover from "./ChildrensCover.jsx";
import ChildrensTitlePage from "./ChildrensTitlePage.jsx";
import ChildrensStorySpread from "./ChildrensStorySpread.jsx";
import ChildrensEnding from "./ChildrensEnding.jsx";
import ChildrensBackCover from "./ChildrensBackCover.jsx";

const ChildrensPreview = ({ page, template }) => {
  if (!page) {
    return null;
  }

  switch (page.type) {
    case "cover":
      return <ChildrensCover template={template} />;

    case "title-page":
      return <ChildrensTitlePage template={template} />;

    case "story-spread":
      return (
        <ChildrensStorySpread
          template={template}
          spreadNumber={page.spreadNumber}
        />
      );

    case "ending":
      return <ChildrensEnding template={template} />;

    case "back-cover":
      return <ChildrensBackCover template={template} />;

    default:
      return null;
  }
};

export default ChildrensPreview;
