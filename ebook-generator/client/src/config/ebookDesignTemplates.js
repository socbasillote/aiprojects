export const EBOOK_DESIGN_TEMPLATES = [
  {
    id: "custom-minimal",
    category: "custom",
    name: "Minimal",
    description: "A clean and flexible layout with strong typography.",
    coverLabel: "Minimal Cover",
    design: {
      typography: "modern",
      pageStyle: "minimal",
      imagePlacement: "balanced",
      headingStyle: "large",
      spacing: "generous",
    },
  },

  {
    id: "custom-modern",
    category: "custom",
    name: "Modern",
    description:
      "A contemporary layout with bold headings and visual structure.",
    coverLabel: "Modern Cover",
    design: {
      typography: "modern",
      pageStyle: "modern",
      imagePlacement: "balanced",
      headingStyle: "bold",
      spacing: "comfortable",
    },
  },

  {
    id: "clean-editorial",
    category: "non-fiction",
    name: "Clean Editorial",
    description:
      "Professional typography, generous whitespace, and balanced imagery.",
    coverLabel: "Clean Editorial",
    design: {
      typography: "editorial",
      pageStyle: "clean",
      imagePlacement: "balanced",
      headingStyle: "large",
      spacing: "generous",
    },
  },

  {
    id: "modern-guide",
    category: "non-fiction",
    name: "Modern Guide",
    description:
      "A practical layout designed for guides, educational books, and how-to content.",
    coverLabel: "Modern Guide",
    design: {
      typography: "modern",
      pageStyle: "guide",
      imagePlacement: "supporting",
      headingStyle: "bold",
      spacing: "comfortable",
    },
  },

  {
    id: "nonfiction-minimalist",
    category: "non-fiction",
    name: "Minimalist",
    description:
      "A restrained premium style focused on readability and simplicity.",
    coverLabel: "Minimalist",
    design: {
      typography: "minimal",
      pageStyle: "minimal",
      imagePlacement: "subtle",
      headingStyle: "medium",
      spacing: "generous",
    },
  },

  {
    id: "storybook",
    category: "childrens-book",
    name: "Storybook",
    description:
      "A warm storybook layout designed for illustrated children's books.",
    coverLabel: "Storybook",
    design: {
      typography: "storybook",
      pageStyle: "storybook",
      imagePlacement: "full",
      headingStyle: "playful",
      spacing: "comfortable",
    },
  },

  {
    id: "playful-illustrated",
    category: "childrens-book",
    name: "Playful Illustrated",
    description:
      "A colorful visual layout with large illustrations and friendly typography.",
    coverLabel: "Playful Illustrated",
    design: {
      typography: "playful",
      pageStyle: "illustrated",
      imagePlacement: "large",
      headingStyle: "playful",
      spacing: "comfortable",
    },
  },

  {
    id: "classroom",
    category: "childrens-book",
    name: "Classroom",
    description:
      "A structured educational layout for beginner learning materials.",
    coverLabel: "Classroom",
    design: {
      typography: "friendly",
      pageStyle: "educational",
      imagePlacement: "supporting",
      headingStyle: "bold",
      spacing: "comfortable",
    },
  },
];

export const getDesignTemplatesForCategory = (categoryId) => {
  return EBOOK_DESIGN_TEMPLATES.filter(
    (template) => template.category === categoryId,
  );
};

export const getDesignTemplate = (templateId) => {
  return EBOOK_DESIGN_TEMPLATES.find((template) => template.id === templateId);
};
