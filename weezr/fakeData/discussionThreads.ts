export default [
    {
        id: 1,
        userIds: [1, 2],
        readByUserId: [1] // I've read - FOR BADGES - update at each new messages create / read
    },
    {
        id: 2,
        userIds: [1, 3],
        readByUserId: [3] // I've UNread - here -> no new messages yet
    },
    {
        id: 3,
        userIds: [1, 4],
        readByUserId: [1, 4] // I've read
    }
];
