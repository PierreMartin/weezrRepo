// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import { Dimensions, ImageBackground, ScrollView, Text, TouchableHighlight } from 'react-native';
import { Badge, Box, Button, Center, Icon } from "native-base";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Spinner } from '../components/Spinner';
import { UserListInfos } from "../components/userInfosList";
import SendRequest from "../components/ActionsForUserInteractions/SendRequest";
import ToFollow from "../components/ActionsForUserInteractions/ToFollow";
import { onToBlock, TO_BLOCK } from "../components/ActionsForUserInteractions/ToBlock";
import { displayAlert } from "../components/DisplayAlert";
import {
    setRealtimeNewLikeAction,
    newMessageAction,
    setRealtimeNewVisitAction,
    setRealtimeNewRequestAction,
    setRealtimeNewRequestResponseAction,
    setRealtimeNewFollowAction,
    setRealtimeNewBlockAction
} from "../reduxActions/realtimeData";
import { SocketEvents } from "../context/SocketEvents";
import { NotificationsContext } from "../context/NotificationsContext";
import { IThreadMessage, IUser, IUserImagesList, IUserInteraction } from "../entities";
import { getUniqueId, getUserForwardPhoto, getUserPhotoByPage, setElementInArrayAtIndex } from "../toolbox/toolbox";
import { States } from "../reduxReducers/states";
import getStyles from "./UserDetailScreen.styles";
import colors from "../styles/colors";

const styles = getStyles();

const THREAD = gql`
    query ($filter: Thread_Filter!) {
        thread(filter: $filter) {
            pageInfo {
                message
                success
            }
            data {
                id
            }
        }
    }
`;

const USER = gql`
    query ($filter: User_Filter!) {
        user(filter: $filter) {
            pageInfo {
                message
                success
                doRedirection
            }
            data {
                email
                displayName
                id
                currentLocation {
                    latitude
                    longitude
                }
                isOnline
                unreadMessages
                distanceComparedToMe
                images
                about
                basedLocation
                career
                physicalAppearance
                poi
                hasPrivatePhotos
                userInteractions {
                    myLike {
                        sent {
                            id
                            at
                            isMutual
                        }
                        received {
                            id
                            at
                        }
                    }
                    myVisit {
                        received {
                            id
                            at
                        }
                    }
                    myRequest {
                        sent {
                            id
                            at
                            privatePhotosGranted
                        }
                        received {
                            id
                            at
                            privatePhotosGranted
                        }
                    }
                    myFollow {
                        sent {
                            id
                        }
                        received {
                            id
                            at
                        }
                    }
                }
            }
        }
    }
`;

const SEND_LIKE = gql`
    mutation ($data: UserInterSendLike_Data) {
        sendLike(data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData {
                id
                entityName
                at
                isMutual
                receiverId
                senderId
                type
            }
        }
    }
`;

const TO_VISIT = gql`
    mutation ($data: UserInterVisit_Data) {
        toVisit(data: $data) {
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
                hasAlreadyInteracted
                isSeenByReceiver
            }
        }
    }
`;

interface IUserDetailScreenProps extends StackScreenProps<any, 'UserDetail'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    realtimeNewMessage: States.INewMessage;
    realtimeNewLike: States.INewLike;
    realtimeNewVisit: States.INewVisit;
    realtimeNewFollow: States.INewVisit;
    realtimeNewRequest: States.INewRequest;
    realtimeNewRequestResponse: States.INewRequest;
    realtimeNewBlock: States.INewBlock;
    newMessageActionProps: (data: any) => void;
    setRealtimeNewLikeActionProps: (data: any) => void;
    setRealtimeNewVisitActionProps: (data: any) => void;
    setRealtimeNewFollowActionProps: (data: any) => void;
    setRealtimeNewRequestActionProps: (data: any) => void;
    setRealtimeNewRequestResponseActionProps: (data: any) => void;
    setRealtimeNewBlockActionProps: (data: any) => void;
    showActionSheetWithOptions: (data: any, callback: (buttonIndex: number) => any) => any;
}

