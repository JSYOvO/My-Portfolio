import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User], // table 이라고 생각하면 댈듯
    dbName: "myweb",
    user: "jsyovo",
    type: "postgresql",
    debug: !__prod__,
    // } as const; // 데이터 타입을 구체화 시켜줌
} as Parameters<typeof MikroORM.init>[0];
