export const EBOOK_CATEGORIES = [
  {
    id: "custom",
    name: "Custom",
    description: "Start with your own ebook settings.",
    image: null,

    defaults: {
      targetAudience: "",
      language: "English",
      tone: "Practical",
      ebookLength: "15,000–25,000 words",
      chapterCount: 10,
      writingStyle: "Clear and practical",
    },
  },

  {
    id: "non-fiction",
    name: "Non-Fiction",
    description:
      "Informational, educational, practical, and knowledge-based books.",
    image: null,

    defaults: {
      targetAudience: "General readers",
      language: "English",
      tone: "Informative",
      ebookLength: "15,000–25,000 words",
      chapterCount: 8,
      writingStyle: "Clear and practical",
    },
  },

  {
    id: "childrens-book",
    name: "Children's Book",
    description:
      "Simple, engaging, and age-appropriate books designed for children.",
    image: null,

    defaults: {
      targetAudience: "Children",
      language: "English",
      tone: "Friendly and playful",
      ebookLength: "5,000–10,000 words",
      chapterCount: 5,
      writingStyle: "Simple and engaging",
    },
  },
];

export const DEFAULT_EBOOK_CATEGORY = "custom";

export const getEbookCategory = (categoryId) => {
  return (
    EBOOK_CATEGORIES.find((category) => category.id === categoryId) ||
    EBOOK_CATEGORIES[0]
  );
};
