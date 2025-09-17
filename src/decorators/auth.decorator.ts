// auth.decorator.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import prisma from "../utils/prisma";

interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  sessionVersion: number;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = await request.jwtVerify<JwtPayload>();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.sessionVersion !== payload.sessionVersion) {
      return reply.status(401).send({ error: "Invalid session, login again" });
    }
  } catch (err) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

// Optional helper to register it as a decorator
export function registerAuthenticate(server: FastifyInstance) {
  server.decorate("authenticate", authenticate);
}
