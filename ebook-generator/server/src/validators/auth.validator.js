import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),

  lastName: z.string().trim().min(2).max(50),

  email: z.string().trim().email(),

  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email(),

  password: z.string().min(1),
});

export { registerSchema, loginSchema };
