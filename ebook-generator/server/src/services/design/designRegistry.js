import storybookDesign from "./childrens/storybook.design.js";

const DESIGN_REGISTRY = {
  storybook: storybookDesign,

  "playful-illustrated": {
    id: "playful-illustrated",
    name: "Playful Illustrated",
    category: "childrens-book",
    version: 1,
  },

  classroom: {
    id: "classroom",
    name: "Classroom",
    category: "childrens-book",
    version: 1,
  },

  nonfiction: {
    id: "nonfiction",
    name: "Non-Fiction",
    category: "non-fiction",
    version: 1,
  },

  custom: {
    id: "custom",
    name: "Custom",
    category: "custom",
    version: 1,
  },
};

const getDesign = (templateId) => {
  return DESIGN_REGISTRY[templateId] || DESIGN_REGISTRY.custom;
};

const isChildrenDesign = (templateId) => {
  return getDesign(templateId).category === "childrens-book";
};

export { DESIGN_REGISTRY, getDesign, isChildrenDesign };

export default DESIGN_REGISTRY;
