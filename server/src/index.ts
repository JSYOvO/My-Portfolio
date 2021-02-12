import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
    const orm = MikroORM.init(mikroOrmConfig);
    (await orm).getMigrator().up(); // 마이그레이션 실행

    const app = express();

    let RedisStore = connectRedis(session);
    let redisClient = redis.createClient();

    app.use(
        session({
            store: new RedisStore({
                client: redisClient,
                disableTouch: true, // touch를 통해 수정 불가
            }),
            cookie: {
                maxAge: 1000 * 3600 * 24,
                httpOnly: true,
                secure: __prod__,
                sameSite: "lax",
            },
            secret: "keyboard cat",
            resave: false,
            saveUninitialized: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        context: async ({ req, res }): Promise<MyContext> => ({
            em: (await orm).em,
            req,
            res,
        }),
    });
    apolloServer.applyMiddleware({ app });

    app.get("/", (_, res) => {
        res.send("hello world");
    });
    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });
};

main().catch((err) => {
    console.log(err);
});
