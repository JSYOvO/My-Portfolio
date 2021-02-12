import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from "type-graphql";

@InputType()
class AccountInfo {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class ErrorField {
    @Field()
    field: String;
    @Field()
    message: String;
}

@ObjectType()
class AccountResponse {
    @Field(() => [ErrorField], { nullable: true })
    errors?: ErrorField[];
    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, {
            id: req.session.userId,
        });
        return user;
    }

    @Mutation(() => AccountResponse)
    async register(
        @Arg("info") info: AccountInfo,
        @Ctx() { em, req }: MyContext
    ): Promise<AccountResponse> {
        if (info.username.length <= 3) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 3",
                    },
                ],
            };
        }
        if (info.password.length <= 5) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 5",
                    },
                ],
            };
        }
        const hashedPassword = await argon2.hash(info.password);

        const user = em.create(User, {
            username: info.username,
            password: hashedPassword,
        });

        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (
                err.code == "23505" ||
                err.detail.includes("already exist")
            ) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        },
                    ],
                };
            }
        }

        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => AccountResponse)
    async login(
        @Arg("info") info: AccountInfo,
        @Ctx() { em, req }: MyContext
    ): Promise<AccountResponse> {
        const user = await em.findOne(User, {
            username: info.username,
        });

        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "that username doesnt exist",
                    },
                ],
            };
        }
        const valid = await argon2.verify(
            user.password,
            info.password
        );

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return { user };
    }
}
