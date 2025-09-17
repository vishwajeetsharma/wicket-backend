import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { server } from "../../index";
import {
  LogoutAllHandler,
  LogoutHandler,
  RefreshTokenHandler,
  GetUserHandler,
} from "./user.controller";
import {
  InternalServerErrorResponseSchema,
  LogoutResponseSchema,
  RefreshTokenFailedResponseSchema,
  RefreshTokenResponseSchema,
} from "./user.schema";

const userRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/refresh-token",
    {
      schema: {
        response: {
          200: RefreshTokenResponseSchema,
          401: RefreshTokenFailedResponseSchema,
          500: InternalServerErrorResponseSchema,
        },
      },
    },
    RefreshTokenHandler
  );

  fastify.post(
    "/logout",
    {
      schema: {
        response: {
          200: LogoutResponseSchema,
          500: InternalServerErrorResponseSchema,
        },
      },
      preHandler: [server.authenticate],
    },
    LogoutHandler
  );

  fastify.post(
    "/logout-all",
    {
      preHandler: [server.authenticate],
      schema: {
        response: {
          200: LogoutResponseSchema,
          500: InternalServerErrorResponseSchema,
        },
      },
    },
    LogoutAllHandler
  );

  fastify.get(
    "/get-user-data",
    {
      preHandler: [server.authenticate],
      schema: {
        response: {
          500: InternalServerErrorResponseSchema,
          // 200: CompleteUserDataSchema,
        },
      },
    },
    GetUserHandler
  );
};

export default userRoutes;
