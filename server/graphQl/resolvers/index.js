import mongoose from "mongoose";
import { onGetMyBlockedProfiles } from "../../controllers/users";
import { User } from "../../models/user";
import { UserPhotoThread } from "../../models/userPhotoThread";
import { Thread } from "../../models/thread";
import { ThreadMessage } from "../../models/threadMessage";
import { UserInterSendLike } from "../../models/userInterSendLike";
import { UserInterVisit } from "../../models/userInterVisit";
import { UserInterSendRequest } from "../../models/userInterSendRequest";
import { UserInterFollow } from "../../models/userInterFollow";
import { UserInterBlock } from "../../models/userInterBlock";
import _ from "lodash";
// import util from "util";

const checkHaveGranted = (context, expression) => {
    for (const key in expression) {
        switch (key) {
            case 'isAuthenticate':
                if (context[key] !== expression[key]) {
                    return false;
                }
                break;
            case 'roles':
                if (!context[key]?.includes(expression[key].includes)) {
                    return false;
                }
                break;
            default:
                break;
        }
    }

    return true;
};

const defaultLimit = 1000;

// => populate({ as: 'fieldOutput', from: 'collection', localField: 'field', foreignField: 'field' }, ['_id', 'field1', 'field2'])
export const populate = (
    {
        from,
        localField,
        foreignField,
        as
    },
    fieldsKey
) => {
    let groupFields = {};

    for (let i = 0; i < fieldsKey?.length; i++) {
        const fieldKey = fieldsKey[i];
        if (fieldKey === '_id') {
            groupFields = {
                _id: `$_id`,
                id: { $first: `$_id` },
            };
            continue;
        }

        groupFields[fieldKey] = { $first: `$${fieldKey}` } ;
    }

    return [
        {
            "$lookup": {
                from,
                localField,
                foreignField,
                as,
                pipeline: [
                    {
                        "$group": groupFields
                    }
                ]
            }
        },
        {
            $unwind: `$${as}`
        }
    ];
}

const getUserFields = () => {
    return {
        _id: 1,
        // id: "$user._id",
        email: "$user.email",
        isEmailVerified: "$user.isEmailVerified",
        incorrectPasswordInput: "$user.incorrectPasswordInput",
        phone: "$user.phone",
        gender: "$user.gender",
        birthAt: "$user.birthAt",
        distanceComparedToMe: "$user.distanceComparedToMe",
        displayName: "$user.displayName",
        isOnboardingNeverUsed: "$user.isOnboardingNeverUsed",
        about: "$user.about",
        poi: "$user.poi",
        career: "$user.career",
        physicalAppearance: "$user.physicalAppearance",
        preferencesFilter: "$user.preferencesFilter",
        preferencePushNotification: "$user.preferencePushNotification",
        preferenceAccount: "$user.preferenceAccount",
        privacy: "$user.privacy",
        basedLocation: "$user.basedLocation",
        currentLocation: "$user.currentLocation",
        isOnline: "$user.isOnline",
        roles: "$user.roles",
        account: "$user.account",
        images: "$user.images",
        provider: "$user.provider"
    };
};

const getUserInteractions = (userMeId) => {
    return [
        // Get like sent:
        {
            "$lookup": {
                "from": "userintersendlikes",
                "localField": "_id",
                "foreignField": "receiverId",
                pipeline: [
                    {
                        $match: { senderId: mongoose.Types.ObjectId(userMeId) }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            id: { $first: "$_id" },
                            isMutual: { $first: "$isMutual" },
                            isSeenByReceiver: { $first: "$isSeenByReceiver" },
                            type: { $first: "$type" },
                            at: { $first: "$at" }
                        }
                    }
                ],
                "as": "myLikeSent"
            }
        },

        // Get like received:
        {
            "$lookup": {
                "from": "userintersendlikes",
                "localField": "_id",
                "foreignField": "senderId",
                pipeline: [
                    {
                        $match: { receiverId: mongoose.Types.ObjectId(userMeId) }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            id: { $first: "$_id" },
                            isMutual: { $first: "$isMutual" },
                            isSeenByReceiver: { $first: "$isSeenByReceiver" },
                            type: { $first: "$type" },
                            at: { $first: "$at" }
                        }
                    }
                ],
                "as": "myLikeReceived"
            }
        },

        // Get visit received:
        {
            "$lookup": {
                "from": "userintervisits",
                "localField": "_id",
                "foreignField": "senderId",
                pipeline: [
                    {
                        $match: { receiverId: mongoose.Types.ObjectId(userMeId) }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            id: { $first: "$_id" },
                            isSeenByReceiver: { $first: "$isSeenByReceiver" },
                            at: { $first: "$at" }
                        }
                    }
                ],
                "as": "myVisitReceived"
            }
        }
    ];
};

