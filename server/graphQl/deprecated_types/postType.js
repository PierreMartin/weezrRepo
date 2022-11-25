import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from "graphql";

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        content: { type: GraphQLString },
        isPrivate: { type: GraphQLBoolean },
        userId: { type: GraphQLString }
    })
});
