// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { gql, useMutation } from "@apollo/client";
import { connect } from "react-redux";
import { Button, Icon } from 'native-base';
import { SocketEvents } from "../../context/SocketEvents";
import { IUser, IUserInteraction, IUserInteractions } from "../../entities";
import { States } from "../../reduxReducers/states";

export interface IToFollow {
    me?: IUser;
    myFollow: IUserInteractions;
    userFront: IUser;
    onSetStateAtSubmit: (userInterFollow: IUserInteraction) => void;
}

export const TO_FOLLOW = gql`
    mutation ($data: UserInterFollow_Data) {
        toFollow(data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData {
                id
                entityName
                at
                receiverId
                senderId
                isSeenByReceiver
            }
        }
    }
`;

export const onToFollow = ({
    toFollow,
    me,
    userFront,
    onSetStateAtSubmit,
    socketEvents,
    prevInteractionId
}: any) => {
    toFollow({
        variables: {
            data: {
                dataMain: {
                    senderId: me?._id,
                    receiverId: userFront?.id,
                    at: new Date()
                }
            }
        }
    }).then((res: any) => {
        const userInterToFollow = res?.data?.toFollow?.updatedData as IUserInteraction;

        if (onSetStateAtSubmit) { onSetStateAtSubmit(userInterToFollow); }

        // socketEvents.emit.newFollow()
        socketEvents.emit.newPrimaryNotification({
            ...userInterToFollow,
            id: userInterToFollow?.id || prevInteractionId,
            entityName: 'UserInterFollow',
            receiverId: userInterToFollow?.receiverId || userFront?.id,
            senderId: userInterToFollow?.senderId || me?._id,
            isRemoved: !userInterToFollow?.id,
            sender: { // Mock population MongoDB:
                id: userInterToFollow?.senderId || me?._id,
                images: me?.images,
                displayName: me?.displayName,
                email: me?.email
            } as IUser
        });

        if (userInterToFollow?.id) {
            // TODO Display toast add
        } else {
            // TODO Display toast remove
        }
    });
};

const ToFollow = (props: IToFollow) => {
    const {
        me,
        myFollow,
        userFront,
        onSetStateAtSubmit
    } = props;

    const [toFollow, { error: toFollowError }] = useMutation(TO_FOLLOW, {
        update: (cache, data: any) => {
            const { updatedData } = data?.data?.toFollow;
            const { id } = updatedData || {};

            // If deleted:
            if (!id) {
                cache.evict({ fieldName: 'users', broadcast: false });
                cache.gc();
            }
        }
    });
    const socketEvents = React.useContext(SocketEvents);

    if (toFollowError) {
        // TODO Display toast
        console.error(toFollowError);
    }

    const prevInteractionId = myFollow?.sent?.id;
    const followSentIconStr = prevInteractionId ? 'star' : 'star-outline';

    return (
        <Button
            leftIcon={<Icon as={Ionicons} name={followSentIconStr} size="lg" />}
            onPress={() => {
                onToFollow({
                    toFollow,
                    me,
                    userFront,
                    onSetStateAtSubmit,
                    socketEvents,
                    prevInteractionId
                });
            }}
        />
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(ToFollow);
