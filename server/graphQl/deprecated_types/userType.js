import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from "graphql";
import { PostType } from "./postType";
import { Post } from "../../models/post";

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },

        // Entité liée :
        posts: {
            type: new GraphQLList(PostType),
            resolve(parentValue) {
                const userId = parentValue.id;
                return Post.find({ userId });
            }
        }
    })
});
