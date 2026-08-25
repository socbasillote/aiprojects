import CustomPreview from "./templates/custom/CustomPreview.jsx";
import NonfictionPreview from "./templates/nonfiction/NonfictionPreview.jsx";

import StorybookPreview from "./templates/childrens/StorybookPreview.jsx";
import PlayfulIllustratedPreview from "./templates/childrens/PlayfulIllustratedPreview.jsx";
import ClassroomPreview from "./templates/childrens/ClassroomPreview.jsx";

const normalizeTemplateValue = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const getTemplateId = (template) => {
  return normalizeTemplateValue(
    template?.id || template?.templateId || template?.slug || template?.name,
  );
};

const PreviewPage = ({ page, template }) => {
  const templateId = getTemplateId(template);

  /*
   * Children's templates
   */

  if (templateId === "storybook" || templateId === "storybook-template") {
    return <StorybookPreview page={page} template={template} />;
  }

  if (
    templateId === "playful-illustrated" ||
    templateId === "playful-illustrated-template"
  ) {
    return <PlayfulIllustratedPreview page={page} template={template} />;
  }

  if (templateId === "classroom" || templateId === "classroom-template") {
    return <ClassroomPreview page={page} template={template} />;
  }

  /*
   * Non-fiction
   */

  const category = normalizeTemplateValue(
    template?.category || template?.contentType,
  );

  if (category === "non-fiction" || category === "nonfiction") {
    return <NonfictionPreview page={page} template={template} />;
  }

  /*
   * Default
   *
   * Custom templates fall through here.
   */

  return <CustomPreview page={page} template={template} />;
};

export default PreviewPage;
