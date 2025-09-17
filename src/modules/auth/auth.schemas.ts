import { z } from "zod";

export const RegisterBodySchema = z.object({
  first_name: z.string().min(3),
  last_name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8),
});

export const RegisterFailedResponseSchema = z.object({
  error: z.string(),
});

export const RegisterResponseSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
});

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const LoginFailedResponseSchema = z.object({
  error: z.string(),
});

export const LoginResponseSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
});

export type RegsiterBodySchemaType = z.infer<typeof RegisterBodySchema>;
export type LoginBodySchemaType = z.infer<typeof RegisterBodySchema>;
