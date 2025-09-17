import { RouteHandlerMethod } from "fastify";
import {
  deleteAllSessions,
  deleteSession,
  getCompleteUserData,
  updateSessionToken,
  updateSessionVersion,
  verifyUserWithRefreshToken,
} from "./user.service";
import { generateTokens } from "../../utils/tokens";

export const LogoutAllHandler: RouteHandlerMethod = async (request, reply) => {
  const payload = request.user as {
    userId: string;
    sessionVersion: number;
  };

  await updateSessionVersion(payload.userId);
  await deleteAllSessions(payload.userId);

  // Clear cookies
  reply.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  reply.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return reply.status(200).send({ logout: true });
};

export const LogoutHandler: RouteHandlerMethod = async (request, reply) => {
  // read refresh token from cookie
  const refreshToken = request.cookies.refreshToken;
  if (refreshToken) {
    deleteSession(refreshToken);
  }

  // Clear cookies
  reply.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  reply.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return reply.status(200).send({ logout: true });
};

export const RefreshTokenHandler: RouteHandlerMethod = async (
  request,
  reply
) => {
  // read refresh token from cookie
  const userRefreshToken = request.cookies.refreshToken;
  if (!userRefreshToken) {
    return reply.status(401).send({ error: "No refresh token provided" });
  }

  // verify refresh token with jwt and then check it's validity in db
  const decoded = request.server.jwt.verify<{
    userId: string;
    sessionVersion: number;
    iat: number;
    exp: number;
  }>(userRefreshToken);
  if (!decoded) {
    return reply.status(401).send({ error: "Invalid refresh token" });
  }
  const { sessionVersion, userId } = decoded;

  const verifiedUser = await verifyUserWithRefreshToken({
    userId,
    sessionVersion,
    userRefreshToken,
  });
  if (!verifiedUser) {
    return reply.status(401).send({ error: "Invalid refresh token" });
  }

  // Generating new tokens and saving them in cookies and db
  if (!verifiedUser.user || !verifiedUser.profile || !verifiedUser.email) {
    return reply
      .status(401)
      .send({ error: "Invalid user data for token generation" });
  }
  const { accessToken, refreshToken } = generateTokens(
    verifiedUser.user,
    verifiedUser.profile,
    verifiedUser.email
  );

  // saving new refresh token in db
  updateSessionToken({
    sessionId: verifiedUser.sessionId,
    newRefreshToken: refreshToken,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
    domain: process.env.DOMAIN,
  };

  reply
    .setCookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    })
    .setCookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 6 * 30 * 24 * 60 * 60, // 6 months
    });

  return reply.status(200).send({ refresh: true });
};

export const GetUserHandler: RouteHandlerMethod = async (request, reply) => {
  const user = request.user as {
    userId: string;
    sessionVersion: number;
  };

  const userData = await getCompleteUserData(user.userId);
  return reply.status(200).send({ ...userData });
};
