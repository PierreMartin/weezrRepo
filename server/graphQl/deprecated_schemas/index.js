import { GraphQLSchema } from 'graphql';
import { RootQueryType } from './rootQueryType';
import { RootMutationType } from './rootMutationType';

export const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});
