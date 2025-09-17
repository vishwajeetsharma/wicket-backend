import prisma from "../../utils/prisma";
import crypto from "crypto";

export async function findUserByEmail(email: string) {
  return await prisma.user.findFirst({
    where: {
      emails: {
        some: {
          email,
        },
      },
      deletedAt: null,
    },
  });
}

export async function createUser({
  first_name,
  last_name,
  email,
  hash,
  salt,
}: {
  first_name: string;
  last_name: string | undefined;
  email: string;
  hash: string;
  salt: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { passwordHash: hash, passwordSalt: salt },
    });

    const profile = await tx.profile.create({
      data: { firstName: first_name, lastName: last_name, userId: newUser.id },
    });

    const dbEmail = await tx.email.create({
      data: { email, userId: newUser.id, type: "primary" },
    });

    return { user: newUser, profile, dbEmail };
  });
}

export async function getProfile({
  existingUserId,
}: {
  existingUserId: string;
}) {
  const profile = await prisma.profile.findFirst({
    where: { userId: existingUserId, deletedAt: null },
  });

  const dbEmail = await prisma.email.findFirst({
    where: { userId: existingUserId, type: "primary", deletedAt: null },
  });
  if (!profile || !dbEmail) {
    throw new Error("Profile or Email not found");
  }
  return { profile, dbEmail };
}

export async function saveSession({
  userId,
  userAgent,
  ip,
  refreshToken,
}: {
  userId: string;
  userAgent: string | undefined;
  ip: string;
  refreshToken: string;
}) {
  // Hash refresh toeken before storing in db for security
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  return await prisma.session.create({
    data: {
      userId,
      userAgent: userAgent || "Unknown",
      lastUsedAt: new Date(),
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      refreshToken: refreshTokenHash,
    },
  });
}

export async function getSession(refreshToken: string) {
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  return await prisma.session.findFirst({
    where: {
      refreshToken: refreshTokenHash,
      deletedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}
