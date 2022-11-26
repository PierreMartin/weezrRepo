/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { Linking, Platform, Text, TouchableHighlight, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from "@react-navigation/native";
import { Box, Button, Center, Image } from "native-base";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Bubble, BubbleProps, GiftedChat } from 'react-native-gifted-chat';
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { SocketEvents } from "../context/SocketEvents";
import {
    newMessageAction,
    setRealtimeNewBlockAction,
    setRealtimeNewRequestResponseAction,
    typingAction
} from "../reduxActions/realtimeData";
import { Spinner } from "../components/Spinner";
import ReplyToRequest from "../components/ActionsForUserInteractions/ReplyToRequest";
import { onSendRequest, SEND_REQUEST } from "../components/ActionsForUserInteractions/SendRequest";
import FilesBottomSheetPicker from "../components/FilesBottomSheetPicker";
import { displayAlert } from "../components/DisplayAlert";
import { getUniqueId } from "../toolbox/toolbox";
import { IThread, IThreadMessage, IUser, IUserInteraction } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from "./ThreadDetailScreen.styles";

const styles = getStyles();

interface IThreadDetailScreenProps extends StackScreenProps<any, 'ThreadDetail'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    realtimeDataTyping: States.ITyping;
    realtimeNewMessage: States.INewMessage;
    realtimeNewRequestResponse: States.INewRequest;
    realtimeNewBlock: States.INewBlock;
    newMessageActionProps: (data: any) => void;
    setRealtimeNewRequestResponseActionProps: (data: any) => void;
    setRealtimeNewBlockActionProps: (data: any) => void;
    typingActionProps: (data: any) => void;
    showActionSheetWithOptions: (data: any, callback: (buttonIndex: number) => any) => any;
}

const THREAD = gql`
    query ($filter: Thread_Filter) {
        thread(filter: $filter) {
            pageInfo {
                message
                success
                doRedirection
            }
            data {
                id
                author {
                    id
                    email
                    displayName
                }
                participants {
                    id
                    email
                    displayName
                    hasPrivatePhotos
                }
                userInteractions {
                    # Used ONLY for know if userMe CAN send requests to private photos
                    myRequest { 
                        sent {
                            id
                        }
                    }
                }
            }
        }
    }
`;

const THREAD_MESSAGES = gql`
    query ($filter: ThreadMessage_Filter, $data: ThreadMessage_Data, $offset: Int, $limit: Int) {
        threadMessages(filter: $filter, data: $data, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                _id
                id
                text
                image
                video
                audio
                createdAt
                request {
                    id
                    senderId
                    privatePhotosGranted
                }
                author
                sent
                received
            }
        }
    }
`;

const USER_PHOTOS_THREAD = gql`
    query ($filter: UserPhotoThread_Filter, $offset: Int, $limit: Int) {
        userPhotosThread(filter: $filter, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                size_130_130
                size_320_400
                fileId
            }
        }
    }
`;

const CREATE_THREAD = gql`
    mutation ($data: Thread_Data) {
        createThread(data: $data) {
            updatedPageInfo {
                message
                success
                doRedirection
            }
            updatedData {
                id
            }
        }
    }
`;

const CREATE_THREAD_MESSAGE = gql`
    mutation ($data: ThreadMessage_Data) {
        createThreadMessage(data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData {
                _id
                id
                text
                image
                video
                audio
                request {
                    id
                    senderId
                    privatePhotosGranted
                }
                sent
                received
                author
                threadId
                createdAt
            }
        }
    }
`;