export const resolvers = {
    Query: {
        users: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true }); // example : { isAuthenticate: true, roles: { includes: 'admin' } }
            if (!haveGranted) { return null; }

            const {
                filter = {},
                data = {},
                offset = 0,
                limit = defaultLimit
            } = args;

            const {
                filterMain = {},
                filterDesiredMeetingType = {},
                filterFollowers
            } = filter;

            const {
                dataMain = {}
            } = data;

            const { userMeId, coordinates } = dataMain;

            const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
            const filterMyBlockedProfiles = { _id: { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };
            let filterAll = {
                $and: [
                    filterMain,
                    filterDesiredMeetingType,
                    filterMyBlockedProfiles
                ]
            };

            // 1) Get users
            // 2) Get the threadId by user
            // 3) Get messages by threadId
            // 4) get unread messages by user

            /*
            const pipeline = [
                {
                    $addFields: {
                        participantsObjIds: {
                            $map: {
                                input: "$participants", // participants
                                in: { $toObjectId: "$$this" }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        "from": "thread",
                        "localField": "_id",
                        "foreignField": "participantsObjIds",
                        pipeline: [
                            {
                                $match: filterAll
                            },
                            {
                                "$group": {
                                    "_id": '$_id',
                                    // "threadId": '$_id',
                                }
                            }
                        ],
                        "as": "thread"
                    }
                },
                // { $unwind: "$thread" },
                {
                    $lookup: {
                        "from": "threadmessages",
                        "localField": "_id",
                        "foreignField": "thread._id",
                        pipeline: [
                            {
                                $match: count
                            },
                            {
                                "$group": {
                                    "_id": null,
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        "as": "unreadMessages"
                    }
                },
                {
                    $group: {
                        "_id": "$_id",
                        "id": { "$first": "$_id" },
                        "email": { "$first": "$email" },
                        "gender": { "$first": "$gender" },
                        "birthAt": { "$first": "$birthAt" },
                        "about": { "$first": "$about" },
                        "currentLocation": { "$first": "$currentLocation" },
                        "isOnline": { "$first": "$isOnline" },
                        "roles": { "$first": "$roles" },
                        "account": { "$first": "$account" },
                        "images": { "$first": "$images" },
                        "unreadMessages": { "$last": { "$arrayElemAt": [ "$unreadMessages.count", 0 ] }},
                        "thread": { "$first": "$thread" }
                    }
                }
            ];
            */

            try {
                // Tab my followers:
                if (filterFollowers) {
                    const followersRes = await UserInterFollow
                        .find(filterFollowers)
                        // .populate('receiver', '_id')
                        .skip(offset)
                        .limit(limit);

                    const followersIds = followersRes?.map((follower) => follower?.receiverId);

                    if (followersIds?.length) {
                        const filterAllFollowers = { _id: { $in: followersIds } };
                        filterAll = {
                            $and: [
                                filterMain,
                                filterAllFollowers,
                                filterMyBlockedProfiles
                            ]
                        };
                    } else {
                        return {
                            data: [],
                            pageInfo: {
                                message: 'Users successfully fetched',
                                success: true,
                                totalCount: 0,
                                isLastPage: true,
                                isLimitReached: true
                            }
                        };
                    }
                }

                const totalCount = await User
                    .find(filterAll)
                    .count();

                // console.log(`- totalCount: ${totalCount} - isLastPage ${(offset + limit) >= totalCount} - offset: ${offset}`);

                // Get all users sorted by distance:
                const users = await User
                    /*
                    .find(
                        { 'currentLocation.coordinates':
                                {
                                    $near: {
                                        $geometry: {
                                            type : "Point",
                                            coordinates
                                        },
                                        $maxDistance: 80 * 1000, // 80km
                                    }
                                }
                        }
                    )
                    */
                    .aggregate([
                        { "$geoNear": {
                                query: filterAll,
                                "near": {
                                    "type": "Point",
                                    coordinates
                                },
                                "spherical": true,
                                "distanceField": "distanceComparedToMe",
                                // "maxDistance": 80 * 1000,  // 80km,
                                // "distanceMultiplier": 6378.1 // convert radians to kilometers
                                "distanceMultiplier": 0.001
                            }
                        },
                        ...getUserInteractions(userMeId),
                        {
                            "$group": {
                                _id: "$_id",
                                user: { $first: "$$ROOT" }, // get all fields

                                myLikeSent: { $first: { "$arrayElemAt": [ "$myLikeSent", 0 ] } },
                                myLikeReceived: { $first: { "$arrayElemAt": [ "$myLikeReceived", 0 ] } },
                            }
                        },
                        {
                            $project: {
                                ...getUserFields(),

                                userInteractions: {
                                    myLike: {
                                        sent: "$myLikeSent",
                                        received: "$myLikeReceived"
                                    },
                                }
                            }
                        },

                        { "$sort": { "distanceComparedToMe": 1 } }
                    ])
                    .skip(offset)
                    .limit(limit);

                // console.log('---------');
                // console.log(util.inspect(users, { showHidden: false, depth: null, colors: true }))


                if (!users) {
                    return new Error("A error has occurred at the getting users");
                }

                const threads = await Thread.find({ participants: { $in: [userMeId] } });
                const threadIds = threads?.map((thread) => thread?._id) || [];

                const threadMessage = await ThreadMessage
                    .find({ threadId: { $in: threadIds } })
                    .sort({ createdAt: -1 })
                    .limit(50);

                const data = users?.map((user) => {
                    const userToObject = user;/* user.toObject(); */

                    // Get thread for each user:
                    const threadFoundByUser = threads?.find((thread) => {
                        // { $all: [userToObject?._id, userMeId] }
                        return _.isEqual(
                            _.sortBy([userToObject?._id?.toString(), userMeId]),
                            _.sortBy(thread?.participants || [])
                        );
                    });

                    // Get messages (list) by thread found for each user:
                    const unreadMessagesFound = threadMessage
                        ?.filter((message) => {
                            return message?.threadId?.toString() === threadFoundByUser?._id?.toString();
                        })
                        // Get unread messages only:
                        ?.filter((message) => {
                            return (
                                message?.author?.toString() !== userMeId
                                && !message.readBy?.find((rb) => rb?.user?.toString() === userMeId)
                            );
                        });

                    return {
                        ...userToObject,
                        id: userToObject?._id,
                        unreadMessages: unreadMessagesFound?.length
                    }
                });

                return {
                    data,
                    pageInfo: {
                        message: 'Users successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount,
                        isLimitReached: (offset + limit) >= 2000
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching Users");
            }
        },
        user: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter = {},
                data = {}
            } = args;

            const {
                filterMain = {},
                filterCountUnreadMessages = {}
            } = filter;

            const { _id, coordinates, threadId, userMeId } = filterMain;

            /* Version without MongoDB for query ThreadMessage:
            return User.aggregate([
                { "$geoNear": {
                        query: { _id: mongoose.Types.ObjectId(_id) },
                        "near": {
                            "type": "Point",
                            coordinates
                        },
                        "spherical": true,
                        "uniqueDocs": true, // findOne here
                        "distanceField": "distanceComparedToMe",
                        "distanceMultiplier": 0.001
                    }
                },
                // { $match: { _id: mongoose.Types.ObjectId(_id)} },
            ]).then((user, errUser) => {
                const userToObject = user?.length && user[0];

                if (errUser || !userToObject) {
                    console.log('errUser ', errUser);
                    return new Error("A error happen at the getting user");
                }

                if (!threadId) {
                    return {
                        ...userToObject,
                        id: userToObject?._id
                    }
                }

                // Get all messages in thread:
                return ThreadMessage
                    .find({ threadId })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .then((threadMessage, errThreadMessage) => {
                        if (errThreadMessage) { console.log('errThreadMessage ', errThreadMessage); }

                        // Get unread messages in thread:
                        const unreadMessagesFound = threadMessage
                            ?.filter((message) => {
                                return (
                                    message?.author?.toString() !== userMeId
                                    && !message.readBy?.find((rb) => rb?.user?.toString() === userMeId)
                                );
                            });

                        return {
                            ...userToObject,
                            id: userToObject?._id,
                            unreadMessages: unreadMessagesFound?.length
                        }
                    });
            });
            */

            try {
                // Try to get unread messages:
                const threads = await Thread.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(threadId) }
                    },
                    {
                        "$lookup": {
                            "from": "threadmessages",
                            "localField": "_id",
                            "foreignField": "threadId",
                            pipeline: [
                                {
                                    // Get only unread messages:
                                    $match: filterCountUnreadMessages
                                },
                                {
                                    "$group": {
                                        "_id": null,
                                        // Count all messages:
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            "as": "unreadMessages"
                        }
                    }
                ]);

                const thread = threads?.length && threads[0];

                // Get user:
                const users = await User.aggregate([
                    { "$geoNear": {
                            query: { _id: mongoose.Types.ObjectId(_id) },
                            "near": {
                                "type": "Point",
                                coordinates
                            },
                            "spherical": true,
                            "uniqueDocs": true, // findOne here
                            "distanceField": "distanceComparedToMe",
                            "distanceMultiplier": 0.001
                        }
                    },
                    ...getUserInteractions(userMeId),
                    // Get request sent:
                    {
                        "$lookup": {
                            "from": "userintersendrequests",
                            "localField": "_id",
                            "foreignField": "receiverId",
                            pipeline: [
                                {
                                    $match: { senderId: mongoose.Types.ObjectId(userMeId) }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        id: { $first: "$_id" },
                                        isSeenByReceiver: { $first: "$isSeenByReceiver" },
                                        privatePhotosGranted: { $first: "$privatePhotosGranted" },
                                        privatePhotosGrantedAt: { $first: "$privatePhotosGrantedAt" },
                                        at: { $first: "$at" }
                                    }
                                }
                            ],
                            "as": "myRequestSent"
                        }
                    },

                    // Get request received:
                    {
                        "$lookup": {
                            "from": "userintersendrequests",
                            "localField": "_id",
                            "foreignField": "senderId",
                            pipeline: [
                                {
                                    $match: { receiverId: mongoose.Types.ObjectId(userMeId) }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        id: { $first: "$_id" },
                                        isSeenByReceiver: { $first: "$isSeenByReceiver" },
                                        privatePhotosGranted: { $first: "$privatePhotosGranted" },
                                        privatePhotosGrantedAt: { $first: "$privatePhotosGrantedAt" },
                                        at: { $first: "$at" }
                                    }
                                }
                            ],
                            "as": "myRequestReceived"
                        }
                    },

                    // Get follow sent:
                    {
                        "$lookup": {
                            "from": "userinterfollows",
                            "localField": "_id",
                            "foreignField": "receiverId",
                            pipeline: [
                                {
                                    $match: { senderId: mongoose.Types.ObjectId(userMeId) }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        id: { $first: "$_id" },
                                        isSeenByReceiver: { $first: "$isSeenByReceiver" },
                                        at: { $first: "$at" }
                                    }
                                }
                            ],
                            "as": "myFollowSent"
                        }
                    },

                    // Get follow received:
                    {
                        "$lookup": {
                            "from": "userinterfollows",
                            "localField": "_id",
                            "foreignField": "senderId",
                            pipeline: [
                                {
                                    $match: { receiverId: mongoose.Types.ObjectId(userMeId) }
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        id: { $first: "$_id" },
                                        isSeenByReceiver: { $first: "$isSeenByReceiver" },
                                        at: { $first: "$at" }
                                    }
                                }
                            ],
                            "as": "myFollowReceived"
                        }
                    },
                    {
                        "$group": {
                            _id: "$_id",
                            user: { $first: "$$ROOT" }, // get all fields

                            myLikeSent: { $first: { "$arrayElemAt": [ "$myLikeSent", 0 ] } },
                            myLikeReceived: { $first: { "$arrayElemAt": [ "$myLikeReceived", 0 ] } },

                            myVisitReceived: { $first: { "$arrayElemAt": [ "$myVisitReceived", 0 ] } },

                            myRequestSent: { $first: { "$arrayElemAt": [ "$myRequestSent", 0 ] } },
                            myRequestReceived: { $first: { "$arrayElemAt": [ "$myRequestReceived", 0 ] } },

                            myFollowSent: { $first: { "$arrayElemAt": [ "$myFollowSent", 0 ] } },
                            myFollowReceived: { $first: { "$arrayElemAt": [ "$myFollowReceived", 0 ] } }
                        }
                    },
                    {
                        $project: {
                            ...getUserFields(),

                            userInteractions: {
                                myLike: {
                                    sent: "$myLikeSent",
                                    received: "$myLikeReceived"
                                },
                                myVisit: {
                                    received: "$myVisitReceived"
                                },
                                myRequest: {
                                    sent: "$myRequestSent",
                                    received: "$myRequestReceived"
                                },
                                myFollow: {
                                    sent: "$myFollowSent",
                                    received: "$myFollowReceived"
                                }
                            }
                        }
                    }
                    // { $match: { _id: mongoose.Types.ObjectId(_id)} },
                ]);

                const user = users?.length && users[0];

                if (!user) {
                    return {
                        data: {},
                        pageInfo: {
                            message: 'A error has occurred at the fetching user - no user found',
                            success: false,
                            doRedirection: true
                        }
                    };
                }

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const idsStr = myBlockedProfiles?.data?.myBlockedProfiles?.map((id) => id?.toString());
                const userHasBeenBlocked = idsStr?.includes(user?._id.toString());

                if (userHasBeenBlocked) {
                    return {
                        data: {},
                        pageInfo: {
                            message: 'error.blockedProfile_seeProfile',
                            success: false,
                            doRedirection: true
                        }
                    };
                }

                delete user.password;

                let data = {};
                if (!thread) {
                    data = {
                        ...user,
                        id: user?._id
                    };
                } else {
                    data = {
                        ...user,
                        id: user?._id,
                        unreadMessages: (thread?.unreadMessages?.length && thread.unreadMessages[0]?.count) || 0
                    };
                }

                return {
                    data: {
                        ...data,
                        hasPrivatePhotos: !!user?.images?.list?.find((image) => image?.album === 'private')
                    },
                    pageInfo: {
                        message: 'User successfully fetched',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching user");
            }
        },
        userPhotosThread: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                const totalCount = await UserPhotoThread
                    .find(filterMain)
                    .count();

                const userPhotos = await UserPhotoThread
                    .find(filterMain)
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit);

                return {
                    data: userPhotos,
                    pageInfo: {
                        message: 'User photos in thread successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching user photos in thread");
            }
        },
        thread: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter } = args;
            const { filterMain, filterRequestSentIfExist } = filter;

            try {
                const thread = await Thread
                    .findOne(filterMain)
                    .populate('author', '_id email displayName')
                    .populate('participants', '_id email images displayName');

                const participantsIdsAll = thread?.participants?.map((participant) => participant?.id);
                const participantsIdsFront = participantsIdsAll?.filter((participant) => (participant && (participant !== context?.userMeId)));
                const isBetweenTwoUsers = (participantsIdsFront?.length === 1);

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const idsStr = myBlockedProfiles?.data?.myBlockedProfiles?.map((id) => id?.toString());
                const participantsHasBeenBlocked = !!participantsIdsFront?.find((participant) => (participant && idsStr?.includes(participant)));

                // TODO handle blocked if more than two participants in thread
                if (isBetweenTwoUsers && participantsHasBeenBlocked) {
                    return {
                        data: {},
                        pageInfo: {
                            message: 'error.blockedProfile_seeThread',
                            success: false,
                            doRedirection: true
                        }
                    };
                }

                // Get request if exist:
                let request = null;
                if (filterRequestSentIfExist?.userMeId && isBetweenTwoUsers) {
                    request = await UserInterSendRequest
                        .findOne({
                            senderId: filterRequestSentIfExist.userMeId,
                            receiverId: participantsIdsFront[0]
                        })
                        .populate('sender', '_id');
                }

                const threadRes = thread || {};

                return {
                    data: {
                        id_: threadRes._id,
                        id: threadRes._id,
                        author: threadRes.author,
                        // participants: threadRes.participants,
                        participants: threadRes.participants?.map((participant) => {
                            return {
                                id: participant._id,
                                email: participant.email,
                                displayName: participant.displayName,
                                images: participant.images,
                                hasPrivatePhotos: !!participant.images?.list?.find((image) => image?.album === 'private')
                            }
                        }),
                        userInteractions: {
                            myRequest: {
                                sent: {
                                    id: request ? request._id : null
                                }
                            }
                        }
                    },
                    pageInfo: {
                        message: 'Thread successfully fetched',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching thread");
            }
        },
        threads: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain, filterCountUnread, filterUnread, filterOnline } = filter;

            try {
                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const filterMyBlockedProfiles = { 'full_participants._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

                /*
                const totalCount = await Thread
                    .find(filterMain)
                    .count();
                */

                const aggregate = [
                    { $match: filterMain },

                    // Left outer join on threadmessages:
                    {
                        $lookup: {
                            "from": "threadmessages",
                            "localField": "_id",
                            "foreignField": "threadId",
                            'pipeline': [
                                { '$sort': { 'createdAt': -1 } }
                            ],
                            "as": "messages"
                        }
                    },
                    { $unwind: "$messages" },
                    // { $unwind: { path: "$messages.readBy", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            "from": "threadmessages",
                            "localField": "_id",
                            "foreignField": "threadId",
                            pipeline: [
                                {
                                    $match: filterCountUnread
                                },
                                {
                                    "$group": {
                                        "_id": null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            "as": "unreadMessages"
                        }
                    }
                ];

                // Convert string to objectId :
                aggregate.push({
                    $addFields: {
                        participantsObjIds: {
                            $map: {
                                input: "$participants",
                                in: { $toObjectId: "$$this" }
                            }
                        }
                    }
                });

                // Left outer join on users:
                aggregate.push({
                    "$lookup": {
                        "from": "users",
                        "localField": "participantsObjIds",
                        "foreignField": "_id",
                        "as": "full_participants"
                    }
                });

                // Custom tabs filters:
                if (filterUnread) {
                    aggregate.push({ $match: filterUnread });
                } else if (filterOnline) {
                    // Find if participant 'isOnline':
                    aggregate.push({ $match: filterOnline }); // filterOnline use "full_participants"
                }

                aggregate.push({ $match: filterMyBlockedProfiles });

                aggregate.push({
                    "$group": {
                        "_id": "$_id",
                        "participants": { "$first": "$participants" },
                        // "full_participants": { "$first": "$full_participants" },
                        "latestMessage": { "$first": "$messages" },
                        "unreadMessages": { "$last": { "$arrayElemAt": [ "$unreadMessages.count", 0 ] }}
                    }
                });

                // Put it at the end:
                aggregate.push({
                    "$sort": { "latestMessage.createdAt": -1 }
                });

                const threadsRaw = await Thread
                    .aggregate(aggregate)
                    .skip(offset)
                    .limit(limit);

                const threads = await Thread.populate(threadsRaw, { path: 'participants', select: '_id email images displayName isOnline' });

                if (!threads || !threadsRaw) { return new Error("A error has occurred at the fetching threads"); }

                const totalCount = threads?.length;

                return {
                    data: threads,
                    pageInfo: {
                        message: 'Threads successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching threads");
            }
        },
        threadMessages: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                data,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;
            const { dataMain } = data;

            try {
                const totalCount = await ThreadMessage
                    .find(filterMain)
                    .count();

                // console.log(`- totalCount: ${totalCount} - isLastPage ${(offset + limit) >= totalCount} - offset: ${offset}`);

                const threadMessages = await ThreadMessage
                    .find(filterMain)
                    .populate('request', '_id senderId receiverId at privatePhotosGranted privatePhotosGrantedAt')
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit);

                const participantsIdsFront = dataMain?.participantsIdsFront;
                const isBetweenTwoUsers = (participantsIdsFront?.length === 1);

                const data = threadMessages?.map((threadMessage) => {
                    const message = threadMessage?.toObject();

                    // Check if message read by user front:
                    let received = false;
                    if (isBetweenTwoUsers
                        && message?.author && (message.author === context?.userMeId)
                        && !!message?.readBy?.find((by) => by?.user && (by.user === participantsIdsFront[0]))
                    ) {
                        received = true;
                    }

                    return { ...message, received };
                });

                return {
                    data,
                    pageInfo: {
                        message: 'Thread messages successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching Thread messages");
            }
        },
        likes: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                /*
                const totalCount = await UserInterSendLike
                    .find(filterMain)
                    .count();
                */

                // console.log(`- totalCount: ${totalCount} - isLastPage ${(offset + limit) >= totalCount} - offset: ${offset}`);

                const filterAll = {...filterMain};
                if (filterMain.senderId) { filterAll.senderId = mongoose.Types.ObjectId(filterMain.senderId) }
                if (filterMain.receiverId) { filterAll.receiverId = mongoose.Types.ObjectId(filterMain.receiverId) }

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

                const pipeline = [
                    {
                        $match: filterAll
                    },
                    ...populate(
                        {
                            as: 'sender', // output
                            from: 'users',
                            localField: 'senderId',
                            foreignField: '_id'
                        },
                        ['_id', 'images', 'email', 'displayName']
                    ),
                    {
                        $match: filterMyBlockedProfiles
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "doc": { "$first": "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { "newRoot": "$doc" }
                    }
                ];

                const likes = await UserInterSendLike
                    .aggregate(pipeline)
                    // .find(filterAll)
                    // .populate('sender', '_id images email displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                const totalCount = likes?.length;

                return {
                    data: likes?.map((data) => (
                        {
                            ...data,
                            id: data?._id,
                            entityName: data?.entityName || 'UserInterSendLike',
                            type: data?.type || 'heart'
                        }
                    )),
                    pageInfo: {
                        message: 'Likes successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching likes");
            }
        },
        visitors: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                /*
                const totalCount = await UserInterVisit
                    .find(filterMain)
                    .count();
                */

                const filterAll = {...filterMain};
                if (filterMain.senderId) { filterAll.senderId = mongoose.Types.ObjectId(filterMain.senderId) }
                if (filterMain.receiverId) { filterAll.receiverId = mongoose.Types.ObjectId(filterMain.receiverId) }

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

                const pipeline = [
                    {
                        $match: filterAll
                    },
                    ...populate(
                        {
                            as: 'sender', // output
                            from: 'users',
                            localField: 'senderId',
                            foreignField: '_id'
                        },
                        ['_id', 'images', 'email', 'displayName']
                    ),
                    {
                        $match: filterMyBlockedProfiles
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "doc": { "$first": "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { "newRoot": "$doc" }
                    }
                ];

                // console.log(`- totalCount: ${totalCount} - isLastPage ${(offset + limit) >= totalCount} - offset: ${offset}`);

                const visitorsRes = await UserInterVisit
                    .aggregate(pipeline)
                    // .find(filterMain)
                    // .populate('sender', '_id images email displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                const totalCount = visitorsRes?.length;

                return {
                    data: visitorsRes?.map((data) => (
                        {
                            ...data,
                            id: data?._id,
                            entityName: data?.entityName || 'UserInterVisit'
                        }
                    )),
                    pageInfo: {
                        message: 'Visitors successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching visitors");
            }
        },
        blockeds: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                const totalCount = await UserInterBlock
                    .find(filterMain)
                    .count();

                // console.log(`- totalCount: ${totalCount} - isLastPage ${(offset + limit) >= totalCount} - offset: ${offset}`);

                const blockedsRes = await UserInterBlock
                    .find(filterMain)
                    .populate('receiver', '_id images displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                return {
                    data: blockedsRes,
                    pageInfo: {
                        message: 'Blockeds successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching blockeds");
            }
        },
        requests: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                /*
                const totalCount = await UserInterSendRequest
                    .find(filterMain)
                    .count();
                */

                const filterAll = {...filterMain};
                if (filterMain.senderId) { filterAll.senderId = mongoose.Types.ObjectId(filterMain.senderId) }
                if (filterMain.receiverId) { filterAll.receiverId = mongoose.Types.ObjectId(filterMain.receiverId) }

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

                const pipeline = [
                    {
                        $match: filterAll
                    },
                    ...populate(
                        {
                            as: 'sender', // output
                            from: 'users',
                            localField: 'senderId',
                            foreignField: '_id'
                        },
                        ['_id', 'images', 'email', 'displayName']
                    ),
                    {
                        $match: filterMyBlockedProfiles
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "doc": { "$first": "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { "newRoot": "$doc" }
                    }
                ];

                const requestsRes = await UserInterSendRequest
                    .aggregate(pipeline)
                    // .find(filterMain)
                    // .populate('sender', '_id images email displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                const totalCount = requestsRes?.length;

                return {
                    data: requestsRes?.map((data) => (
                        {
                            ...data,
                            id: data?._id,
                            entityName: data?.entityName || 'UserInterSendRequest',
                            privatePhotosGranted: data?.privatePhotosGranted || 'null',
                        }
                    )),
                    pageInfo: {
                        message: 'Requests successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching requests");
            }
        },
        allPrimaryNotifications: async (parent, args, context, info) => {
            const haveGranted = checkHaveGranted(context, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            // Fetch Visitors + Followers

            const {
                filter,
                offset = 0,
                limit = defaultLimit
            } = args;

            const { filterMain } = filter;

            try {
                // const totalCountVisit = await UserInterVisit.find(filterMain).count();
                // const totalCountFollow = await UserInterFollow.find(filterMain).count();
                // const totalCount = (totalCountVisit || 0) + (totalCountFollow || 0);

                const filterAll = {...filterMain};
                if (filterMain.senderId) { filterAll.senderId = mongoose.Types.ObjectId(filterMain.senderId) }
                if (filterMain.receiverId) { filterAll.receiverId = mongoose.Types.ObjectId(filterMain.receiverId) }

                const myBlockedProfiles = await onGetMyBlockedProfiles(context?.userMeId);
                const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

                const pipeline = [
                    {
                        $match: filterAll
                    },
                    ...populate(
                        {
                            as: 'sender', // output
                            from: 'users',
                            localField: 'senderId',
                            foreignField: '_id'
                        },
                        ['_id', 'images', 'email', 'displayName']
                    ),
                    {
                        $match: filterMyBlockedProfiles
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "doc": { "$first": "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { "newRoot": "$doc" }
                    }
                ];

                const visits = await UserInterVisit
                    .aggregate(pipeline)
                    // .find(filterMain)
                    // .populate('sender', '_id images email displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                const follows = await UserInterFollow
                    .aggregate(pipeline)
                    // .find(filterMain)
                    // .populate('sender', '_id images email displayName')
                    .sort({ at: -1 })
                    .skip(offset)
                    .limit(limit);

                const mergedData = [
                    ...visits.map((data) => ({ ...data, id: data._id, entityName: data.entityName || 'UserInterVisit' })),
                    ...follows.map((data) => ({ ...data, id: data._id, entityName: data.entityName || 'UserInterFollow' }))
                ].sort((a, b) => new Date(b?.at) - new Date(a?.at));

                const totalCount = mergedData?.length;

                return {
                    data: mergedData,
                    pageInfo: {
                        message: 'All primary notifications successfully fetched',
                        success: true,
                        totalCount,
                        isLastPage: (offset + limit) >= totalCount
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at the fetching primary notifications");
            }
        }
    },
    // If resolver return null, see => https://stackoverflow.com/questions/56319137/why-does-a-graphql-query-return-null
    Mutation: {
        updateUser: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterUpdate } = filter;
            const { dataUpdate } = data;

            try {
                const updatedData = await User.findOneAndUpdate(filterUpdate, dataUpdate, { new: true });

                return {
                    updatedData,
                    updatedPageInfo: {
                        message: 'User updated successfully',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at updated user");
            }
        },
        updateUserPhoto: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterUpdate } = filter;
            const { dataUpdate } = data;
            const { state, fileId, filesUrls, selectedAlbum, isForwardItemSelected, metaDataUpdate } = dataUpdate || {};
            // fileId.selected;
            // fileId.next;

            const checkIfNeedSetMainId = (images) => {
                const haveMainId = !!images?.forwardFileId;
                const haveAtLeastOnePublic = images?.list.some((l) => l?.album === 'public');

                return !(haveMainId && haveAtLeastOnePublic);
            }

            const updatedOrAddedImage = {
                fileId: fileId?.next,
                ...filesUrls,
                provider: 'local',
                album: selectedAlbum || 'public'
            };

            try {
                let updatedUser = null;
                let dataToUpdate = {};

                switch (state) {
                    case 'add':
                        dataToUpdate.$push = { 'images.list': updatedOrAddedImage };

                        if (updatedOrAddedImage.album === 'public') {
                            // Check if already have main photo:
                            const userToUpdate = await User.findOne(filterUpdate);
                            const needSetMain = checkIfNeedSetMainId(userToUpdate?.images);
                            // const isFirstPublicUpload = !userToUpdate?.images?.forwardFileId;

                            if (isForwardItemSelected || needSetMain) {
                                // We set the uploaded file as forward:
                                dataToUpdate.$set = { 'images.forwardFileId': fileId.next };
                            }
                        }

                        // Update entity:
                        updatedUser = await User
                            .findOneAndUpdate(filterUpdate, dataToUpdate, { new: true })
                            .select('images');

                        return {
                            updatedData: {
                                user: updatedUser,
                                updatedOrAddedImage
                            },
                            updatedPageInfo: {
                                message: 'User photo updated successfully',
                                success: true
                            }
                        };
                    case 'update':
                        // Replace existing file:
                        const filterUser = { ...filterUpdate, 'images.list': { $elemMatch: { fileId: fileId.selected } } };
                        dataToUpdate.$set = { 'images.list.$': updatedOrAddedImage };

                        if (updatedOrAddedImage.album === 'public') {
                            // Check if already have main photo:
                            const userToUpdate = await User.findOne(filterUpdate);
                            const needSetMain = checkIfNeedSetMainId(userToUpdate?.images);
                            // const isFirstPublicUpload = !userToUpdate?.images?.forwardFileId;

                            if (isForwardItemSelected || needSetMain) {
                                // We set the uploaded file as forward:
                                dataToUpdate.$set = {
                                    'images.forwardFileId': fileId.next,
                                    ...dataToUpdate.$set
                                };
                            }
                        }

                        // Update entity:
                        updatedUser = await User
                            .findOneAndUpdate(
                                filterUser,
                                dataToUpdate,
                                { new: true }
                            )
                            .select('images');

                        return {
                            updatedData: {
                                user: updatedUser,
                                updatedOrAddedImage
                            },
                            updatedPageInfo: {
                                message: 'User photo updated successfully',
                                success: true
                            }
                        };
                    case 'delete':
                        const userWithFileFound = await User.findOne(filterUpdate);

                        if (userWithFileFound) {
                            dataToUpdate.$pull = { 'images.list': { fileId: fileId.selected } }; // Delete element in array

                            // If file forward deleted, we set the first file found in the list, if exist, as forward:
                            if (isForwardItemSelected) {
                                const imageToReplace = userWithFileFound?.images?.list?.find((list) => {
                                    return (
                                        list?.fileId !== userWithFileFound?.images?.forwardFileId // Find a image who is not the forward
                                        && list?.fileId !== fileId.selected
                                        && list?.album === 'public' // And who is in public
                                    );
                                });

                                dataToUpdate.$set = {
                                    'images.forwardFileId': imageToReplace?.fileId || null
                                };
                            }

                            // Update entity:
                            updatedUser = await User.findOneAndUpdate(
                                filterUpdate,
                                dataToUpdate,
                                { new: true })
                                .select('images');

                            console.log('File deleted successfully');

                            return {
                                updatedData: {
                                    user: updatedUser,
                                    updatedOrAddedImage
                                },
                                updatedPageInfo: {
                                    message: 'User photo deleted successfully',
                                    success: true
                                }
                            };
                        } else {
                            return {
                                updatedData: {
                                    user: null,
                                    updatedOrAddedImage
                                },
                                updatedPageInfo: {
                                    message: 'A error has occurred at deleting user photo',
                                    success: false
                                }
                            };
                        }
                    case 'updateMetaData':
                        dataToUpdate = metaDataUpdate || {};

                        // Check if already have main photo:
                        const userToUpdate = await User.findOne(filterUpdate);
                        const needSetMain = checkIfNeedSetMainId(userToUpdate?.images);

                        if (selectedAlbum === 'public') {
                            if (isForwardItemSelected || needSetMain) {
                                // We set the uploaded file as forward:
                                dataToUpdate.$set = {
                                    'images.forwardFileId': fileId.next,
                                    ...dataToUpdate.$set
                                };
                            }
                        }

                        // Update entity:
                        updatedUser = await User
                            .findOneAndUpdate(
                                filterUpdate,
                                dataToUpdate,
                                { new: true }
                            )
                            .select('images');

                        return {
                            updatedData: {
                                user: updatedUser,
                                updatedOrAddedImage
                            },
                            updatedPageInfo: {
                                message: 'User photo updated successfully',
                                success: true
                            }
                        };
                    default:
                        return {
                            updatedData: {},
                            updatedPageInfo: {
                                message: 'A error has occurred at updated user photo',
                                success: false
                            }
                        };
                }
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at updated user photo");
            }
        },
        updateRequest: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterUpdate } = filter;
            const { dataUpdate } = data;

            try {
                const updatedData = await UserInterSendRequest.findOneAndUpdate(filterUpdate, dataUpdate, { new: true });

                return {
                    updatedData,
                    updatedPageInfo: {
                        message: 'Requests successfully updated',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at updateRequest");
            }
        },
        createThread: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { data } = body;
            const { dataMain } = data;

            const thread = new Thread(dataMain);
            const participants = thread?.participants;
            const filter = { participants: { $all: participants } };

            try {
                // Check if thread don't already exist:
                const existingThread = await Thread.findOne(filter);

                if (existingThread) {
                    return {
                        updatedData: existingThread,
                        updatedPageInfo: {
                            message: 'Thread already exist',
                            success: true
                        }
                    };
                }

                const updatedData = await thread.save();

                // Handle population cases:
                /*
                const updatedData = await Thread
                    .findOne({ participants: { $all: updatedData.participants } })
                    .populate('author', '_id email')
                    .populate('participants', '_id email');
                */

                return {
                    updatedData,
                    updatedPageInfo: {
                        message: 'New thread successfully created',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at creating new thread");
            }
        },
        createThreadMessage: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { data } = body;
            const { dataMain, dataUserPhoto } = data;

            dataMain.sent = true;

            try {
                const threadMessage = new ThreadMessage(dataMain);
                const threadMessageRes = await threadMessage.save();

                // If new message is image, save it in UserPhotoThread:
                if (threadMessageRes?.image && dataUserPhoto?.isNewUploadedFile) {
                    const existingUserPhotoThread = await UserPhotoThread.findOne({ fileId: dataUserPhoto?.fileId });

                    if (!existingUserPhotoThread) {
                        const userPhotoThread = {
                            messageId: threadMessageRes.id,
                            authorId: threadMessageRes.author,
                            threadId: threadMessageRes.threadId,
                            createdAt: threadMessageRes.createdAt,
                            size_130_130: dataUserPhoto?.size_130_130,
                            size_320_400: dataUserPhoto?.size_320_400,
                            fileId: dataUserPhoto?.fileId
                        };

                        const userPhoto = new UserPhotoThread(userPhotoThread);
                        await userPhoto.save();
                    }
                }

                /* for population :
                return ThreadMessage
                    .findOne({ _id: threadMessageRes._id })
                    .then((res, err) => {
                        if (err) { return new Error("A error happen at the creating new message"); }
                        return res;
                    });
                */

                return {
                    updatedData: threadMessageRes,
                    updatedPageInfo: {
                        message: 'New message successfully created',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at creating new message");
            }
        },
        setMessagesAsRead: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterSetAsRead } = filter;
            const { dataSetAsRead } = data;

            try {
                const threadMessages = await ThreadMessage.updateMany(filterSetAsRead, dataSetAsRead);

                return {
                    updatedData: true,
                    updatedPageInfo: {
                        message: 'Thread messages successfully set as read',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at setMessagesAsRead");
            }
        },
        setLikesAsSeen: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterSetAsSeen } = filter;
            const { dataSetAsSeen } = data;

            try {
                await UserInterSendLike.updateMany(filterSetAsSeen, dataSetAsSeen);

                return {
                    updatedData: true,
                    updatedPageInfo: {
                        message: 'Like successfully set as seen',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at setLikesAsSeen");
            }
        },
        setVisitorsAsSeen: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterSetAsSeen } = filter;
            const { dataSetAsSeen } = data;

            try {
                await UserInterVisit.updateMany(filterSetAsSeen, dataSetAsSeen);

                return {
                    updatedData: true,
                    updatedPageInfo: {
                        message: 'Visits successfully set as seen',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at setVisitorsAsSeen");
            }
        },
        setPrimaryNotificationsAsSeen: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterSetAsSeen } = filter;
            const { dataSetAsSeen } = data;

            try {
                await UserInterVisit.updateMany(filterSetAsSeen, dataSetAsSeen);
                await UserInterFollow.updateMany(filterSetAsSeen, dataSetAsSeen);

                return {
                    updatedData: true,
                    updatedPageInfo: {
                        message: 'Primary notifications successfully set as seen',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at setPrimaryNotificationsAsSeen");
            }
        },
        setRequestsAsSeen: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterSetAsSeen } = filter;
            const { dataSetAsSeen } = data;

            try {
                await UserInterSendRequest.updateMany(filterSetAsSeen, dataSetAsSeen);

                return {
                    updatedData: true,
                    updatedPageInfo: {
                        message: 'Requests successfully set as seen',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at setRequestsAsSeen");
            }
        },
        sendLike: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { data } = body;
            const { dataMain } = data;

            try {
                const filterForLikeSent = {
                    senderId: mongoose.Types.ObjectId(dataMain.senderId),
                    receiverId: mongoose.Types.ObjectId(dataMain.receiverId)
                };
                const filterForLikeReceived = {
                    senderId: mongoose.Types.ObjectId(dataMain.receiverId),
                    receiverId: mongoose.Types.ObjectId(dataMain.senderId)
                };
                const likeSentIfExist = await UserInterSendLike.findOne(filterForLikeSent);
                const likeReceivedIfExist = await UserInterSendLike.findOne(filterForLikeReceived);

                // console.log('likeSentIfExist ', likeSentIfExist);
                // console.log('likeReceivedIfExist ', likeReceivedIfExist);

                // Remove like:
                if (likeSentIfExist) {
                    await UserInterSendLike.deleteOne(filterForLikeSent);

                    if (likeReceivedIfExist) {
                        await UserInterSendLike.findOneAndUpdate(filterForLikeReceived, { isMutual: false });
                    }

                    return {
                        updatedData: {},
                        updatedPageInfo: {
                            message: 'Like successfully deleted',
                            success: true
                        }
                    };
                }

                // It's a match:
                if (likeReceivedIfExist) {
                    // If mutual, update "isMutual" for receiver:
                    await UserInterSendLike.findOneAndUpdate(filterForLikeReceived, { isMutual: true });
                }

                const like = new UserInterSendLike({ ...dataMain, isMutual: !!likeReceivedIfExist });
                const likeRes = await like.save();

                return {
                    updatedData: likeRes,
                    updatedPageInfo: {
                        message: 'Like successfully send',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at send like");
            }
        },
        sendRequest: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { filter, data } = body;
            const { filterForCreateThread } = filter;
            const { dataMain, dataForCreateThread } = data;

            try {
                const filterForRequestSent = {
                    senderId: mongoose.Types.ObjectId(dataMain.senderId),
                    receiverId: mongoose.Types.ObjectId(dataMain.receiverId)
                };
                const requestSentIfExist = await UserInterSendRequest.findOne(filterForRequestSent);
                // console.log('requestSentIfExist ', requestSentIfExist);

                // Remove request:
                if (requestSentIfExist) {
                    // await UserInterSendRequest.deleteOne(filterForRequestSent);

                    return {
                        updatedData: requestSentIfExist,
                        updatedPageInfo: {
                            message: 'Request already sent',
                            success: true
                        }
                    };
                }

                const request = new UserInterSendRequest(dataMain);
                const requestRes = await request.save();

                // ------------------- create new ThreadMessage with field 'requestId' -------------------
                let thread = await Thread.findOne(filterForCreateThread);
                // console.log('thread found ', thread);

                let isNewThread = false;
                if (!thread) {
                    const threadToCreate = new Thread(dataForCreateThread);
                    thread = await threadToCreate.save();
                    isNewThread = true;
                    // console.log('thread create ', thread);
                }

                // Add field 'participantsWhoSentRequestsPrivatePhotos' if needed:
                /*
                const meId = dataForCreateThread?.$push?.participantsWhoSentRequestsPrivatePhotos;
                if (!thread?.participantsWhoSentRequestsPrivatePhotos?.find((reqId) => reqId && (reqId === meId))) {
                    thread = await Thread.findOneAndUpdate(filterForCreateThread, { $push: dataForCreateThread?.$push });
                }
                */

                const data = {
                    author: dataMain.senderId,
                    requestId: requestRes._id,
                    threadId: thread._id,
                    createdAt: new Date(),
                    sent: true
                }

                // console.log('data ', data);

                const threadMessageToCreate = new ThreadMessage(data);
                const threadMessageRes = await threadMessageToCreate.save();
                // console.log('message ===> ', threadMessageRes);
                // -------------------  -------------------

                return {
                    updatedData: {
                        _id: requestRes?._id,
                        id: requestRes?._id,
                        entityName: requestRes?.entityName,
                        senderId: requestRes?.senderId,
                        receiverId: requestRes?.receiverId,
                        at: requestRes?.at,
                        isSeenByReceiver: requestRes?.isSeenByReceiver,
                        privatePhotosGranted: requestRes?.privatePhotosGranted,
                        privatePhotosGrantedAt: requestRes?.privatePhotosGrantedAt,
                        sender: requestRes?.sender,
                        receiver: requestRes?.receiver,
                        threadId: thread._id,
                        isNewThread
                    },
                    updatedPageInfo: {
                        message: 'Request successfully send',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at send request");
            }
        },
        toVisit: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { data } = body;
            const { dataMain } = data;

            try {
                const filterForVisitSent = {
                    senderId: mongoose.Types.ObjectId(dataMain.senderId),
                    receiverId: mongoose.Types.ObjectId(dataMain.receiverId)
                };
                const visitSentIfExist = await UserInterVisit.findOne(filterForVisitSent);

                let visitRes;
                let hasAlreadyInteracted = false;
                if (visitSentIfExist) {
                    hasAlreadyInteracted = true;
                    visitRes = await UserInterVisit.findOneAndUpdate(filterForVisitSent, { at: dataMain.at, isSeenByReceiver: false }, { new: true });
                } else {
                    const visit = new UserInterVisit(dataMain);
                    visitRes = await visit.save();
                }

                return {
                    updatedData: {
                        id: visitRes._id,
                        senderId: visitRes.senderId,
                        receiverId: visitRes.receiverId,
                        at: visitRes.at,
                        isSeenByReceiver: visitRes.isSeenByReceiver,
                        entityName: visitRes.entityName,
                        hasAlreadyInteracted
                    },
                    updatedPageInfo: {
                        message: 'Visit successfully done',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at visit");
            }
        },
        toFollow: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const { data } = body;
            const { dataMain } = data;

            try {
                const filterForFollowSent = {
                    senderId: mongoose.Types.ObjectId(dataMain.senderId),
                    receiverId: mongoose.Types.ObjectId(dataMain.receiverId)
                };
                const followSentIfExist = await UserInterFollow.findOne(filterForFollowSent);

                // Remove follow:
                if (followSentIfExist) {
                    await UserInterFollow.deleteOne(filterForFollowSent);

                    return {
                        updatedData: {},
                        updatedPageInfo: {
                            message: 'Follow successfully deleted',
                            success: true
                        }
                    };
                }

                const follow = new UserInterFollow(dataMain);
                const followRes = await follow.save();

                return {
                    updatedData: followRes,
                    updatedPageInfo: {
                        message: 'Follow successfully done',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at set follow");
            }
        },
        toBlock: async (_, body, params) => {
            const haveGranted = checkHaveGranted(params, { isAuthenticate: true });
            if (!haveGranted) { return null; }

            const {
                data = {},
                filter = {}
            } = body;

            const { filterUnblock } = filter;
            const { dataMain } = data;

            try {
                // Do unblock:
                if (filterUnblock) {
                    await UserInterBlock.deleteOne(filterUnblock);

                    return {
                        updatedData: {},
                        updatedPageInfo: {
                            message: 'Block successfully deleted',
                            success: true
                        }
                    };
                }

                const filterForBlockSent = {
                    senderId: mongoose.Types.ObjectId(dataMain.senderId),
                    receiverId: mongoose.Types.ObjectId(dataMain.receiverId)
                };
                const blockSentIfExist = await UserInterBlock.findOne(filterForBlockSent);

                // If already exist:
                if (blockSentIfExist) {
                    return {
                        updatedData: {},
                        updatedPageInfo: {
                            message: 'Block already recorded',
                            success: true
                        }
                    };
                }

                const block = new UserInterBlock(dataMain);
                const blockRes = await block.save();

                return {
                    updatedData: blockRes,
                    updatedPageInfo: {
                        message: 'Block successfully done',
                        success: true
                    }
                };
            } catch (err) {
                console.error('Err => ', err);
                return new Error("A error has occurred at create new block");
            }
        }
    }
};
