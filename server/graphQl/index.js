import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
const { join } = require("path");
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { resolvers } from "./resolvers";
import { assertAuthenticatedPromise } from "../controllers/authorizationMiddleware";
import { resolversMap } from "./resolvers/customTypes";

export default (app) => {
    /*
    app.use('/graphql', graphqlHTTP({
        schema,
        graphiql: true
    }));
    */

    const playgroundEnabled = process.env.NODE_ENV !== 'production';
    app.use(cors({ origin: true }));

    // https://www.graphql-tools.com/docs/schema-loading
    const schema = loadSchemaSync(join(__dirname, './schemas/*.graphql'), {
        loaders: [new GraphQLFileLoader()]
    });

    const schemaWithResolvers = addResolversToSchema({
        schema,
        resolvers: {
            ...resolversMap, // Custom types here
            ...resolvers
        }
    });

    const server = new ApolloServer({
        schema: schemaWithResolvers,
        context: async ({ req, res, next }) => {
            const user = await assertAuthenticatedPromise(req, res, next, 'apollo');
            return {
                userMeId: user?._id?.toString(),
                isAuthenticate: !!user?._id
            };
        },
        introspection: playgroundEnabled,
        playground: playgroundEnabled
    });

    server.start().then(() => {
        server.applyMiddleware({ app, cors: false, path: '/graphql' });
    });
};
