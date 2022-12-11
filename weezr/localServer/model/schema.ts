import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'messages',
            columns: [
                { name: 'text', type: 'string' },
                { name: 'title', type: 'string' },
                { name: 'subtitle', type: 'string', isOptional: true },
                { name: 'body', type: 'string' },
                { name: 'is_pinned', type: 'boolean' }, // boolean
                { name: 'last_seen_at', type: 'number', isOptional: true } // date
            ]
        }),
        /*
        tableSchema({
            name: 'posts',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'subtitle', type: 'string', isOptional: true },
                { name: 'body', type: 'string' },
                { name: 'is_pinned', type: 'boolean' }, // boolean
                { name: 'last_seen_at', type: 'number', isOptional: true } // date
            ]
        }),
        tableSchema({
            name: 'comments',
            columns: [
                { name: 'body', type: 'string' },
                { name: 'post_id', type: 'string', isIndexed: true }, // relation to a table
            ]
        })
        */
    ]
});
