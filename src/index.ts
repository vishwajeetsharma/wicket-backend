import fastify, { FastifyReply, FastifyRequest } from "fastify";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/manage/user.route";
import jwt from "@fastify/jwt";
import { registerAuthenticate } from "./decorators/auth.decorator";

import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import fastifyCookie from "@fastify/cookie";

export const server = fastify({ logger: true });

// Add schema validator and serializer
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.register(fastifyCookie, {
  // secret: process.env.COOKIE_SECRET, // optional, for signed cookies
  parseOptions: {}, // optional, default parsing options
});

server.register(jwt, {
  secret: process.env.SECRET_STRING || "supersecret",
  sign: {
    algorithm: "HS256",
  },
  cookie: {
    cookieName: "accessToken",
    signed: false,
  },
  verify: {
    algorithms: ["HS256"],
  },
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}
registerAuthenticate(server);

server.register(authRoutes, { prefix: "/auth" });
server.register(userRoutes);

server.listen({ port: 8000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
