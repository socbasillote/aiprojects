import { z } from "zod";

const reorderOutlineSchema = z.object({
  chapterOrder: z.array(z.number().int().positive()).min(1),
});

export default reorderOutlineSchema;
