import { GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID } from 'graphql';
import { UserType } from '../types/userType';
import { PostType } from '../types/postType';
import { User } from "../../models/user";
import { Post } from "../../models/post";

export const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () => ({
        users: {
            type: new GraphQLList(UserType),
            resolve: (parentValue, args, context) => {
                return User.find({});
            }
        },

        userById: {
            type: UserType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve(parentValue, { id }) {
                return User.findById(id);
            }
        },

        postsByUserId: {
            type: new GraphQLList(PostType),
            args: { userId: { type: GraphQLString } },
            resolve(parentValue, { userId }) {
                return Post.find({ userId });
            }
        },

        postById: {
            type: PostType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, { id }) {
                return Post.findById(id);
            }
        }
    })
});

/* In graphiql (http://localhost:3080/graphql) :
// ALL
query {
    users {
        lastname,
        firstname,
        id
    }
}

// ONE
query {
  user(id: "5f75f8c143adc00cc3453bf7") {
        lastname,
        firstname,
        id
  }
}

// SET
mutation {
  addUser(firstname: "toto", ... ) {
    firstname
  }
}
*/
