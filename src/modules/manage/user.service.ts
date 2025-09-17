import prisma from "../../utils/prisma";
import crypto from "crypto";

export async function updateSessionToken({
  sessionId,
  newRefreshToken,
}: {
  sessionId: string;
  newRefreshToken: string;
}) {
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  return await prisma.session.update({
    where: { id: sessionId },
    data: {
      refreshToken: refreshTokenHash,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    },
  });
}

// For logout from all devices at once
export async function updateSessionVersion(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: { increment: 1 },
    },
  });
}

// For deleting all sessions of a user (logout from all devices)
export async function deleteAllSessions(userId: string) {
  return await prisma.session.updateMany({
    where: { userId },
    data: { deletedAt: new Date() },
  });
}

export async function deleteSession(refreshToken: string) {
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  return await prisma.session.update({
    where: { refreshToken: refreshTokenHash },
    data: { deletedAt: new Date() },
  });
}

export async function verifyUserWithRefreshToken({
  userId,
  sessionVersion,
  userRefreshToken,
}: {
  userId: string;
  sessionVersion: number;
  userRefreshToken: string;
}) {
  // Matching the refresh token in DB and checking it's validity and session version
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(userRefreshToken)
    .digest("hex");

  const session = await prisma.session.findFirst({
    where: {
      userId,
      refreshToken: refreshTokenHash,
      deletedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!session || session.user.sessionVersion !== sessionVersion) {
    return null;
  }
  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
  });

  const email = await prisma.email.findFirst({
    where: { userId: session.user.id, type: "primary", deletedAt: null },
  });

  return { user: session.user, profile, email, sessionId: session.id };
}

export async function getCompleteUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      // User fields (exclude passwordHash, passwordSalt)
      id: true,
      sessionVersion: true,
      is2FAEnabled: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,

      profile: {
        where: { deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
      emails: {
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          type: true,
          verified: true,
          addedAt: true,
          deletedAt: true,
        },
      },
      phones: {
        where: { deletedAt: null },
        select: {
          id: true,
          phone: true,
          type: true,
          verified: true,
          addedAt: true,
          deletedAt: true,
        },
      },
      passkeys: {
        where: { deletedAt: null },
        select: {
          id: true,
          credentialId: true,
          publicKey: true,
          signCount: true,
          platform: true,
          createdAt: true,
          lastUsedAt: true,
          deletedAt: true,
        },
      },
      hardwareKeys: {
        where: { deletedAt: null },
        select: {
          id: true,
          credentialId: true,
          publicKey: true,
          signCount: true,
          deviceType: true,
          transports: true,
          createdAt: true,
          lastUsedAt: true,
          deletedAt: true,
        },
      },
      totp: {
        where: { deletedAt: null },
        select: {
          id: true,
          verified: true,
          createdAt: true,
          deletedAt: true,
        },
      },
      sessions: {
        where: { deletedAt: null },
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          deviceName: true,
          createdAt: true,
          lastUsedAt: true,
          expiresAt: true,
          revokedAt: true,
          deletedAt: true,
        },
      },
      backupCodes: {
        where: { deletedAt: null },
        select: {
          id: true,
          used: true,
          createdAt: true,
          usedAt: true,
          deletedAt: true,
        },
      },
      googleAccount: {
        where: { deletedAt: null },
        select: {
          id: true,
          googleId: true,
          email: true,
          name: true,
          picture: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
      githubAccount: {
        where: { deletedAt: null },
        select: {
          id: true,
          githubId: true,
          username: true,
          email: true,
          avatarUrl: true,
          profileUrl: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
      microsoftAccount: {
        where: { deletedAt: null },
        select: {
          id: true,
          microsoftId: true,
          email: true,
          name: true,
          picture: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
    },
  });
}
