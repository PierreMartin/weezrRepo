// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import { TouchableOpacity } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Badge, Box, Center, Icon } from "native-base";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RowMap } from "react-native-swipe-list-view";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { StackNavigationProp } from '@react-navigation/stack/src/types';
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { SocketEvents } from "../context/SocketEvents";
import { Text } from '../components';
import { setCountAllUnreadMessagesAction } from "../reduxActions/notifications";
import { Spinner } from "../components/Spinner";
import { newMessageAction, setRealtimeNewBlockAction } from "../reduxActions/realtimeData";
import { truncate } from "../toolbox/toolbox";
import { List } from "../components/List";
import { IThread, IUser } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from "./TabThreadsListScreen.styles";

const styles = getStyles();
const itemsPerPage = 20;

interface ITabThreadsListScreen extends StackScreenProps<any, 'TabThreadsList'> {
    navigation: StackNavigationProp<any, any>;
    selectedTab: string;
    me: IUser;
    setCountAllUnreadMessagesActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    realtimeNewMessage: States.INewMessage;
    realtimeNewBlock: States.INewBlock;
    newMessageActionProps: (data: any) => void;
    setRealtimeNewBlockActionProps: (data: any) => void;
    countAllUnreadMessages?: number;
    showActionSheetWithOptions: (data: any, callback: (buttonIndex: number) => any) => any;
}

const THREADS = gql`
    query ($filter: Thread_Filter, $offset: Int, $limit: Int) {
        threads(filter: $filter, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                _id
                participants {
                    id
                    email
                    displayName
                    images
                    isOnline
                }
                latestMessage {
                    text
                    image
                    video
                    audio
                    location
                    requestId
                    createdAt
                    sent
                    received
                }
                unreadMessages
            }
        }
    }
`;

