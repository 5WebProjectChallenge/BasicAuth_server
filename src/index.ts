
/*
    Setup postgres db using dbSetup.md 
*/

import { createConnection, Connection } from "typeorm";
import express from "express";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import {
  ApolloServer
} from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/user";
import { User } from "./entites/User";

const port = 4000;

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "logintest",
    logging: true,
    synchronize: true,
    entities: [User],
  });
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTTL: true,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        sameSite: "lax", // google this
        httpOnly: true, // U can not see cokkee from front end
        secure: __prod__, // it will work on only https
      },
      saveUninitialized: false,
      secret: "dddsss",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver], // add all resolvers here
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res }), // So all resolvers can use this to query db
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(port, () => console.log("Listening to", port));
};

main();
