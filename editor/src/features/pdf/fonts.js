import robotoRegular from "../../assets/fonts/Roboto-Regular.ttf";
import robotoBold from "../../assets/fonts/Roboto-Bold.ttf";

import interRegular from "../../assets/fonts/Inter_28pt-Regular.ttf";
import interBold from "../../assets/fonts/Inter_28pt-Bold.ttf";

import openSansRegular from "../../assets/fonts/OpenSans-Regular.ttf";
import openSansBold from "../../assets/fonts/OpenSans-Bold.ttf";

import montserratRegular from "../../assets/fonts/Montserrat-Regular.ttf";
import montserratBold from "../../assets/fonts/Montserrat-Bold.ttf";

export const PDF_FONTS = {
  Roboto: {
    400: {
      file: robotoRegular,
      style: "normal",
    },

    700: {
      file: robotoBold,
      style: "bold",
    },
  },
  Inter: {
    400: {
      file: interRegular,
      style: "normal",
    },
    700: {
      file: interBold,
      style: "bold",
    },
  },

  "Open Sans": {
    400: {
      file: openSansRegular,
      style: "normal",
    },
    700: {
      file: openSansBold,
      style: "bold",
    },
  },

  Montserrat: {
    400: {
      file: montserratRegular,
      style: "normal",
    },
    700: {
      file: montserratBold,
      style: "bold",
    },
  },
};

export const FONT_FAMILIES = Object.keys(PDF_FONTS);
