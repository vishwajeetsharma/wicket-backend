import { z } from "zod";

export const RefreshTokenResponseSchema = z.object({
  refresh: z.boolean(),
});

export const RefreshTokenFailedResponseSchema = z.object({
  error: z.string(),
});

export const LogoutResponseSchema = z.object({
  logout: z.boolean(),
});

export const InternalServerErrorResponseSchema = z.object({
  error: z.string(),
});

// export const CompleteUserDataSchema = z.object({
//   id: z.string(),
//   email: z.string().email(),
//   name: z.string().nullable(),
//   createdAt: z.string(),
//   updatedAt: z.string(),
//   profile: z.object({

//   })
