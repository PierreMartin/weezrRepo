import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { PostType } from '../types/postType';
import { Post } from "../../models/post";

export const RootMutationType = new GraphQLObjectType({
    name: 'RootMutation',
    fields: () => ({
        addPost: {
            type: PostType,
            args: {
                data: {
                    type: new GraphQLInputObjectType({
                        name: 'addPost_data',
                        fields: () => ({
                            title: { type: GraphQLString },
                            description: { type: GraphQLString },
                            content: { type: GraphQLString },
                            isPrivate: { type: GraphQLBoolean },
                            userId: { type: GraphQLString }
                        })
                    })
                }
            },
            resolve(parentValue, fields) {
                const { data } = fields;
                return new Post(data).save().then((res) => {
                    return res;
                }).catch(() => {
                    return new Error("A error happen at the creating new post");
                });
            }
        },

        editPostById: {
            type: PostType,
            args: {
                /*
                id: { type: GraphQLID },
                title: { type: GraphQLString },
                description: { type: GraphQLString },
                content: { type: GraphQLString }
                */
                filter: {
                    type: new GraphQLInputObjectType({
                        name: 'editPostById_filter',
                        fields: () => ({ _id: { type: GraphQLID } })
                    })
                },
                data: {
                    type: new GraphQLInputObjectType({
                        name: 'editPostById_data',
                        fields: () => ({
                            title: { type: GraphQLString },
                            description: { type: GraphQLString },
                            content: { type: GraphQLString }
                        })
                    })
                }
            },
            resolve(parentValue, fields) {
                const { filter, data } = fields;

                return Post.findOneAndUpdate(filter, data, { new: true }).then((res) => {
                    return res;
                }).catch(() => {
                    return new Error("A error happen at the updating post");
                });
            }
        }

        // Others mutations here ...
    })
});
