import mongoose from "mongoose";
import { assertAuthenticated } from "./authorizationMiddleware";
import { Thread } from "../models/thread";
import { ThreadMessage } from "../models/threadMessage";
import { UserInterSendLike } from "../models/userInterSendLike";
import { UserInterVisit } from "../models/userInterVisit";
import { UserInterSendRequest } from "../models/userInterSendRequest";
import { UserInterFollow } from "../models/userInterFollow";
import { onGetMyBlockedProfiles } from "./users";
import { populate } from "../graphQl/resolvers";

const defaultLimit = 1000;

/**
 * POST /api/countallunreadmessages
 */
export async function getCountAllUnreadMessages(req, res, next) {
    assertAuthenticated(req, res, next, 'getCountAllUnreadMessages', async (userRes) => {
        const filter = req.body;
        // 1) Get all threadIds of Me
        // 2) Find all unread messages

        try {
            const userMeId = userRes?._id?.toString();
            const myBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
            const myBlockedProfilesStringify = myBlockedProfiles?.data?.myBlockedProfiles?.map((id) => id?.toString());

            const threadIds = await Thread.find({ participants: { $in: [filter.userId] } }).distinct('_id');

            const pipeline = [
                {
                    $match:
                        {
                            threadId: { $in: threadIds },
                            'readBy.user': { $ne: filter.userId },
                            author: { $ne: filter.userId }
                        }
                },
                ...populate(
                    {
                        as: 'thread', // output
                        from: 'threads',
                        localField: 'threadId',
                        foreignField: '_id'
                    },
                    ['_id', 'participants']
                ),
                {
                    $match: { 'thread.participants': { $nin: myBlockedProfilesStringify || [] } }
                },
                { $limit : defaultLimit },
                {
                    $group:
                        {
                            // _id: '$threadId',
                            _id: null,
                            count: { $sum: 1 }
                        }
                }
            ];

            const unreadMessages = await ThreadMessage.aggregate(pipeline);
            const countAllUnreadMessages = unreadMessages?.length ? unreadMessages[0].count : 0;

            return res.status(200).json({ message: 'Unread messages fetched', data: { countAllUnreadMessages } });
        } catch (err) {
            console.error('Err => ', err);
            return res.status(500).json({ message: 'Something went wrong getting all unread messages' });
        }
    });
}

/**
 * POST /api/countallnotseenlikes
 */
export async function getCountAllNotSeenLikes(req, res, next) {
    assertAuthenticated(req, res, next, 'getCountAllNotSeenLikes', async (userRes) => {
        const filter = req.body;

        try {
            const userMeId = userRes?._id?.toString();
            const myBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
            const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

            const pipeline = [
                {
                    $match:
                        {
                            receiverId: mongoose.Types.ObjectId(filter.userId),
                            isSeenByReceiver: { $ne: true }
                        }
                },
                ...populate(
                    {
                        as: 'sender', // output
                        from: 'users',
                        localField: 'senderId',
                        foreignField: '_id'
                    },
                    ['_id']
                ),
                {
                    $match: filterMyBlockedProfiles
                },
                { $limit : defaultLimit },
                {
                    $group:
                        {
                            _id: null,
                            count: { $sum: 1 }
                        }
                }
            ];

            const notSeenLikes = await UserInterSendLike.aggregate(pipeline);
            const countAllNotSeenLikes = notSeenLikes?.length ? notSeenLikes[0].count : 0;

            return res.status(200).json({ message: 'Not seen likes fetched', data: { countAllNotSeenLikes } });
        } catch (err) {
            console.error('Err => ', err);
            return res.status(500).json({ message: 'Something went wrong getting all not seen likes' });
        }
    });
}

/**
 * POST /api/countallnotseenvisitors
 */
