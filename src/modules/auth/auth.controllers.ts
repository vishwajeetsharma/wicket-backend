// auth.controllers.ts
import { RouteHandlerMethod } from "fastify";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { LoginBodySchemaType, RegsiterBodySchemaType } from "./auth.schemas";
import {
  createUser,
  findUserByEmail,
  getProfile,
  saveSession,
} from "./auth.service";
import { generateTokens } from "../../utils/tokens";

export const RegisterHandler: RouteHandlerMethod = async (request, reply) => {
  const { first_name, last_name, email, password } =
    request.body as RegsiterBodySchemaType;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return reply.status(400).send({ error: "Email already in use" });
  }

  const { hash, salt } = hashPassword(password);

  const { user, profile, dbEmail } = await createUser({
    first_name,
    last_name,
    email,
    hash,
    salt,
  });

  const { accessToken, refreshToken } = await generateTokens(
    user,
    profile,
    dbEmail
  );

  // Save session in DB
  await saveSession({
    userId: user.id,
    userAgent: request.headers["user-agent"] || "unknown",
    ip: request.ip,
    refreshToken,
  });

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
    domain: process.env.DOMAIN,
  };

  // Set HttpOnly cookie for refresh token
  reply.setCookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes
  });

  const sixMonthsInSeconds = 6 * 30 * 24 * 60 * 60;
  reply.setCookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: sixMonthsInSeconds,
  });

  return reply.status(201).send({
    userId: user.id,
    email: dbEmail.email,
  });
};

export const LoginHandler: RouteHandlerMethod = async (request, reply) => {
  const { email, password } = request.body as LoginBodySchemaType;

  // Check if user exists
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return reply.status(401).send({ error: "Invalid Email or Password" });
  }
  if (!existingUser.passwordSalt || !existingUser.passwordHash) {
    return reply.status(401).send({ error: "Invalid Email or Password" });
  }

  // Verify Password
  const isPasswordValid = verifyPassword({
    candidatePassword: password,
    salt: existingUser.passwordSalt,
    hash: existingUser.passwordHash,
  });
  if (!isPasswordValid) {
    return reply.status(401).send({ error: "Invalid Email or Password" });
  }

  // Get user details and generate tokens
  try {
    var { profile, dbEmail } = await getProfile({
      existingUserId: existingUser.id,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Internal Server Error" });
  }

  const { accessToken, refreshToken } = await generateTokens(
    existingUser,
    profile,
    dbEmail
  );

  // Save session in DB
  await saveSession({
    userId: existingUser.id,
    userAgent: request.headers["user-agent"] || "unknown",
    ip: request.ip,
    refreshToken,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
    domain: process.env.DOMAIN,
  };

  // Set HttpOnly cookie for refresh token
  reply.setCookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes
  });

  const sixMonthsInSeconds = 6 * 30 * 24 * 60 * 60;
  reply.setCookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: sixMonthsInSeconds,
  });

  return reply.status(200).send({
    userId: existingUser.id,
    email: dbEmail.email,
  });
};
