// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { gql, useMutation } from "@apollo/client";
import { connect } from "react-redux";
import { Button, Icon } from 'native-base';
import { SocketEvents } from "../../context/SocketEvents";
import { IUser, IUserInteraction, IUserInteractions } from "../../entities";
import { States } from "../../reduxReducers/states";

export interface ISendRequest {
    me?: IUser;
    from?: string;
    myRequest: IUserInteractions;
    participantsIds: any[];
    userFront: IUser;
    onSetStateAtSubmit: (userInterSendRequest: IUserInteraction) => void;
}

export const SEND_REQUEST = gql`
    mutation ($filter: UserInterSendRequest_Filter, $data: UserInterSendRequest_Data) {
        sendRequest(filter: $filter, data: $data) {
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
                privatePhotosGranted
                threadId
                isNewThread
            }
        }
    }
`;

export const onSendRequest = ({
    sendRequest,
    participantsIds,
    me,
    userFront,
    onSetStateAtSubmit,
    socketEvents,
    prevInteractionId
}: any) => {
    sendRequest({
        variables: {
            filter: {
                filterForCreateThread: { participants: { $all: participantsIds } }
            },
            data: {
                dataMain: {
                    senderId: me?._id,
                    receiverId: userFront?.id,
                    at: new Date()
                },
                dataForCreateThread: {
                    participants: participantsIds,
                    author: me?._id,
                    // $push: { participantsWhoSentRequestsPrivatePhotos: me?._id }
                }
            }
        }
    }).then((res: any) => {
        const userInterSendRequest = res?.data?.sendRequest?.updatedData as IUserInteraction;

        if (onSetStateAtSubmit) { onSetStateAtSubmit(userInterSendRequest); }

        socketEvents.emit.newRequest({
            ...userInterSendRequest,
            id: userInterSendRequest?.id || prevInteractionId,
            receiverId: userInterSendRequest?.receiverId || userFront?.id,
            senderId: userInterSendRequest?.senderId || me?._id,
            isRemoved: !userInterSendRequest?.id,
            sender: { // Mock population MongoDB:
                id: userInterSendRequest?.senderId || me?._id,
                images: me?.images,
                displayName: me?.displayName,
                email: me?.email
            } as IUser
        });

        if (userInterSendRequest?.id) {
            // TODO Display toast add
        } else {
            // TODO Display toast remove
        }
    });
};

const SendRequest = (props: ISendRequest) => {
    const {
        me,
        myRequest,
        participantsIds,
        userFront,
        onSetStateAtSubmit
    } = props;

    const [sendRequest, { error: sendRequestError }] = useMutation(SEND_REQUEST);
    const socketEvents = React.useContext(SocketEvents);
    const prevInteractionId = myRequest?.sent?.id;

    if (sendRequestError) {
        // TODO Display toast
        console.error(sendRequestError);
    }

    let requestSentIconStr = 'images-outline';
    if (prevInteractionId) {
        requestSentIconStr = 'time';
        if (myRequest?.sent?.privatePhotosGranted === 'granted') { requestSentIconStr = 'lock-open'; }
    }

    return (
        <Button
            leftIcon={<Icon as={Ionicons} name={requestSentIconStr} size="lg" />}
            onPress={() => {
                if (!myRequest?.sent?.id) {
                    onSendRequest({
                        sendRequest,
                        participantsIds,
                        me,
                        userFront,
                        onSetStateAtSubmit,
                        socketEvents,
                        prevInteractionId
                    });
                }
            }}
            // style={styles.button}
        />
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(SendRequest);