export async function getCountAllNotSeenVisitors(req, res, next) {
    assertAuthenticated(req, res, next, 'getCountAllNotSeenVisitors', async (userRes) => {
        const filter = req.body;

        try {
            const userMeId = userRes?._id?.toString();
            const myBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
            const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

            const pipeline = [
                {
                    $match:
                        {
                            receiverId: mongoose.Types.ObjectId(filter.userId),
                            isSeenByReceiver: { $ne: true }
                        }
                },
                ...populate(
                    {
                        as: 'sender', // output
                        from: 'users',
                        localField: 'senderId',
                        foreignField: '_id'
                    },
                    ['_id']
                ),
                {
                    $match: filterMyBlockedProfiles
                },
                { $limit : defaultLimit },
                {
                    $group:
                        {
                            _id: null,
                            ids: { $push: "$_id" },
                            count: { $sum: 1 }
                        }
                }
            ];

            const notSeenVisits = await UserInterVisit.aggregate(pipeline);

            return res.status(200).json({
                message: 'Not seen visitors fetched',
                data: {
                    countAllNotSeenVisitors: notSeenVisits?.length ? notSeenVisits[0].count : 0,
                    idsAllNotSeenVisitors: notSeenVisits?.length ? notSeenVisits[0].ids : []
                }
            });
        } catch (err) {
            console.error('Err => ', err);
            return res.status(500).json({ message: 'Something went wrong getting all not seen visitors' });
        }
    });
}

/**
 * POST /api/countallnotseenrequests
 */
export async function getCountAllNotSeenRequests(req, res, next) {
    assertAuthenticated(req, res, next, 'getCountAllNotSeenRequests', async (userRes) => {
        const filter = req.body;

        try {
            const userMeId = userRes?._id?.toString();
            const myBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
            const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

            const pipeline = [
                {
                    $match:
                        {
                            receiverId: mongoose.Types.ObjectId(filter.userId),
                            isSeenByReceiver: { $ne: true }
                        }
                },
                ...populate(
                    {
                        as: 'sender', // output
                        from: 'users',
                        localField: 'senderId',
                        foreignField: '_id'
                    },
                    ['_id']
                ),
                {
                    $match: filterMyBlockedProfiles
                },
                { $limit : defaultLimit },
                {
                    $group:
                        {
                            _id: null,
                            // ids: { $push: "$_id" },
                            count: { $sum: 1 }
                        }
                }
            ];

            const notSeenRequests = await UserInterSendRequest.aggregate(pipeline);

            return res.status(200).json({
                message: 'Not seen requests fetched',
                data: {
                    countAllNotSeenRequests: notSeenRequests?.length ? notSeenRequests[0].count : 0
                }
            });
        } catch (err) {
            console.error('Err => ', err);
            return res.status(500).json({ message: 'Something went wrong getting all not seen requests' });
        }
    });
}

/**
 * POST /api/countallnotseenprimarynotifications
 */
export async function getCountAllNotSeenPrimaryNotifications(req, res, next) {
    assertAuthenticated(req, res, next, 'getCountAllNotSeenPrimaryNotifications', async (userRes) => {
        const filter = req.body;

        try {
            const userMeId = userRes?._id?.toString();
            const myBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
            const filterMyBlockedProfiles = { 'sender._id': { $nin: myBlockedProfiles?.data?.myBlockedProfiles || [] } };

            const pipeline = [
                {
                    $match:
                        {
                            receiverId: mongoose.Types.ObjectId(filter.userId),
                            isSeenByReceiver: { $ne: true }
                        }
                },
                ...populate(
                    {
                        as: 'sender', // output
                        from: 'users',
                        localField: 'senderId',
                        foreignField: '_id'
                    },
                    ['_id']
                ),
                {
                    $match: filterMyBlockedProfiles
                },
                { $limit : defaultLimit },
                {
                    $group:
                        {
                            _id: null,
                            ids: { $push: "$_id" },
                            count: { $sum: 1 }
                        }
                }
            ];

            const visitorsRes = await UserInterVisit.aggregate(pipeline);
            const followersRes = await UserInterFollow.aggregate(pipeline);

            const idsAllNotSeenVisitors = visitorsRes?.length ? visitorsRes[0].ids : [];
            const countAllNotSeenVisitors = visitorsRes?.length ? visitorsRes[0].count : 0;
            const countAllNotSeenFollowers = followersRes?.length ? followersRes[0].count : 0;

            return res.status(200).json({
                message: 'Not seen primary notifications fetched',
                data: {
                    idsAllNotSeenVisitors,
                    countAllNotSeenVisitors,
                    countAllNotSeenFollowers,
                    countAllNotSeenPrimaryNotifications: (countAllNotSeenVisitors || 0) + (countAllNotSeenFollowers || 0)
                }
            });
        } catch (err) {
            console.error('Err => ', err);
            return res.status(500).json({ message: 'Something went wrong getting all not seen primary notifications' });
        }
    });
}