const SET_MESSAGES_AS_READ = gql`
    mutation ($filter: ThreadMessage_Filter, $data: ThreadMessage_Data) {
        setMessagesAsRead(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;

const itemsPerPage = 50;

function ThreadDetailScreenComponent({
    navigation,
    route,
    me,
    realtimeDataTyping,
    realtimeNewMessage,
    realtimeNewRequestResponse,
    realtimeNewBlock,
    newMessageActionProps,
    setRealtimeNewRequestResponseActionProps,
    setRealtimeNewBlockActionProps,
    typingActionProps,
    showActionSheetWithOptions
}: IThreadDetailScreenProps) {
    const [thread, setThread] = React.useState<IThread>(null as any);
    const [messages, setMessages] = React.useState<IThreadMessage[]>([]);
    const [typing, setTyping] = React.useState<any>({ isTyping: false, participantTyping: null });
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
    const [participantsIdsAll, setParticipantsIdsAll] = React.useState<string[]>([]);
    const [participantsIdsFront, setParticipantsIdsFront] = React.useState<string[]>([]);
    const [isBetweenTwoUsers, setIsBetweenTwoUsers] = React.useState<boolean>(false);

    const [getThread, {
        loading: getThreadLoading,
        data: threadData,
        error: getThreadError
    }] = useLazyQuery(THREAD, { fetchPolicy: 'network-only' });

    const [getThreadMessages, {
        loading: getThreadMessageLoading,
        data: threadMessageData,
        error: getThreadMessageError,
        fetchMore: fetchMoreThreadMessages,
        client
    }] = useLazyQuery(THREAD_MESSAGES, { fetchPolicy: 'network-only' });

    const [createThread, { error: createThreadError }] = useMutation(CREATE_THREAD);
    const [createThreadMessage, { error: createThreadMessageError }] = useMutation(CREATE_THREAD_MESSAGE);
    const [setMessagesAsRead, { error: setMessagesAsReadError }] = useMutation(SET_MESSAGES_AS_READ);
    const [sendRequest, { error: sendRequestError }] = useMutation(SEND_REQUEST);

    const socketEvents = React.useContext(SocketEvents);

    const clientRef: any = React.useRef();
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

    const { threadId, createThreadIfNeeded, participantsIds, onRefreshParentScreen } = route.params || {};
    const { isLastPage } = threadMessageData?.threadMessages?.pageInfo || {};

    const { t } = useTranslation();

    React.useEffect(() => {
        clientRef.current = client;
    }, [client]);

    React.useLayoutEffect(() => {
        const usersFrontFound = threadData?.thread?.data?.participants?.filter((participant: IUser) => participant.id !== me?._id);
        const firstUserFrontFound = usersFrontFound && usersFrontFound[0];

        navigation.setOptions({
            title: firstUserFrontFound?.displayName
        });
    }, [threadData]);

    React.useEffect(() => {
        const filterRequestSentIfExist = {
            userMeId: me._id
        };

        if (!threadId && createThreadIfNeeded && participantsIds?.length && me?._id) {
            // Create a new thread
            createThread({
                variables: {
                    data: {
                        dataMain: {
                            author: me._id,
                            participants: participantsIds
                        }
                    }
                }
            }).then((res: any) => {
                const data = res?.data?.createThread?.updatedData;

                if (data) {
                    socketEvents.emit.newThread({ threadId: data.id, participantsIds });

                    getThread({
                        variables: {
                            filter: {
                                filterMain: {
                                    _id: data.id
                                },
                                filterRequestSentIfExist
                            }
                        }
                    });
                }
            });
        } else if (threadId) {
            // Get the thread
            getThread({
                variables: {
                    filter: {
                        filterMain: {
                            _id: threadId
                        },
                        filterRequestSentIfExist
                    }
                }
            });
        } else {
            console.error('Error at loading thread data, no thread found');
        }

        return () => {
            if (onRefreshParentScreen) { onRefreshParentScreen(); }

            if (clientRef?.current?.cache?.evict) {
                clientRef.current.cache.evict({ fieldName: 'threadMessages', broadcast: false });
            }
        };
    }, []);

    // First load:
    React.useEffect(() => {
        if (threadData?.thread?.pageInfo?.doRedirection) {
            navigation.goBack();

            displayAlert({
                message: t(threadData?.thread?.pageInfo?.message),
                confirmOk: t('userDetail.secondaryActions.close')
            });

            return;
        }

        if (threadData?.thread?.data?.id) {
            const nextParticipantsIdsAll = threadData?.thread?.data?.participants?.map((participant: IUser) => participant?.id);
            const nextParticipantsIdsFront = nextParticipantsIdsAll?.filter((participant: string) => (participant && (participant !== me._id)));

            setThread(threadData?.thread?.data);
            setParticipantsIdsAll(nextParticipantsIdsAll);
            setParticipantsIdsFront(nextParticipantsIdsFront);
            setIsBetweenTwoUsers(nextParticipantsIdsFront?.length === 1);

            getThreadMessages({
                variables: {
                    filter: {
                        filterMain: {
                            threadId: threadData?.thread?.data?.id
                        }
                    },
                    data: {
                        dataMain: {
                            participantsIdsFront: nextParticipantsIdsFront
                        }
                    },
                    offset: 0, // skip
                    limit: itemsPerPage
                }
            });
        }
    }, [threadData]);

    // Load more:
    const onLoadMessagesMore = () => {
        if (!isLastPage && !isLoadingMore && fetchMoreThreadMessages) {
            setIsLoadingMore(true);

            fetchMoreThreadMessages({
                variables: {
                    offset: threadMessageData?.threadMessages?.data?.length // skip
                }
            }).finally(() => {
                setIsLoadingMore(false);
            });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (threadData?.thread?.data?.id) {
                // Socket events, join threads:
                socketEvents.emit.joinThreads([threadData.thread.data.id]);

                return () => {
                    socketEvents.emit.leaveThreads([threadData.thread.data.id]);
                };
            }
        }, [threadData])
    );

    // Socket events:
    React.useEffect(() => {
        if (realtimeDataTyping) {
            console.log('[socket] typing ');

            const participantTyping = thread?.participants?.find((participant: IUser) => participant.id === realtimeDataTyping.userId);
            setTyping({ isTyping: realtimeDataTyping.isTyping, participantTyping });

            // reset redux:
            typingActionProps(null);
        }
    }, [realtimeDataTyping]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewMessage) {
            console.log('[socket] newMessage ');

            setMessages((previousMessages: IThreadMessage[]) => {
                const inverted = Platform.OS !== 'web';
                const nextMessages: IThreadMessage[] = [...previousMessages];

                if (inverted) {
                    nextMessages.unshift(realtimeNewMessage);
                } else {
                    nextMessages.push(realtimeNewMessage);
                }

                return nextMessages;
            });

            onSetMessagesAsRead();

            // reset redux:
            newMessageActionProps(null);
        }
    }, [realtimeNewMessage]);

    // Socket events:
    React.useEffect(() => {
        if (realtimeNewRequestResponse && realtimeNewRequestResponse?.threadId === thread?.id) {
            // If new request response received - Update:
            console.log('[socket] newRequestResponse');

            setMessages((previousMessages: IThreadMessage[]) => {
                const nextMessages: IThreadMessage[] = [...previousMessages];

                const indexFound = nextMessages.findIndex((message: IThreadMessage) => message.request?.id === realtimeNewRequestResponse.id);
                if (indexFound < 0 || !nextMessages[indexFound]) { return nextMessages; }

                const dataToUpdate = _.cloneDeep(nextMessages[indexFound] || {});
                dataToUpdate.request = realtimeNewRequestResponse;

                nextMessages[indexFound] = dataToUpdate;

                return nextMessages;
            });

            // reset redux:
            setRealtimeNewRequestResponseActionProps(null);
        }
    }, [realtimeNewRequestResponse]);

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (
                realtimeNewBlock?.senderId
                && participantsIdsFront?.includes(realtimeNewBlock.senderId)
                && isBetweenTwoUsers
            ) {
                // If new block received - go back:
                console.log('[socket] newBlock');

                // reset redux:
                setRealtimeNewBlockActionProps(null);

                navigation.goBack();

                displayAlert({
                    message: t('error.blockedProfile_seeThread'),
                    confirmOk: t('userDetail.secondaryActions.close')
                });
            }
        }, [realtimeNewBlock])
    );

    const formatThreadMessageData = (
        threadMessages: IThreadMessage,
        isCreate = false,
        threadParam: any = null
    ) => {
        let authorMessage = {} as IUser;

        if (isCreate) {
            authorMessage = me as IUser;
        } else {
            const authorMessageFound = threadParam?.participants?.find((participant: IUser) => participant?.id === threadMessages?.author);
            if (authorMessageFound) {
                authorMessage = {...authorMessageFound};

                if (authorMessageFound?.id && !authorMessage?._id) {
                    authorMessage._id = authorMessageFound.id;
                }
            }
        }

        return { ...threadMessages, user: authorMessage };
    };

    React.useEffect(() => {
        if (threadMessageData?.threadMessages?.data?.length) {
            const messagesFormatted = threadMessageData.threadMessages?.data?.map((threadMessage: IThreadMessage) => {
                return formatThreadMessageData(threadMessage, false, thread);
            });

            setMessages(messagesFormatted || []);
            onSetMessagesAsRead();
        }
    }, [threadMessageData]);

    // Set all messages in thread as read:
    const onSetMessagesAsRead = () => {
        if (thread?.id && me?._id) {
            setMessagesAsRead({
                variables: {
                    filter: {
                        filterSetAsRead: {
                            threadId: thread.id,
                            author: { $ne: me._id },
                            'readBy.user': { $ne: me._id }
                        }
                    },
                    data: {
                        dataSetAsRead: {
                            $push: { readBy: { at: new Date(), user: me._id }
                            }
                        }
                    }
                }
            });
        }
    };

    const onSetStateNewPendingMessage = (text = 'Sending ...') => {
        setMessages((previousMessages: IThreadMessage[]) => {
            const inverted = Platform.OS !== 'web';
            const nextMessages: IThreadMessage[] = [...previousMessages];
            const nextMessage: IThreadMessage = {
                author: me._id,
                text,
                threadId: thread?.id,
                createdAt: new Date()
            };

            const sentMessageFullFormat: IThreadMessage = formatThreadMessageData(nextMessage, true, thread);
            sentMessageFullFormat._id = 'tmp';
            sentMessageFullFormat.pending = true;

            if (inverted) {
                nextMessages.unshift(sentMessageFullFormat);
            } else {
                nextMessages.push(sentMessageFullFormat);
            }

            return nextMessages;
        });
    };

    const onSetStateNewSuccessMessage = (hasError: boolean, nextMessage: IThreadMessage, threadParam: IThread) => {
        setMessages((previousMessages: IThreadMessage[]) => {
            const inverted = Platform.OS !== 'web';
            const nextMessages: IThreadMessage[] = [...previousMessages?.filter((msg) => msg?._id !== 'tmp')];
            const sentMessageFullFormat: IThreadMessage = formatThreadMessageData(nextMessage, true, threadParam);

            if (!sentMessageFullFormat?._id) {
                sentMessageFullFormat._id = getUniqueId();
            }

            if (!hasError) {
                if (previousMessages?.length === 0) { sentMessageFullFormat.isFirstMessageInThread = true; }
                socketEvents.emit.newMessage(sentMessageFullFormat);
            } else {
                sentMessageFullFormat.sent = false;
                sentMessageFullFormat.pending = false;
            }

            if (inverted) {
                nextMessages.unshift(sentMessageFullFormat);
            } else {
                nextMessages.push(sentMessageFullFormat);
            }

            return nextMessages;
        });
    };

    const onSendMessage = React.useCallback((nextMessages: IThreadMessage, threadParam: IThread) => {
        const nextMessage = nextMessages || {};
        const text = nextMessage.text;
        const image = nextMessage.image;
        const video = nextMessage.video;
        const audio = nextMessage.audio;

        if (
            !text
            && !image
            && !video
            && !audio
            && (!threadParam?.id || !me._id)
        ) { return; }

        const sentMessagesDb: IThreadMessage = {
            author: me._id,
            threadId: threadParam?.id,
            createdAt: new Date(),
            // readBy: []
        };

        if (text) { sentMessagesDb.text = text; }
        if (image) { sentMessagesDb.image = image; }
        if (video) { sentMessagesDb.video = video; }
        if (audio) { sentMessagesDb.audio = audio; }

        // Just for tests:
        /*
        for (let i = 0; i < threadParam?.participants?.length; i++) {
            sentMessagesDb.readBy.push({
                user: threadParam.participants[i]?.id,
                at: new Date()
            });
        }
        */

        createThreadMessage({
            variables: {
                data: {
                    dataMain: sentMessagesDb,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    ...(image && { dataUserPhoto: nextMessage })
                }
            }
        }).then((res: any) => {
            const updatedData = res?.data?.createThreadMessage?.updatedData;
            const hasError = !updatedData?.id;

            // If message saved in DB:
            onSetStateNewSuccessMessage(hasError, updatedData, threadParam);
        }).catch(() => {
            onSetStateNewSuccessMessage(true, { ...sentMessagesDb, _id: nextMessage._id }, threadParam);
        });
    }, []);

    const renderCustomView = (props: any) => {
        const { request } = props.currentMessage;

        if (request) {
            const { senderId, privatePhotosGranted, id } = request as IUserInteraction;
            const isSenderMe = (!senderId || senderId === me._id);
            let messageKey = '';

            if (isSenderMe) {
                if (privatePhotosGranted === 'granted') {
                    messageKey = 'user.userInteractions.myRequest.sent_replyGranted';
                } else {
                    messageKey = 'user.userInteractions.myRequest.sent';
                }
            }

            return (
                <View style={[props.containerStyle, { flexDirection: 'row' }]}>
                    <View style={{ width: '100%', padding: 6 }}>
                        {
                            isSenderMe ? (
                                <Text style={{ color: '#fff' }}>{ t(messageKey) }</Text>
                            ) : (
                                <ReplyToRequest
                                    myRequest={request}
                                    fieldId={id}
                                    threadId={thread?.id}
                                    onSetStateAtSubmit={(updatedData: any) => {
                                        setMessages((previousMessages: IThreadMessage[]) => {
                                            const nextData = [...previousMessages];
                                            const indexFound = previousMessages?.findIndex((el: IThreadMessage) => (el?.request?.id && (el.request.id === updatedData.id)));
                                            if (indexFound < 0 || !nextData[indexFound]) { return nextData; }

                                            const dataToUpdate = _.cloneDeep(nextData[indexFound] || {});

                                            if (dataToUpdate) {
                                                dataToUpdate.request.privatePhotosGranted = updatedData.privatePhotosGranted;
                                                dataToUpdate.request.privatePhotosGrantedAt = updatedData.privatePhotosGrantedAt;
                                                dataToUpdate.request.isSeenByReceiver = true;
                                            }

                                            nextData[indexFound] = dataToUpdate;

                                            return nextData;
                                        });
                                    }}
                                />
                            )
                        }
                    </View>
                </View>
            );
        }

        return null;
    };

    const renderBubble = (props: Readonly<BubbleProps<any>>) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: { backgroundColor: '#dddddd' },
                    right: { backgroundColor: '#779cd0' }
                }}
            />
        );
    };

    const renderMessageImage = (props: any) => {
        const selectedImage = props.currentMessage;
        const uri = selectedImage?.image;
        if (!uri) { return; }

        return (
            <View style={{ borderRadius: 15, padding: 2 }}>
                <TouchableHighlight
                    activeOpacity={0.8}
                    underlayColor="transparent"
                    onPress={() => {
                        // Get all images in the thread:
                        const photos = messages
                            ?.filter((message: IThreadMessage) => message?.image && (message?.author === selectedImage?.author));

                        const indexCurrentPhoto = photos
                            ?.reverse() // TODO voir pour Android si reverse ?
                            ?.findIndex((message: IThreadMessage) => message?._id === selectedImage?._id);

                        if (indexCurrentPhoto !== -1 && photos?.length && photos[indexCurrentPhoto]) {
                            navigation.navigate('PhotoDetailModal', {
                                photos: photos.map((item: any) => ({ url: item?.image })),
                                indexCurrentPhoto
                            });
                        } else {
                            console.error('Not image found!');
                        }
                    }}
                >
                    <Image
                        resizeMode="contain"
                        style={{
                            width: 200,
                            height: 200,
                            padding: 6,
                            borderRadius: 15,
                            resizeMode: 'cover'
                        }}
                        source={{ uri }}
                        alt="Image"
                    />
                </TouchableHighlight>
            </View>
        );
    };

    const onOpenMyPhotosPicker = () => {
        bottomSheetModalRef.current?.present();
    };

    const renderActions = (/* props: Readonly<ActionsProps> */) => {
        return (
            <Box style={styles.actionsContainer}>
                <Box style={styles.actionsItem}>
                    {/* Open my images picker */}
                    <Button
                        rounded="none"
                        variant="unstyle"
                        pl="0"
                        pr="0"
                        _text={{ fontSize: 16 }}
                        onPress={() => {
                            // Use => https://gorhom.github.io/react-native-bottom-sheet/usage
                            onOpenMyPhotosPicker();
                        }}
                    >
                        📷
                    </Button>
                </Box>

                {/* Last item */}
                <Box style={[styles.actionsItem, { marginHorizontal: 0 }]}>
                    <Button
                        rounded="none"
                        variant="unstyle"
                        pl="0"
                        pr="0"
                        _text={{ fontSize: 16 }}
                        onPress={() => {
                            if (showActionSheetWithOptions) {
                                const options = [
                                    'Close',
                                    'Send my position'
                                ];

                                const hasAlreadySentRequest = !!thread.userInteractions?.myRequest?.sent?.id;
                                const participantsFront = thread?.participants?.filter((participant: IUser) => (participant?.id && (participant.id !== me._id)));
                                const hasParticipantFrontPrivatePhotos = participantsFront?.length && participantsFront[0].hasPrivatePhotos;

                                if (isBetweenTwoUsers && hasParticipantFrontPrivatePhotos && !hasAlreadySentRequest) {
                                    options.push('Ask private photos');
                                }

                                showActionSheetWithOptions(
                                    {
                                        options,
                                        cancelButtonIndex: 0,
                                        userInterfaceStyle: 'dark'
                                    },
                                    (buttonIndex) => {
                                        switch (buttonIndex) {
                                            case 0:
                                                // Close
                                                break;
                                            case 1:
                                                // Send my position
                                                break;
                                            case 2:
                                                // Ask private photos
                                                if (isBetweenTwoUsers && !hasAlreadySentRequest) {
                                                    onSendRequest({
                                                        sendRequest,
                                                        participantsIds: participantsIdsAll,
                                                        userFront: { id: participantsIdsFront[0] },
                                                        me,
                                                        onSetStateAtSubmit: (userInterSendRequest: IUserInteraction) => {
                                                            const nextMessage: IThreadMessage = {
                                                                _id: getUniqueId(),
                                                                threadId: thread.id,
                                                                createdAt: new Date(),
                                                                requestId: userInterSendRequest.id,
                                                                request: userInterSendRequest,
                                                                user: me
                                                            };

                                                            onSetStateNewSuccessMessage(false, nextMessage, thread);

                                                            setThread((previousThread: IThread) => {
                                                                const nextThread = _.cloneDeep(previousThread || {});

                                                                if (me?._id) {
                                                                    if (!nextThread?.userInteractions) { nextThread.userInteractions = {} as any; }
                                                                    if (!nextThread?.userInteractions?.myRequest) { nextThread.userInteractions.myRequest = {} as any; }
                                                                    if (!nextThread?.userInteractions?.myRequest?.sent) { nextThread.userInteractions.myRequest.sent = {} as any; }

                                                                    nextThread.userInteractions.myRequest.sent = userInterSendRequest;
                                                                }

                                                                return nextThread;
                                                            });
                                                        },
                                                        socketEvents
                                                    });
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                );
                            }
                        }}
                    >
                        ➕
                    </Button>
                </Box>
            </Box>
        );
    };

    if (createThreadError || getThreadError || getThreadMessageError) {
        console.error(createThreadError);
        console.error(getThreadError);
        console.error(getThreadMessageError);
        return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (createThreadMessageError) {
        // TODO Display toast
        console.error(createThreadMessageError);
    }

    if (setMessagesAsReadError) {
        console.error(setMessagesAsReadError);
    }

    if (sendRequestError) {
        // TODO Display toast
        console.error(sendRequestError);
    }

    // console.log('thread ==> ', thread);
    // console.log('messages =>', messages);

    const onStopTyping = _.debounce(() => {
        socketEvents.emit.stopTyping({
            isTyping: false,
            threadId: thread?.id,
            userId: null
        });
    }, 1200);

    /*
    const renderMessageVideo = () => {
        // TODO
    };

    const renderMessageAudio = () => {
        // TODO
    };
    */

    const parsePatterns = (linkStyle: any) => {
        return [
            {
                pattern: /#(\w+)/,
                style: linkStyle,
                onPress: (tag: any) => {
                    console.log(`Pressed on hashtag: ${tag}`);
                }
            },
            {
                type: 'phone',
                style: linkStyle,
                onPress: (phone: any) => {
                    console.log(`Pressed on phone: ${phone}`);
                }
            },
            {
                type: 'url',
                style: linkStyle,
                onPress: async (url: any) => {
                    const supported = await Linking.canOpenURL(url);
                    if (supported) { await Linking.openURL(url); }
                }
            }
        ];
    };

    return (
        <Box style={{ flex: 1 }}>
            { (getThreadLoading || getThreadMessageLoading) && <Spinner /> }

            <GiftedChat
                messages={messages || []}
                onSend={(nextMessages) => {
                    const nextMessage = (nextMessages?.length && nextMessages[0]) || {};

                    onSetStateNewPendingMessage(nextMessage.text);
                    onSendMessage(nextMessage, thread);
                }}
                onInputTextChanged={(text: string) => {
                    if (text) {
                        socketEvents.emit.startTyping({
                            isTyping: true,
                            threadId: thread?.id,
                            userId: me?._id
                        });
                        onStopTyping();
                    }
                }}
                user={{
                    _id: me._id as string,
                    name: me.displayName,
                    avatar: 'https://placeimg.com/140/140/any'
                }}
                scrollToBottom
                showUserAvatar
                renderBubble={renderBubble}
                renderActions={renderActions}
                renderMessageImage={renderMessageImage}
                renderCustomView={renderCustomView}
                isTyping={typing.isTyping}
                parsePatterns={parsePatterns}
                infiniteScroll
                loadEarlier={!isLastPage}
                onLoadEarlier={onLoadMessagesMore}
                isLoadingEarlier={isLoadingMore}
                shouldUpdateMessage={() => true}
            />

            <FilesBottomSheetPicker
                ref={bottomSheetModalRef}
                fetchRecentFilesGql={{
                    query: USER_PHOTOS_THREAD,
                    params: {
                        variables: {
                            filter: {
                                filterMain: {
                                    // threadId: thread.id,
                                    authorId: me._id
                                }
                            }
                        }
                    }
                }}
                paramsUploadFile={{
                    entityName: 'threadMessage',
                    entityId: thread?.id,
                    isMultipleSize: true,
                    isMultipleSelect: false
                }}
                onLoadPending={() => {
                    onSetStateNewPendingMessage('Sending ...');
                }}
                onLoadSuccess={(data: any) => {
                    const filesUrls = data?.filesUrls;

                    const nextMessage: IThreadMessage = {
                        _id: data?.fileId,
                        fileId: data?.fileId,
                        image: filesUrls?.size_320_400,
                        ...filesUrls,
                        isNewUploadedFile: !!data?.isNewUploadedFile
                    };

                    onSendMessage(nextMessage, thread);
                }}
                onLoadError={() => {
                    setMessages((previousMessages: IThreadMessage[]) => {
                        const inverted = Platform.OS !== 'web';
                        const nextMessage: IThreadMessage[] = [...previousMessages?.filter((msg) => msg?._id !== 'tmp')];
                        const sentMessagesDb: IThreadMessage = {
                            author: me._id,
                            text: 'Error !',
                            threadId: thread?.id,
                            createdAt: new Date()
                        };

                        const sentMessagesFullFormat: IThreadMessage = formatThreadMessageData(sentMessagesDb, true, thread);
                        sentMessagesFullFormat._id = 'error';
                        sentMessagesFullFormat.pending = false;

                        if (inverted) {
                            nextMessage.unshift(sentMessagesFullFormat);
                        } else {
                            nextMessage.push(sentMessagesFullFormat);
                        }

                        return nextMessage;
                    });
                }}
            />
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        realtimeDataTyping: state.realtimeData.typing,
        realtimeNewMessage: state.realtimeData.newMessage,
        realtimeNewRequestResponse: state.realtimeData.newRequestResponse,
        realtimeNewBlock: state.realtimeData.newBlock
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        newMessageActionProps: bindActionCreators(newMessageAction, dispatch),
        typingActionProps: bindActionCreators(typingAction, dispatch),
        setRealtimeNewRequestResponseActionProps: bindActionCreators(setRealtimeNewRequestResponseAction, dispatch),
        setRealtimeNewBlockActionProps: bindActionCreators(setRealtimeNewBlockAction, dispatch),
    };
}

const ThreadDetailScreen = connectActionSheet(ThreadDetailScreenComponent);

export default connect(mapStateToProps, mapDispatchToProps)(ThreadDetailScreen);