function UserDetailScreenComponent({
    navigation,
    route,
    me,
    realtimeNewMessage,
    realtimeNewLike,
    realtimeNewVisit,
    realtimeNewFollow,
    realtimeNewRequest,
    realtimeNewRequestResponse,
    realtimeNewBlock,
    newMessageActionProps,
    setRealtimeNewLikeActionProps,
    setRealtimeNewVisitActionProps,
    setRealtimeNewFollowActionProps,
    setRealtimeNewRequestActionProps,
    setRealtimeNewRequestResponseActionProps,
    setRealtimeNewBlockActionProps,
    showActionSheetWithOptions
}: IUserDetailScreenProps) {
    const { userId } = route.params as { userId: string };

    const socketEvents = React.useContext(SocketEvents);
    const notificationsContext = React.useContext(NotificationsContext);

    // @ts-ignore
    const [userFront, setUserFront] = React.useState<IUser>({});
    const [bgUri, setBgUri] = React.useState<string | null>(null);
    const [bgUriSelectedPage, setBgUriSelectedPage] = React.useState<number>(0);
    const [isSelectedProfileOwner, setIsSelectedProfileOwner] = React.useState<boolean>(false);
    const [participantsIds, setParticipantsIds] = React.useState<any[]>([]);
    const [getThread, { loading: threadLoading, data: threadData, error: threadError }] = useLazyQuery(THREAD, { fetchPolicy: 'network-only' });
    const [getUser, { /* loading: userLoading, */data: userData, error: userError }] = useLazyQuery(USER, { fetchPolicy: 'network-only' });

    const [toVisit, { error: toVisitError }] = useMutation(TO_VISIT);
    const [sendLike, { error: sendLikeError }] = useMutation(SEND_LIKE, {
        update: (cache, data: any) => {
            const { updatedData } = data?.data?.sendLike;
            const { id } = updatedData || {};

            // If deleted:
            if (!id) {
                cache.evict({ fieldName: 'likes', broadcast: false });
                cache.gc();
            }
        }
    });
    const [toBlock, { error: toBlockError }] = useMutation(TO_BLOCK, {
        update: (cache, data: any) => {
            const { updatedData } = data?.data?.toBlock;
            const { id } = updatedData || {};

            // If deleted:
            if (id) {
                cache.evict({ fieldName: 'users', broadcast: false });
                cache.evict({ fieldName: 'threads', broadcast: false });
                // cache.evict({ fieldName: 'likes', broadcast: false });
                // cache.evict({ fieldName: 'requests', broadcast: false });
                // cache.evict({ fieldName: 'allPrimaryNotifications', broadcast: false });
                cache.gc();
            }
        }
    });

    const { t } = useTranslation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: userFront?.displayName || 'User'
        });
    }, [userFront]);

    // Get thread if exist:
    React.useEffect(() => {
        const nextIsSelectedProfileOwner = userId === me?._id;
        const nextParticipantsIds = nextIsSelectedProfileOwner ? [] : [userId, me?._id];

        setIsSelectedProfileOwner(nextIsSelectedProfileOwner);
        setParticipantsIds(nextParticipantsIds);

        getThread({
            variables: {
                filter: {
                    filterMain: {
                        participants: { $all: nextParticipantsIds }
                    }
                }
            }
        });
    }, []);

    const onGetUser = () => {
        if (typeof threadData?.thread?.data !== 'undefined') {
            getUser({
                variables: {
                    filter: {
                        filterMain: {
                            _id: userId,
                            userMeId: me?._id,
                            threadId: threadData?.thread?.data?.id,
                            coordinates: me?.currentLocation?.coordinates
                        },
                        filterCountUnreadMessages: {
                            $and: [
                                { author: { $ne: me?._id } },
                                { 'readBy.user': { $nin: [null, me?._id] } }
                            ]
                        }
                    }
                }
            });
        }
    };

    // Get userFront:
    React.useEffect(() => {
        onGetUser();
    }, [threadData]);

    const onToVisit = (receiverId: string) => {
        if (!isSelectedProfileOwner && receiverId && me?._id) {
            toVisit({
                variables: {
                    data: {
                        dataMain: {
                            senderId: me._id,
                            receiverId,
                            at: new Date()
                        }
                    }
                }
            }).then((res) => {
                const userInterToVisit = res?.data?.toVisit?.updatedData as IUserInteraction;

                if (userInterToVisit) {
                    /*
                    setUserFront((previousUserFront: IUser) => {
                        const userToUpdate = _.cloneDeep(previousUserFront);

                        if (userToUpdate.userInteractions?.myVisit) {
                            userToUpdate.userInteractions.myVisit.sent = userInterToVisit;
                        }

                        return userToUpdate;
                    });
                    */

                    // socketEvents.emit.newVisit()
                    socketEvents.emit.newPrimaryNotification({
                        ...userInterToVisit,
                        entityName: 'UserInterVisit',
                        receiverId: userInterToVisit?.receiverId || userFront?.id,
                        senderId: userInterToVisit?.senderId || me._id,
                        sender: { // Mock population MongoDB:
                            id: userInterToVisit?.senderId || me._id,
                            images: me.images,
                            displayName: me.displayName,
                            email: me.email
                        } as IUser
                    });
                }
            });
        }
    };

    const onOpenActionSheetForBlockTheProfile = () => {
        showActionSheetWithOptions(
            {
                options: [
                    t('userDetail.secondaryActions.cancel'),
                    t('userDetail.secondaryActions.block.confirmOk')
                ],
                title: t('userDetail.secondaryActions.block.confirmTitle'),
                message: t('userDetail.secondaryActions.block.confirmDescription'),
                cancelButtonIndex: 0,
                destructiveButtonIndex: 1,
                userInterfaceStyle: 'dark'
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        // Cancel
                        break;
                    case 1:
                        // To confirm
                        onToBlock({
                            toBlock,
                            userFront,
                            me,
                            onSetStateAtSubmit: (userInterToBlock: IUserInteraction) => {
                                if (userInterToBlock?.id) {
                                    navigation.goBack();
                                    // TODO display confirm modal ?
                                }
                            },
                            socketEvents,
                            notificationsContext
                        });
                        break;
                    default:
                        break;
                }
            }
        );
    };

    const onOpenActionSheetForReportTheProfile = () => {
        // TODO
    };

    // Set state for userFront:
    React.useEffect(() => {
        if (userData?.user?.data) {
            if (userData.user?.pageInfo?.doRedirection) {
                navigation.goBack();

                displayAlert({
                    message: t(userData.user?.pageInfo?.message),
                    confirmOk: t('userDetail.secondaryActions.close')
                });

                return;
            }

            setUserFront(userData.user?.data);

            const { uri }: any = getUserForwardPhoto(userData.user?.data, 'size_320_400', true);
            setBgUri(uri);

            onToVisit(userData.user?.data?.id);
        }
    }, [userData]);

    const {
        displayName,
        isOnline,
        unreadMessages,
        distanceComparedToMe,
        images,
        basedLocation,
        userInteractions,
        hasPrivatePhotos
        // birthAt
    } = userFront || {} as IUser;

    let imagesToDisplay = images?.list?.filter((image: IUserImagesList) => image?.album === 'public');
    if (isSelectedProfileOwner || userInteractions?.myRequest?.sent?.privatePhotosGranted === 'granted') {
        // If user have granted his private photos:
        imagesToDisplay = images?.list?.filter((image: IUserImagesList) => image?.album === 'public' || image?.album === 'private');
    }

    imagesToDisplay = setElementInArrayAtIndex(imagesToDisplay, 'fileId', me?.images?.forwardFileId); // Set forward photo at first el of array:
    const { height: windowHeight, width: windowWidth } = Dimensions.get('window');
    const haveThumbnails = imagesToDisplay?.length && imagesToDisplay?.length > 1;
    const age = 22; // TODO birthAt
    const offset = -260;
    const invisibleScrollableHeight = (windowHeight || 800) + offset;

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Box>
                    {
                        !isSelectedProfileOwner && (
                            <Button
                                m={0}
                                p={1}
                                variant="outline"
                                // backgroundColor="#fff"
                                borderColor="gray.300"
                                _text={{
                                    color: "gray.500"
                                }}
                                leftIcon={<Icon as={Ionicons} name="ellipsis-horizontal-outline" size="5" />}
                                onPress={() => {
                                    if (showActionSheetWithOptions) {
                                        showActionSheetWithOptions(
                                            {
                                                options: [
                                                    t('userDetail.secondaryActions.close'),
                                                    t('userDetail.secondaryActions.block.do'),
                                                    t('userDetail.secondaryActions.report.do')
                                                ],
                                                cancelButtonIndex: 0,
                                                destructiveButtonIndex: [1, 2],
                                                userInterfaceStyle: 'dark'
                                            },
                                            (buttonIndex) => {
                                                switch (buttonIndex) {
                                                    case 0:
                                                        // Close
                                                        break;
                                                    case 1:
                                                        // To block the profile
                                                        onOpenActionSheetForBlockTheProfile();
                                                        break;
                                                    case 2:
                                                        // To report the profile
                                                        onOpenActionSheetForReportTheProfile();
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }
                                        );
                                    }
                                }}
                            />
                        )
                    }
                </Box>
            )
        });
    }, [navigation, userFront]);

    // Socket events - Room type userInteractions:
    /*
    useFocusEffect(
        React.useCallback(() => {
            if (me?._id) {
                const wsRoomId = createRoomName([userId, me._id]);
                if (wsRoomId) { socketEvents.emit.joinUserInteractions([wsRoomId]); }

                return () => {
                    const wsRoomIdToRemove = createRoomName([userId, me._id]);
                    if (wsRoomIdToRemove) { socketEvents.emit.leaveUserInteractions([wsRoomIdToRemove]); }
                };
            }
        }, [])
    );
    */

    // Socket events - Room type user:
    useFocusEffect(
        React.useCallback(() => {
            if (threadData?.thread?.data?.id) {
                // Socket events, join threads:
                socketEvents.emit.joinThreads([threadData.thread.data.id]);
            }

            return () => {
                if (threadData?.thread?.id) {
                    socketEvents.emit.leaveThreads([threadData.thread.data.id]);
                }
            };
        }, [threadData])
    );

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewMessage) {
            // If new message created - Update count unread messages for the user:
            console.log('[socket] newMessage');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = {...previousUserFront};

                if (userToUpdate) {
                    if (typeof userToUpdate.unreadMessages === 'number') {
                        userToUpdate.unreadMessages++;
                    } else {
                        userToUpdate.unreadMessages = 1;
                    }

                    if (userToUpdate.unreadMessages >= 99) {
                        userToUpdate.unreadMessages = '+99';
                    }
                }

                return userToUpdate;
            });

            // reset redux:
            newMessageActionProps(null);
        }
    }, [realtimeNewMessage]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewLike && realtimeNewLike?.senderId === userFront?.id) {
            // If new like received - Update user:
            console.log('[socket] newLike');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = _.cloneDeep(previousUserFront);

                if (userToUpdate?.userInteractions?.myLike) {
                    if (!realtimeNewLike.isRemoved && realtimeNewLike?.id) {
                        // Add:
                        userToUpdate.userInteractions.myLike.received = realtimeNewLike;
                    } else {
                        // Remove:
                        userToUpdate.userInteractions.myLike.received = null;
                    }

                    if (userToUpdate.userInteractions.myLike?.sent) {
                        userToUpdate.userInteractions.myLike.sent.isMutual = !!realtimeNewLike.isMutual;
                    }
                }

                return userToUpdate;
            });

            // reset redux:
            setRealtimeNewLikeActionProps(null);
        }
    }, [realtimeNewLike]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewVisit && realtimeNewVisit?.senderId === userFront?.id) {
            // If new visit received - Update user:
            console.log('[socket] newVisit');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = _.cloneDeep(previousUserFront);

                if (userToUpdate?.userInteractions?.myVisit && realtimeNewVisit.id) {
                    userToUpdate.userInteractions.myVisit.received = realtimeNewVisit;
                }

                return userToUpdate;
            });

            // reset redux:
            setRealtimeNewVisitActionProps(null);
        }
    }, [realtimeNewVisit]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewFollow && realtimeNewFollow?.senderId === userFront?.id) {
            // If new follow received - Update user:
            console.log('[socket] newFollow');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = _.cloneDeep(previousUserFront);

                if (userToUpdate?.userInteractions?.myFollow) {
                    if (!realtimeNewFollow.isRemoved && realtimeNewFollow?.id) {
                        // Add:
                        userToUpdate.userInteractions.myFollow.received = realtimeNewFollow;
                    } else {
                        // Remove:
                        userToUpdate.userInteractions.myFollow.received = null;
                    }
                }

                return userToUpdate;
            });

            // reset redux:
            setRealtimeNewFollowActionProps(null);
        }
    }, [realtimeNewFollow]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewRequest && realtimeNewRequest?.senderId === userFront?.id) {
            // If new request received - Update user:
            console.log('[socket] newRequest');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = _.cloneDeep(previousUserFront);

                if (userToUpdate?.userInteractions?.myRequest) {
                    if (!realtimeNewRequest.isRemoved && realtimeNewRequest.id) {
                        // Add:
                        userToUpdate.userInteractions.myRequest.received = realtimeNewRequest;
                    } else {
                        // Remove:
                        userToUpdate.userInteractions.myRequest.received = null;
                    }
                }

                return userToUpdate;
            });

            // reset redux:
            setRealtimeNewRequestActionProps(null);
        }
    }, [realtimeNewRequest]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewRequestResponse && realtimeNewRequestResponse?.receiverId === userFront?.id) {
            // If new request response received - Update user:
            console.log('[socket] newRequestResponse');

            setUserFront((previousUserFront: IUser) => {
                const userToUpdate = _.cloneDeep(previousUserFront);

                if (userToUpdate?.userInteractions?.myRequest) {
                    userToUpdate.userInteractions.myRequest.sent = realtimeNewRequestResponse; // { privatePhotosGranted: bool }
                }

                return userToUpdate;
            });

            // reset redux:
            setRealtimeNewRequestResponseActionProps(null);
        }
    }, [realtimeNewRequestResponse]);

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewBlock && realtimeNewBlock?.senderId === userFront?.id) {
                // If new block received - go back:
                console.log('[socket] newBlock');

                // reset redux:
                setRealtimeNewBlockActionProps(null);

                navigation.goBack();

                displayAlert({
                    message: t('error.blockedProfile_seeProfile'),
                    confirmOk: t('userDetail.secondaryActions.close')
                });
            }
        }, [realtimeNewBlock])
    );

    const onRefresh = () => {
        onGetUser();
    };

    if (userError || !userFront) {
        console.error(userError);
        return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (threadError) {
        // TODO Display toast
        console.error(threadError);
    }

    if (sendLikeError) {
        // TODO Display toast
        console.error(sendLikeError);
    }

    if (toBlockError) {
        // TODO Display toast
        console.error(toBlockError);
    }

    if (toVisitError) { console.error(toVisitError); }

    let toolbarUserInteractionContainerNode = null;

    if (typeof isSelectedProfileOwner !== 'undefined' && !isSelectedProfileOwner && !threadError && !threadLoading) {
        let likeSentIconStr = 'heart-outline';

        if (userInteractions?.myLike?.sent?.id) {
            likeSentIconStr = 'heart';
            if (userInteractions.myLike.sent.isMutual) { likeSentIconStr = 'heart-circle'; }
        }

        toolbarUserInteractionContainerNode = (
            <>
                <Box style={styles.userInteractionButton}>
                    <ToFollow
                        myFollow={userInteractions?.myFollow}
                        userFront={userFront}
                        onSetStateAtSubmit={(userInterFollow) => {
                            setUserFront((previousUserFront: IUser) => {
                                const userToUpdate = _.cloneDeep(previousUserFront);

                                if (userToUpdate.userInteractions?.myFollow) {
                                    userToUpdate.userInteractions.myFollow.sent = userInterFollow;
                                }

                                return userToUpdate;
                            });
                        }}
                    />
                </Box>

                {
                    (hasPrivatePhotos) && (
                        <Box style={styles.userInteractionButton}>
                            <SendRequest
                                from="detail"
                                myRequest={userInteractions?.myRequest}
                                participantsIds={participantsIds}
                                userFront={userFront}
                                onSetStateAtSubmit={(userInterSendRequest) => {
                                    setUserFront((previousUserFront: IUser) => {
                                        const userToUpdate = _.cloneDeep(previousUserFront);

                                        if (userToUpdate.userInteractions?.myRequest) {
                                            userToUpdate.userInteractions.myRequest.sent = userInterSendRequest;
                                        }

                                        return userToUpdate;
                                    });

                                    if (userInterSendRequest?.isNewThread) {
                                        socketEvents.emit.newThread({ threadId: userInterSendRequest?.threadId, participantsIds });
                                    }

                                    setTimeout(() => {
                                        socketEvents.emit.newMessage({
                                            _id: getUniqueId(),
                                            author: userInterSendRequest?.senderId || me?._id,
                                            threadId: userInterSendRequest?.threadId,
                                            requestId: userInterSendRequest?.id,
                                            createdAt: new Date(),
                                            user: me as IUser,
                                            isFirstMessageInThread: userInterSendRequest?.isNewThread
                                        } as IThreadMessage);
                                    }, userInterSendRequest?.isNewThread ? 3000 : 0); // TODO may bug
                                }}
                            />
                        </Box>
                    )
                }

                <Box style={styles.userInteractionButton}>
                    <Button
                        leftIcon={<Icon as={Ionicons} name={likeSentIconStr} size="lg" />}
                        onPress={() => {
                            sendLike({
                                variables: {
                                    data: {
                                        dataMain: {
                                            senderId: me?._id,
                                            receiverId: userFront?.id,
                                            at: new Date(),
                                            type: 'heart'
                                        }
                                    }
                                }
                            }).then((res) => {
                                const userInterSendLike = res?.data?.sendLike?.updatedData as IUserInteraction;
                                const prevInteractionId = userInteractions?.myLike?.sent?.id;
                                // const wsRoomId = createRoomName([userId, me._id]);

                                setUserFront((previousUserFront: IUser) => {
                                    const userToUpdate = _.cloneDeep(previousUserFront);

                                    if (userToUpdate.userInteractions?.myLike) {
                                        userToUpdate.userInteractions.myLike.sent = userInterSendLike;
                                    }

                                    return userToUpdate;
                                });

                                socketEvents.emit.newLike({
                                    ...userInterSendLike,
                                    id: (userInterSendLike?.id || prevInteractionId) as string,
                                    receiverId: userInterSendLike?.receiverId || userFront?.id,
                                    senderId: userInterSendLike?.senderId || me?._id,
                                    isRemoved: !userInterSendLike?.id,
                                    sender: { // Mock population MongoDB:
                                        id: userInterSendLike?.senderId || me?._id,
                                        images: me.images,
                                        displayName: me.displayName,
                                        email: me.email
                                    } as IUser
                                });

                                if (userInterSendLike?.id) {
                                    // TODO Display toast add
                                } else {
                                    // TODO Display toast remove
                                }
                            });
                        }}
                        // style={styles.button}
                    />
                </Box>

                <Box style={[styles.userInteractionButton, { position: 'relative' }]}>
                    <Button
                        leftIcon={<Icon as={Ionicons} name="chatbubble-ellipses-outline" size="lg" />}
                        onPress={() => {
                            navigation.navigate('ThreadDetail', {
                                threadId: threadData?.thread?.data?.id,
                                participantsIds,
                                createThreadIfNeeded: true,
                                onRefreshParentScreen: () => onRefresh()
                            });
                        }}
                        // style={styles.button}
                    />

                    {/* badge if unread messages: */}
                    <Text style={{ position: 'absolute', top: -10, right: -6 }}>
                        {(unreadMessages && unreadMessages > 0) ? (
                            <Badge
                                colorScheme="danger"
                                rounded="full"
                                zIndex={1}
                                variant="solid"
                                _text={{fontSize: 12}}
                            >
                                {unreadMessages >= 99 ? '+99' : unreadMessages}
                            </Badge>
                        ) : ''}
                    </Text>
                </Box>
            </>
        );
    } else if (typeof isSelectedProfileOwner !== 'undefined' && isSelectedProfileOwner) {
        toolbarUserInteractionContainerNode = (
            <>
                <Box style={styles.userInteractionButton}>
                    <Button
                        leftIcon={<Icon as={Ionicons} name="pencil-outline" size="lg" />}
                        onPress={() => {
                            navigation.navigate('UserEditingProfileMenu', {
                                onRefreshParentScreen: () => onRefresh()
                            });
                        }}
                        // style={styles.button}
                    />
                </Box>
            </>
        );
    }

    const renderPagination = () => {
        if (typeof imagesToDisplay?.length === 'undefined' || imagesToDisplay.length <= 1) {
            return null;
        }

        return (
            <Box style={styles.paginationImagesContainer}>
                {
                    imagesToDisplay.map((image, index) => {
                        const isLastItem = index === ((imagesToDisplay?.length || 0) - 1);
                        const selectedItem = bgUriSelectedPage === index;

                        return (
                            <Box
                                key={index}
                                style={
                                    [
                                        {
                                            flex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.4)',
                                            marginRight: 8
                                        },
                                        isLastItem ? { marginRight: 0 } : {}
                                    ]
                                }
                            >
                                <Box
                                    style={
                                        [
                                            {
                                                width: '100%',
                                                height: 4
                                            },
                                            selectedItem ? { backgroundColor: '#fff' } : {}
                                        ]
                                    }
                                />
                            </Box>
                        );
                    })
                }
            </Box>
        );
    };

    const renderThumbnails = () => {
        if (!haveThumbnails) { return null; }
        const marginSize = 0;
        const limit = 4;
        const offsetWhenMargins = (limit * marginSize) + marginSize;
        const itemWidth: number = (windowWidth - offsetWhenMargins) / limit;

        return (
            <Box style={styles.thumbnailsContainer}>
                {
                    imagesToDisplay?.map((image, index) => {
                        if (!image?.size_130_130) { return null; }
                        // @ts-ignore
                        const numberAdditionalPhotos = ((index + 1) >= limit) ? (imagesToDisplay?.length - limit) : 0;

                        return (
                            <TouchableHighlight
                                key={image.fileId}
                                activeOpacity={0.8}
                                underlayColor="transparent"
                                onPress={() => {
                                    const defaultSizeUri = 'size_320_400';

                                    const photos = imagesToDisplay?.map((item: any) => {
                                        if (!(item && item[defaultSizeUri])) { return false; }
                                        return { url: item[defaultSizeUri] };
                                    });

                                    if (index !== -1 && photos?.length && photos[index]) {
                                        navigation.navigate('PhotoDetailModal', {
                                            photos,
                                            indexCurrentPhoto: index
                                        });
                                    } else {
                                        console.error('Not image found!');
                                    }
                                }}
                            >
                                <ImageBackground
                                    style={{ height: itemWidth, width: itemWidth, alignItems: 'center', justifyContent: 'center' }}
                                    resizeMode="cover"
                                    source={{ uri: image.size_130_130 }}
                                >
                                    { (numberAdditionalPhotos > 0) && (
                                        <Text style={[styles.basicText, { fontSize: 28, fontWeight: 'bold' }]}>
                                            +{numberAdditionalPhotos}
                                        </Text>
                                    ) }
                                </ImageBackground>
                            </TouchableHighlight>
                        );
                    })
                }
            </Box>
        );
    };

    const renderControllers = () => {
        const height = '90%';

        return (
            <Box style={{ flexDirection: 'row' }}>
                <Box style={{ flex: 1 }}>
                    <TouchableHighlight
                        activeOpacity={0.8}
                        underlayColor="transparent"
                        onPress={() => {
                            const nextBgUriSelectedPage = bgUriSelectedPage - 1;
                            const uri = getUserPhotoByPage(imagesToDisplay, 'size_320_400', nextBgUriSelectedPage, 'prev');

                            if (uri) {
                                setBgUri(uri);
                                setBgUriSelectedPage(nextBgUriSelectedPage);
                            }
                        }}
                    >
                        <Box style={{ height }} />
                    </TouchableHighlight>
                </Box>

                <Box style={{ flex: 1 }}>
                    <TouchableHighlight
                        activeOpacity={0.8}
                        underlayColor="transparent"
                        onPress={() => {
                            if (bgUri) {
                                const defaultSizeUri = 'size_320_400';

                                const photos = imagesToDisplay?.map((item: any) => {
                                    if (!(item && item[defaultSizeUri])) { return false; }
                                    return { url: item[defaultSizeUri] };
                                });

                                if (bgUriSelectedPage !== -1 && photos?.length && photos[bgUriSelectedPage]) {
                                    navigation.navigate('PhotoDetailModal', {
                                        photos,
                                        indexCurrentPhoto: bgUriSelectedPage
                                    });
                                } else {
                                    console.error('Not image found!');
                                }
                            }
                        }}
                    >
                        <Box style={{ height }} />
                    </TouchableHighlight>
                </Box>

                <Box style={{ flex: 1 }}>
                    <TouchableHighlight
                        activeOpacity={0.8}
                        underlayColor="transparent"
                        onPress={() => {
                            const nextBgUriSelectedPage = bgUriSelectedPage + 1;
                            const uri = getUserPhotoByPage(imagesToDisplay, 'size_320_400', nextBgUriSelectedPage, 'next');

                            if (uri) {
                                setBgUri(uri);
                                setBgUriSelectedPage(nextBgUriSelectedPage);
                            }
                        }}
                    >
                        <Box style={{ height }} />
                    </TouchableHighlight>
                </Box>
            </Box>
        );
    };

    return (
        <Box safeArea style={styles.main}>
            <ImageBackground
                style={styles.bgContainer}
                resizeMode="cover"
                source={{ uri: bgUri as string }}
            >
                { (/* userLoading || */!userFront?.id) && <Spinner /> }

                {/* Pagination dots for changing images in background */}
                {renderPagination()}

                <ScrollView nestedScrollEnabled={false} style={{ zIndex: 9, flex: 1 }}>
                    {/* Controller for slider (left center right) - invisible */}
                    <Box style={{ position: 'relative', height: invisibleScrollableHeight }}>
                        {renderControllers()}
                    </Box>

                    {/* Thumbnails */}
                    <Box style={{ width: '100%', height: 90, /* backgroundColor: 'rgba(0, 0, 0, 0.3)' */ }}>
                        {renderThumbnails()}
                    </Box>

                    {/* Main user infos */}
                    <Box style={[styles.container, styles.userScrollableDetailContainer]}>
                        <Box style={styles.headerContainer}>
                            <Text style={[styles.basicText, styles.headlineText]}>{displayName || ''} {age || ''}</Text>

                            {
                                isOnline ? (
                                    <Text style={[styles.basicText, { color: 'green' }]}>
                                        <Icon size="4" color="#16BF24FF" as={<Ionicons name="radio-button-on-outline" />} /> {t('user.isOnline.true')}
                                    </Text>
                                ) : (
                                    <Text style={styles.basicText}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="radio-button-off-outline" />} /> {t('user.isOnline.false')}
                                    </Text>
                                )
                            }

                            {
                                basedLocation && (
                                    <Text style={styles.basicText}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="location-outline" />} /> {t('user.basedLocation')} {basedLocation}
                                    </Text>
                                )
                            }

                            {
                                (typeof distanceComparedToMe !== 'undefined' && distanceComparedToMe >= 0) && (
                                    <Text style={styles.basicText}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="location-outline" />} />
                                        {distanceComparedToMe?.toFixed(2)} {t('user.distanceComparedToMe.unit')}
                                    </Text>
                                )
                            }

                            {/* Display user interactions received: */}
                            {
                                userInteractions?.myLike?.received?.id && (
                                    <Text style={[styles.basicText, { color: colors.primary }]}>
                                        <Icon size="4" color={colors.primary} as={<Ionicons name="heart" />} />
                                        &nbsp;
                                        {t('user.userInteractions.myLike.received')}
                                    </Text>
                                )
                            }
                            {
                                userInteractions?.myVisit?.received?.id && (
                                    <Text style={[styles.basicText]}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="eye-outline" />} />
                                        &nbsp;
                                        {t('user.userInteractions.myVisit.received')}
                                        &nbsp;
                                        {userInteractions.myVisit.received?.at}
                                    </Text>
                                )
                            }
                            {
                                userInteractions?.myFollow?.received?.id && (
                                    <Text style={[styles.basicText]}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="star-outline" />} />
                                        &nbsp;
                                        {t('user.userInteractions.myFollow.received')}
                                    </Text>
                                )
                            }

                            {/* TODO button Accept/Decline: */}
                            {
                                userInteractions?.myRequest?.received?.id && (
                                    <Text style={[styles.basicText]}>
                                        <Icon size="4" color="#fff" as={<Ionicons name="lock-closed-outline" />} />
                                        &nbsp;

                                        {
                                            userInteractions?.myRequest?.received?.privatePhotosGranted === 'granted'
                                                ? t('user.userInteractions.myRequest.received_replyGranted')
                                                : t('user.userInteractions.myRequest.received')
                                        }
                                    </Text>
                                )
                            }
                        </Box>

                        {/* All user infos... */}
                        <UserListInfos user={userFront} />
                    </Box>
                </ScrollView>

                {/* User interaction buttons */}
                <Box style={styles.toolbarUserInteractionContainer}>
                    {toolbarUserInteractionContainerNode}
                </Box>
            </ImageBackground>
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        realtimeNewMessage: state.realtimeData.newMessage,
        realtimeNewLike: state.realtimeData.newLike,
        realtimeNewVisit: state.realtimeData.newVisit,
        realtimeNewFollow: state.realtimeData.newFollow,
        realtimeNewRequest: state.realtimeData.newRequest,
        realtimeNewRequestResponse: state.realtimeData.newRequestResponse,
        realtimeNewBlock: state.realtimeData.newBlock
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        newMessageActionProps: bindActionCreators(newMessageAction, dispatch),
        setRealtimeNewLikeActionProps: bindActionCreators(setRealtimeNewLikeAction, dispatch),
        setRealtimeNewVisitActionProps: bindActionCreators(setRealtimeNewVisitAction, dispatch),
        setRealtimeNewFollowActionProps: bindActionCreators(setRealtimeNewFollowAction, dispatch),
        setRealtimeNewRequestActionProps: bindActionCreators(setRealtimeNewRequestAction, dispatch),
        setRealtimeNewRequestResponseActionProps: bindActionCreators(setRealtimeNewRequestResponseAction, dispatch),
        setRealtimeNewBlockActionProps: bindActionCreators(setRealtimeNewBlockAction, dispatch)
    };
}

const UserDetailScreen = connectActionSheet(UserDetailScreenComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailScreen);
