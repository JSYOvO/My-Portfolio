import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
    const orm = MikroORM.init(mikroOrmConfig);
    (await orm).getMigrator().up(); // 마이그레이션 실행

    const post = (await orm).em.create(Post, {
        title: "my first port",
        textArea: "@@@",
    });

    // (await orm).em.persistAndFlush(post);

    const posts = await (await orm).em.find(Post, {});
    console.log(posts);
};

main().catch((err) => {
    console.log(err);
});
