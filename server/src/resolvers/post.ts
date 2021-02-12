import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import { type } from "os";
import { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("id") id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: string,
        @Arg("contents") contents: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, { title, contents });
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title") title: string,
        @Arg("contents") contents: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if (!post) {
            return null;
        }
        if (
            typeof title !== "undefined" &&
            typeof contents !== "undefined"
        ) {
            post.title = title;
            post.contents = contents;
            await em.persistAndFlush(post);
        }

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        try {
            await em.nativeDelete(Post, { id });
        } catch (err) {
            return false;
        }
        return true;
    }
}
