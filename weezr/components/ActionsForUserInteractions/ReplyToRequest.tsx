// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { gql, useMutation } from "@apollo/client";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Box, Button, Icon } from 'native-base';
import { useTranslation } from "react-i18next";
import { SocketEvents } from "../../context/SocketEvents";
import { setCountAllNotSeenRequestsAction } from "../../reduxActions/notifications";
import { IUser, IUserInteraction } from "../../entities";
import { States } from "../../reduxReducers/states";

export interface IReplyToRequest {
    myRequest: any;
    readOnly?: boolean;
    fieldId: string; // requestId
    threadId?: string;
    style?: any;
    me: IUser;
    setCountAllNotSeenRequestsActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    countAllNotSeenRequests: number;
    onSetStateAtSubmit: (updatedData: IUserInteraction) => void;
}

const SET_REQUESTS_AS_SEEN = gql`
    mutation ($filter: UserInterSendRequest_Filter, $data: UserInterSendRequest_Data) {
        setRequestsAsSeen(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;

const UPDATE_REQUEST = gql`
    mutation ($filter: UserInterSendRequest_Filter, $data: UserInterSendRequest_Data) {
        updateRequest(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData {
                id
                entityName
                receiverId
                senderId
                privatePhotosGranted
                privatePhotosGrantedAt
            }
        }
    }
`;

const ReplyToRequest = (props: IReplyToRequest) => {
    const {
        me,
        myRequest,
        fieldId,
        threadId,
        readOnly,
        countAllNotSeenRequests,
        setCountAllNotSeenRequestsActionProps,
        onSetStateAtSubmit
    } = props;

    const [setRequestsAsSeen, { error: setRequestsAsSeenError }] = useMutation(SET_REQUESTS_AS_SEEN);
    const [updateRequest, { error: updateRequestError }] = useMutation(UPDATE_REQUEST);
    const socketEvents = React.useContext(SocketEvents);
    const { t } = useTranslation();

    const onReplyToRequest = (dataUpdate: any, requestId: string) => {
        if (!requestId) { return; }

        updateRequest({
            variables: {
                filter: {
                    filterUpdate: {
                        _id: requestId
                    }
                },
                data: {
                    dataUpdate: {
                        ...dataUpdate
                    }
                }
            }
        }).then((resUpdate) => {
            const updatedData = resUpdate?.data?.updateRequest?.updatedData as IUserInteraction;
            const id = updatedData?.id;

            if (id) {
                if (onSetStateAtSubmit) { onSetStateAtSubmit(updatedData); }

                socketEvents.emit.newRequestResponse({
                    ...updatedData,
                    receiverId: updatedData?.receiverId,
                    senderId: updatedData?.senderId || me?._id,
                    threadId
                });

                // if (countAllNotSeenRequests) {
                setRequestsAsSeen({
                    variables: {
                        filter: {
                            filterSetAsSeen: {
                                _id: requestId
                                // isSeenByReceiver: { $ne: true }
                            }
                        },
                        data: {
                            dataSetAsSeen: {
                                isSeenByReceiver: true
                            }
                        }
                    }
                }).then((resSetAsSeen) => {
                    if (resSetAsSeen?.data?.setRequestsAsSeen?.updatedData) {
                        let count = typeof countAllNotSeenRequests === 'number' ? countAllNotSeenRequests : 0;
                        if (count > 0) { count = count - 1; }

                        setCountAllNotSeenRequestsActionProps(null, count);
                    }
                });
                // }
            }
        });
    };

    if (setRequestsAsSeenError) { console.error(setRequestsAsSeenError); }

    if (updateRequestError) {
        // TODO Display toast
        console.error(updateRequestError);
    }

    const { privatePhotosGranted } = myRequest;
    const declined = privatePhotosGranted === 'null' || privatePhotosGranted === 'declined';
    const granted = privatePhotosGranted === 'null' || privatePhotosGranted === 'granted';

    const styleButton = {
        p: 1,
        pl: 2,
        pr: 2,
        mr: 2,
        style: { flex: 1 },
        _text: { fontSize: 11 }
    };

    return (
        <Box style={{ flexDirection: "row" }}>
            {/* Button granted */}
            <Button
                leftIcon={<Icon as={Ionicons} name="checkmark-outline" size="xs" />}
                {...styleButton}
                variant={!readOnly && declined ? 'solid' : 'none'}
                onPress={() => {
                    if (!readOnly && declined) {
                        onReplyToRequest({ privatePhotosGranted: 'granted', privatePhotosGrantedAt: new Date() }, fieldId);
                    }
                }}
            >
                {
                    declined ? (
                        t('user.userInteractions.myRequest.received_privatePhotosGranted')
                    ) : (
                        t('user.userInteractions.myRequest.received_replyGranted')
                    )
                }
            </Button>

            {/* Button decline */}
            <Button
                leftIcon={<Icon as={Ionicons} name="close-outline" size="xs" />}
                {...styleButton}
                variant={!readOnly && granted ? 'outline' : 'none'}
                onPress={() => {
                    if (!readOnly && granted) {
                        onReplyToRequest({ privatePhotosGranted: 'declined', privatePhotosGrantedAt: null }, fieldId);
                    }
                }}
            >
                {
                    granted ? (
                        t('user.userInteractions.myRequest.received_privatePhotosDecline')
                    ) : (
                        t('user.userInteractions.myRequest.received_replyDecline')
                    )
                }
            </Button>
        </Box>
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        countAllNotSeenRequests: state.notifications.countAllNotSeenRequests
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        setCountAllNotSeenRequestsActionProps: bindActionCreators(setCountAllNotSeenRequestsAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReplyToRequest);
