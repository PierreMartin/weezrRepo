import { assertAuthenticated } from "./authorizationMiddleware";
import { UserInterBlock } from "../models/userInterBlock";
import mongoose from "mongoose";

const defaultLimit = 1000;

/**
 * POST /api/me/profile
 */
export function getMeProfile(req, res, next) {
    assertAuthenticated(req, res, next, 'me profile', (userRes) => {
        const user = userRes.toObject();
        delete user.password;

        return res.status(200).json({
            message: 'Get profile succeeded',
            // TODO:
            // message: undefined,
            // infoPage: { message: 'Profile successfully fetched', success: true }
            data: {
                authenticatedState: 'connected',
                me: user
            }
        });
    });
}

export async function onGetMyBlockedProfiles(userMeId) {
    if (!userMeId) {
        return { message: 'A error has occurred at the fetching blocked profiles - no userMeId' };
    }

    const filterMyBlockedProfiles = {
        $or: [
            { receiverId: mongoose.Types.ObjectId(userMeId) },
            { senderId: mongoose.Types.ObjectId(userMeId) }
        ]
    };

    try {
        const totalCount = await UserInterBlock
            .find(filterMyBlockedProfiles)
            .count();

        const blocksRes = await UserInterBlock
            .find(filterMyBlockedProfiles);

        const myBlockedProfiles = blocksRes
            ?.map((block) => {
                if (userMeId === block.receiverId?.toString()) {
                    return block?.senderId;
                } else if (userMeId === block.senderId?.toString()) {
                    return block?.receiverId;
                }
            })
            ?.filter((block) => block);

        // console.log(' myBlockedProfiles ', myBlockedProfiles);

        return {
            pageInfo: {
                message: 'My blocked profiles successfully fetched',
                success: true,
                totalCount
            },
            data: {
                myBlockedProfiles
            }
        };
    } catch (err) {
        console.error('A error has occurred at the fetching blocked profiles => ', err);
        return { message: 'A error has occurred at the fetching blocked profiles' };
    }
}

/**
 * POST /api/me/myblockedprofiles
 */
export function getMyBlockedProfiles(req, res, next) {
    assertAuthenticated(req, res, next, 'getMyBlockedProfiles', async (userRes) => {
        const user = userRes.toObject();
        // const { filterMain } = req.body;
        const userMeId = user?._id?.toString();

        const resGetMyBlockedProfiles = await onGetMyBlockedProfiles(userMeId);
        const statusCode = resGetMyBlockedProfiles?.pageInfo?.success ? 200 : 500;

        return res.status(statusCode).json(resGetMyBlockedProfiles);
    });
}
