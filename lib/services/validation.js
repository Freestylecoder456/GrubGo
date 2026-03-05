import { z } from "zod";

// 1. Reusable password requirements
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain one uppercase letter")
  .regex(/[a-z]/, "Must contain one lowercase letter")
  .regex(/[0-9]/, "Must contain one number")
  .regex(/[^A-Za-z0-9]/, "Must contain one special character");

// 2. Sign In Schema
export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 3. Sign Up Schema
export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be 3+ characters")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().trim().email("Invalid email address"),
  password: passwordValidation,
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// 4. Export Types (Crucial if using TypeScript)
// export type SignInInput = z.infer<typeof signInSchema>;
// export type SignUpInput = z.infer<typeof signUpSchema>;
