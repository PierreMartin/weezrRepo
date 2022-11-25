import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export const resolversMap = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        }
    }),
    Object: new GraphQLScalarType({
        name: 'Object',
        description: 'Arbitrary object',
        parseValue: (value) => {
            return typeof value === 'object' ? value
                : typeof value === 'string' ? JSON.parse(value)
                    : null
        },
        serialize: (value) => {
            return typeof value === 'object' ? value
                : typeof value === 'string' ? JSON.parse(value)
                    : null
        },
        parseLiteral: (ast) => {
            switch (ast.kind) {
                case Kind.STRING: return JSON.parse(ast.value)
                case Kind.OBJECT: throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`)
                default: return null
            }
        }
    })
};
