import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  LoginBodySchema,
  LoginFailedResponseSchema,
  LoginResponseSchema,
  RegisterBodySchema,
  RegisterFailedResponseSchema,
  RegisterResponseSchema,
} from "./auth.schemas";
import { LoginHandler, RegisterHandler } from "./auth.controllers";

const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: RegisterBodySchema,
        response: {
          201: RegisterResponseSchema,
          400: RegisterFailedResponseSchema,
        },
      },
    },
    RegisterHandler
  );
  fastify.post(
    "/login",
    {
      schema: {
        body: LoginBodySchema,
        response: {
          200: LoginResponseSchema,
          401: LoginFailedResponseSchema,
        },
      },
    },
    LoginHandler
  );
};

export default authRoutes;
