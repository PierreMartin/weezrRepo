// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

export default [
    {
        _id: 1,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2019, 1, 11, 17, 11, 0)),
        discussionThreadId: 1,
        readByUserId: [1, 2], // FOR MARK ✓ a message as read,
        authorId: 1
    },
    {
        _id: 2,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2018, 1, 11, 17, 23, 0)),
        discussionThreadId: 1,
        readByUserId: null,
        authorId: 2
    },
    {
        _id: 3,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2017, 1, 11, 17, 45, 0)),
        discussionThreadId: 1,
        readByUserId: null,
        authorId: 1
    },
    {
        _id: 4,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2017, 1, 12, 17, 12, 0)),
        discussionThreadId: 2,
        readByUserId: null,
        authorId: 1
    },
    {
        _id: 5,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2018, 12, 11, 17, 22, 0)),
        discussionThreadId: 3,
        readByUserId: null,
        authorId: 1
    },
    {
        _id: 6,
        text: faker.lorem.paragraph()?.substring(0, 40),
        createdAt: new Date(Date.UTC(2020, 11, 11, 17, 16, 0)),
        discussionThreadId: 3,
        readByUserId: null,
        authorId: 3
    }
];
