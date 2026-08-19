import { z } from "zod";

const imageSchema = z.object({
  imageNumber: z.coerce.number().int().positive(),

  chapterNumber: z
    .union([z.coerce.number().int().positive(), z.null()])
    .default(null),

  type: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .transform((value) => {
      const aliases = {
        chart: "diagram",
        diagram: "diagram",
        infographic: "diagram",

        illustration: "illustration",
        visual: "illustration",
        graphic: "illustration",

        flowchart: "flowchart",
        flow: "flowchart",

        concept: "concept",
        conceptual: "concept",

        editorial: "editorial",
        photo: "editorial",
        photograph: "editorial",
      };

      return aliases[value] || "editorial";
    }),

  title: z.string().min(1).max(300),

  description: z.string().min(1).max(2000),

  prompt: z.string().default(""),

  altText: z.string().default(""),
});

export default imageSchema;
