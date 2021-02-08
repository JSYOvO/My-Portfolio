import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
// import { Field, ObjectType } from "type-graphql";
// import { O_NOFOLLOW } from "constants";

// @ObjectType()
@Entity()
export class Post {
    // @Field()
    @PrimaryKey()
    id!: number;

    // @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    // @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    // @Field()
    @Property({ type: "text" })
    title!: string;

    @Property({ type: "text" })
    textArea!: string;
}
