const storybookDesign = {
  id: "storybook",

  name: "Storybook",

  category: "childrens-book",

  version: 1,

  /*
  |--------------------------------------------------------------------------
  | Page structure
  |--------------------------------------------------------------------------
  */

  pages: {
    tableOfContents: false,

    titlePage: true,

    chapterNumber: false,

    endingPage: true,

    backCover: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Page dimensions
  |--------------------------------------------------------------------------
  */

  page: {
    width: 612,
    height: 792,

    margin: 42,

    bleed: 0,
  },

  /*
  |--------------------------------------------------------------------------
  | Cover
  |--------------------------------------------------------------------------
  */

  cover: {
    imageFit: "cover",

    titlePosition: "bottom",

    titleAlign: "center",

    showSubtitle: true,

    showAuthor: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Typography
  |--------------------------------------------------------------------------
  */

  typography: {
    titleSize: 30,

    subtitleSize: 15,

    headingSize: 24,

    bodySize: 13,

    captionSize: 9,

    bodyLineGap: 6,

    bodyFont: "Helvetica",

    headingFont: "Helvetica-Bold",
  },

  /*
  |--------------------------------------------------------------------------
  | Story spread
  |--------------------------------------------------------------------------
  */

  storySpread: {
    imagePosition: "left",

    textPosition: "right",

    imageWidth: 0.55,

    textWidth: 0.45,

    imageFit: "contain",

    textAlign: "left",

    verticalAlign: "center",

    padding: 28,
  },

  /*
  |--------------------------------------------------------------------------
  | Images
  |--------------------------------------------------------------------------
  */

  images: {
    enabled: true,

    showCaptions: false,

    maxWidth: 0.92,

    maxHeight: 0.72,

    placement: "story-spread",
  },

  /*
  |--------------------------------------------------------------------------
  | Ending
  |--------------------------------------------------------------------------
  */

  ending: {
    text: "The End",

    alignment: "center",
  },
};

export default storybookDesign;