const SET_MESSAGES_AS_IGNORED = gql`
    mutation ($filter: ThreadMessage_Filter, $data: ThreadMessage_Data) {
        setMessagesAsIgnored(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;

function TabThreadsListScreenComponent({
    navigation,
    selectedTab,
    me,
    setCountAllUnreadMessagesActionProps,
    realtimeNewMessage,
    realtimeNewBlock,
    newMessageActionProps,
    setRealtimeNewBlockActionProps,
    showActionSheetWithOptions
    // countAllUnreadMessages
}: ITabThreadsListScreen) {
    const [threads, setThreads] = React.useState<IThread[]>([]);
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);

    const { t } = useTranslation();

    const [getThreads, {
        loading: getThreadsLoading,
        data: threadsData,
        error: getThreadsError,
        fetchMore: fetchMoreThreads
    }] = useLazyQuery(THREADS, { fetchPolicy: 'network-only' });

    const [setMessagesAsIgnored, { error: setMessagesAsIgnoredError }] = useMutation(SET_MESSAGES_AS_IGNORED, {
        update: (cache, data: any) => {
            const { updatedData } = data?.data?.setMessagesAsIgnored;

            // If deleted:
            if (updatedData) {
                cache.evict({ fieldName: 'threads', broadcast: false });
                cache.evict({ fieldName: 'threadMessages', broadcast: false });
                cache.gc();
            }
        }
    });

    const socketEvents = React.useContext(SocketEvents);

    const { isLastPage, isLimitReached } = threadsData?.threads?.pageInfo || {};

    const getQueryVariables = () => {
        const variables: any = {};

        variables.filter = {
            filterMain: {
                participants: { $in: [me?._id] }
            },
            // Count unread by each threads:
            filterCountUnread: {
                $and: [
                    { author: { $ne: me?._id } },
                    { 'readBy.user': { $nin: [null, me?._id] } },
                ]
            }
        };

        if (selectedTab === 'unread') {
            variables.filter.filterUnread = {
                $and: [
                    { 'messages.author': { $ne: me?._id } },
                    { 'messages.readBy.user': { $nin: [null, me?._id] } },
                ]
            };
        } else if (selectedTab === 'online') {
            variables.filter.filterOnline = {
                $and: [
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { 'full_participants._id': { $ne: me?._id } },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { 'full_participants.isOnline': { $eq: true } }
                ]
            };
        }

        return variables;
    };

    // First query for get threads:
    const loadThreads = () => {
        const variables = getQueryVariables();

        getThreads({
            variables: {
                ...variables,
                offset: 0, // skip
                limit: itemsPerPage
            }
        });
    };

    // Load more threads:
    const onLoadThreadsMore = () => {
        if (!isLastPage && !isLoadingMore && !isLimitReached && fetchMoreThreads) {
            setIsLoadingMore(true);
            const variables = getQueryVariables();

            fetchMoreThreads({
                variables: {
                    ...variables,
                    offset: threadsData?.threads?.data?.length // skip
                }
            }).finally(() => {
                setIsLoadingMore(false);
            });
        }
    };

    const onDeleteThread = (selectedItemId: string) => {
        if (selectedItemId && threads?.length) {
            setMessagesAsIgnored({
                variables: {
                    filter: {
                        filterSetAsIgnored: {
                            threadId: selectedItemId,
                            'ignoredBy.user': { $ne: me._id }
                        }
                    },
                    data: {
                        dataSetAsIgnored: {
                            $push: { ignoredBy: { user: me._id } }
                        }
                    }
                }
            }).then((res) => {
                if (res?.data?.setMessagesAsIgnored?.updatedData) {
                    const nextThreads = [...threads];
                    const indexFoundToDelete = threads.findIndex((item: IThread) => item._id === selectedItemId);

                    if (indexFoundToDelete !== -1) {
                        nextThreads.splice(indexFoundToDelete, 1);
                        setThreads(nextThreads);
                    }

                    // Refresh unread messages:
                    if (me?._id) {
                        setCountAllUnreadMessagesActionProps({ userId: me?._id });
                    }

                    setTimeout(() => { socketEvents.emit.joinThreads([selectedItemId]); }, 6000);
                }
            });
        }
    };

    // For swipe
    const onCloseSwipedRow = (rowMap: RowMap<any>, selectedItemId: string) => {
        if (rowMap && rowMap[selectedItemId]) { rowMap[selectedItemId].closeRow(); }
    };

    // For swipe
    const onDeleteRow = (
        rowMap: RowMap<any>,
        selectedItemId: string,
        performHeightAnimation: (selectedItemId: string) => Promise<boolean>
    ) => {
        if (showActionSheetWithOptions) {
            showActionSheetWithOptions(
                {
                    options: [
                        t('tabThreadsListScreen.onDeleteThread.confirmCancel'),
                        t('tabThreadsListScreen.onDeleteThread.confirmOk')
                    ],
                    title: t('tabThreadsListScreen.onDeleteThread.confirmTitle'),
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 1,
                    userInterfaceStyle: 'dark'
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 0:
                            // Cancel
                            onCloseSwipedRow(rowMap, selectedItemId);
                            break;
                        case 1:
                            // OK
                            performHeightAnimation(selectedItemId).then(() => {
                                onDeleteThread(selectedItemId);
                            });
                            break;
                        default:
                            break;
                    }
                }
            );
        }
    };

    const renderHiddenFields = (
        itemData: any,
        rowMap: RowMap<any>,
        performHeightAnimation: (selectedItemId: string) => Promise<boolean>
    ) => {
        return (
            <>
                <TouchableOpacity
                    style={styles.backRightBtn}
                    onPress={() => onDeleteRow(rowMap, itemData.item.id, performHeightAnimation)}
                >
                    <Icon as={Ionicons} name="trash-outline" size="md" color="#fff" />
                </TouchableOpacity>
            </>
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            // Load all threads:
            loadThreads();

            // Get all unread messages:
            if (me?._id) {
                setCountAllUnreadMessagesActionProps({ userId: me?._id });
            }
        }, [])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewMessage) {
                const threadFound = threads?.find((previousThread: IThread) => previousThread._id === realtimeNewMessage.threadId);

                if (realtimeNewMessage.isFirstMessageInThread || !threadFound?.latestMessage) {
                    // If new thread created - This is the first message in this thread at this state
                    console.log('[socket] newThread');
                    loadThreads();
                } else {
                    // If new message created - Update count unread messages for each threads:
                    console.log('[socket] newMessage');

                    setThreads((previousThreads: IThread[]) => {
                        const nextThreads = [...previousThreads];
                        const indexFound = previousThreads?.findIndex((previousThread: IThread) => previousThread._id === realtimeNewMessage.threadId);
                        const threadToUpdate = _.cloneDeep(nextThreads[indexFound] || {});

                        if (!Object.keys(threadToUpdate)?.length) { return nextThreads; }

                        if (typeof threadToUpdate.unreadMessages === 'number') {
                            threadToUpdate.unreadMessages++;
                        } else {
                            threadToUpdate.unreadMessages = 1;
                        }

                        if (threadToUpdate.latestMessage) {
                            threadToUpdate.latestMessage.text = realtimeNewMessage.text;
                            threadToUpdate.latestMessage.image = realtimeNewMessage.image;
                            threadToUpdate.latestMessage.video = realtimeNewMessage.video;
                            threadToUpdate.latestMessage.audio = realtimeNewMessage.audio;
                            threadToUpdate.latestMessage.location = realtimeNewMessage.location;
                            threadToUpdate.latestMessage.createdAt = realtimeNewMessage.createdAt;
                            threadToUpdate.latestMessage.sent = realtimeNewMessage.sent;
                            threadToUpdate.latestMessage.received = realtimeNewMessage.received;
                        }

                        nextThreads[indexFound] = threadToUpdate;

                        return nextThreads;
                    });
                }

                // Update ALL count unread messages: (Already done in GetDataComponent)
                /*
                let nextCountAllUnreadMessages = 1;
                if (typeof countAllUnreadMessages === 'number') {
                    nextCountAllUnreadMessages = countAllUnreadMessages + 1;
                }

                setCountAllUnreadMessagesActionProps(null, nextCountAllUnreadMessages);
                */

                // reset redux:
                newMessageActionProps(null);
            }
        }, [realtimeNewMessage])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewBlock?.senderId) {
                // If new block received:
                console.log('[socket] newBlock');

                setThreads((previousThreads: IThread[]) => {
                    const nextThreads = previousThreads?.filter((previousThread: IThread) => {
                        const isBetweenTwoUsers = previousThread?.participants?.length === 2;
                        if (!isBetweenTwoUsers) { return true; }

                        const isOneParticipantBlocked = !!previousThread?.participants?.find((participant) => (participant?.id && participant?.id === realtimeNewBlock?.senderId));

                        return !isOneParticipantBlocked;
                    });

                    return nextThreads;
                });

                // reset redux:
                setRealtimeNewBlockActionProps(null);
            }
        }, [realtimeNewBlock])
    );

    useFocusEffect(
        React.useCallback(() => {
            setThreads(threadsData?.threads?.data);

            // Already done in GetDataComponent:
            /*
            const threadIdsToAdd = threadsData?.threads?.data?.map((thread: IThread) => thread?._id);
            if (threadIdsToAdd) { socketEvents.emit.joinThreads(threadIdsToAdd); }

            return () => {
                const threadIdsToRemove = threadsData?.threads?.data?.map((thread: IThread) => thread?._id);
                if (threadIdsToRemove) { socketEvents.emit.leaveThreads(threadIdsToRemove); }
            };
            */
        }, [threadsData])
    );

    if (getThreadsError) {
        console.error(getThreadsError);
        return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (setMessagesAsIgnoredError) {
        console.error(setMessagesAsIgnoredError);
    }

    const renderFields = (fieldsSource: IThread) => {
        const usersFrontFound = fieldsSource?.participants?.filter((participant: IUser) => participant.id !== me?._id);
        const firstUserFrontFound = usersFrontFound[0] || {};
        const {
            text,
            image,
            video,
            audio,
            location,
            requestId,
            sent,
            received
        } = fieldsSource?.latestMessage;

        let renderLatestMessage = ' ';

        if (text) { renderLatestMessage = truncate(text, 30, '...'); }
        if (image) { renderLatestMessage = '???? Photo'; }
        if (video) { renderLatestMessage = '???? Video'; }
        if (audio) { renderLatestMessage = '???? Audio'; }
        if (location) { renderLatestMessage = '???? Map'; }
        if (requestId) { renderLatestMessage = '???? Request for private photos'; }

        return {
            title: firstUserFrontFound?.displayName || 'User',
            content: renderLatestMessage,
            isOnline: firstUserFrontFound?.isOnline,
            at: fieldsSource?.latestMessage?.createdAt,
            checkmark: () => {
                let icon = null;
                if (sent && received) {
                    icon = 'checkmark-done-outline';
                } else if (sent) {
                    icon = 'checkmark-outline';
                }

                return icon ? <Icon as={Ionicons} name={icon} size="sm" /> : '';
            },
            avatar: firstUserFrontFound as IUser,
            navigate: { routeName: 'ThreadDetail', paramList: { threadId: fieldsSource._id } },
            badge: () => {
                return (
                    <>
                        {(fieldsSource?.unreadMessages && fieldsSource.unreadMessages > 0) ? (
                            <Badge
                                colorScheme="danger"
                                rounded="full"
                                zIndex={1}
                                variant="solid"
                                _text={{fontSize: 12}}
                            >
                                {fieldsSource.unreadMessages}
                            </Badge>
                        ) : ''}
                    </>
                );
            }
        };
    };

    return (
        <Box style={styles.main}>
            { getThreadsLoading && <Spinner /> }

            <List
                data={threads}
                navigation={navigation}
                renderFields={renderFields}
                isDataLoading={getThreadsLoading}
                isDataLoadingMore={isLoadingMore}
                isDataError={getThreadsError}
                onLoadData={loadThreads}
                onLoadMoreData={onLoadThreadsMore}
                isSwipeable
                swipeListComponentProps={{
                    renderHiddenFields,
                    enabledAnimation: true
                }}
                heightRow={58}
            />
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        // countAllUnreadMessages: state.notifications.countAllUnreadMessages,
        realtimeNewMessage: state.realtimeData.newMessage,
        realtimeNewBlock: state.realtimeData.newBlock
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        setCountAllUnreadMessagesActionProps: bindActionCreators(setCountAllUnreadMessagesAction, dispatch),
        newMessageActionProps: bindActionCreators(newMessageAction, dispatch),
        setRealtimeNewBlockActionProps: bindActionCreators(setRealtimeNewBlockAction, dispatch)
    };
}

const TabThreadsListScreen = connectActionSheet(TabThreadsListScreenComponent);

export default connect(mapStateToProps, mapDispatchToProps)(TabThreadsListScreen);
