import { server } from "../index";
import type { Email, Profile, User } from "../generated/prisma";

export function generateTokens(user: User, profile: Profile, email: Email) {
  const AccessPayload = {
    userId: user.id,
    email: email.email,
    firstName: profile.firstName,
    lastName: profile.lastName || "",
    sessionVersion: user.sessionVersion,
  };
  const RefreshPayload = {
    userId: user.id,
    sessionVersion: user.sessionVersion,
  };

  const accessToken = server.jwt.sign(AccessPayload, { expiresIn: "15m" });
  const refreshToken = server.jwt.sign(RefreshPayload, { expiresIn: "180d" });

  return { accessToken, refreshToken };
}
