// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import { StackScreenProps } from "@react-navigation/stack";
import { Badge, Box, Button, Center, Icon } from "native-base";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { StackNavigationProp } from '@react-navigation/stack/src/types';
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Text } from '../components';
import {
    setCountAllNotSeenPrimaryNotificationsAction,
    setCountAllNotSeenLikesAction,
    setCountAllNotSeenRequestsAction
} from "../reduxActions/notifications";
import {
    setRealtimeNewPrimaryNotificationAction,
    setRealtimeNewLikeAction,
    setRealtimeNewRequestAction,
    setRealtimeNewBlockAction
} from "../reduxActions/realtimeData";
import { Spinner } from "../components/Spinner";
import { truncate } from "../toolbox/toolbox";
import { List } from "../components/List";
import ReplyToRequest from "../components/ActionsForUserInteractions/ReplyToRequest";
import { IUser, IUserInteraction } from "../entities";
import { States } from "../reduxReducers/states";
import colors from "../styles/colors";
import getStyles from "./TabNotificationsCenterScreen.styles";

const styles = getStyles();
const itemsPerPage = 20;

interface ITabNotificationsCenterScreen extends StackScreenProps<any, 'TabNotificationsCenter'> {
    navigation: StackNavigationProp<any, any>;
    selectedTab: 'all' | 'likes' | 'requests';
    me: IUser;
    setCountAllNotSeenPrimaryNotificationsActionProps: (dataForFetchQuery: any, dataForUpdateState?: any) => any;
    setCountAllNotSeenLikesActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    setCountAllNotSeenRequestsActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    realtimeNewPrimaryNotification: States.INewPrimaryNotification;
    realtimeNewLike: States.INewLike;
    realtimeNewRequest: States.INewRequest;
    realtimeNewBlock: States.INewBlock;
    setRealtimeNewPrimaryNotificationActionProps: (data?: any) => void;
    setRealtimeNewLikeActionProps: (data?: any) => void;
    setRealtimeNewRequestActionProps: (data?: any) => void;
    setRealtimeNewBlockActionProps: (data: any) => void;
    countAllNotSeenPrimaryNotifications?: number;
    countAllNotSeenLikes?: number;
    countAllNotSeenRequests?: number;
}

const LIKES = gql`
    query ($filter: UserInterSendLike_Filter!, $offset: Int, $limit: Int) {
        likes(filter: $filter, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                entityName
                id
                at
                isMutual
                receiverId
                senderId
                sender {
                    id
                    email
                    displayName
                    images
                }
                isSeenByReceiver
            }
        }
    }
`;

const ALL_PRIMARY_NOTIFICATIONS = gql`
    query ($filter: AllPrimaryNotifications_Filter!, $offset: Int, $limit: Int) {
        allPrimaryNotifications(filter: $filter, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                entityName
                id
                at
                receiverId
                senderId
                sender {
                    id
                    email
                    displayName
                    images
                }
                isSeenByReceiver
            }
        }
    }
`;

const REQUESTS = gql`
    query ($filter: UserInterSendRequest_Filter!, $offset: Int, $limit: Int) {
        requests(filter: $filter, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                id
                at
                receiverId
                senderId
                sender {
                    id
                    email
                    displayName
                    images
                }
                isSeenByReceiver
                privatePhotosGranted
                privatePhotosGrantedAt
            }
        }
    }
`;

const SET_PRIMARY_NOTIFICATIONS_AS_SEEN = gql`
    mutation ($filter: AllPrimaryNotifications_Filter, $data: AllPrimaryNotifications_Data) {
        setPrimaryNotificationsAsSeen(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;

const SET_LIKES_AS_SEEN = gql`
    mutation ($filter: UserInterSendLike_Filter, $data: UserInterSendLike_Data) {
        setLikesAsSeen(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;

/*
const SET_VISITORS_AS_SEEN = gql`
    mutation ($filter: UserInterVisit_Filter, $data: UserInterVisit_Data) {
        setVisitorsAsSeen(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData
        }
    }
`;
*/

/* Do in <ActionsForUserInteractions />
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
                receiverId
                senderId
                privatePhotosGranted
                privatePhotosGrantedAt
            }
        }
    }
`;
*/

function TabNotificationsCenterScreen({
    navigation,
    selectedTab,
    me,

    realtimeNewPrimaryNotification,
    realtimeNewLike,
    realtimeNewRequest,
    realtimeNewBlock,

    setRealtimeNewPrimaryNotificationActionProps,
    setRealtimeNewLikeActionProps,
    setRealtimeNewRequestActionProps,
    setRealtimeNewBlockActionProps,

    countAllNotSeenPrimaryNotifications,
    countAllNotSeenLikes,
    countAllNotSeenRequests,

    setCountAllNotSeenPrimaryNotificationsActionProps,
    setCountAllNotSeenLikesActionProps,
    setCountAllNotSeenRequestsActionProps
}: ITabNotificationsCenterScreen) {
    const [data, setData] = React.useState<IUserInteraction[]>([]);
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);

    const [setPrimaryNotificationsAsSeen, { error: setPrimaryNotificationsAsSeenError }] = useMutation(SET_PRIMARY_NOTIFICATIONS_AS_SEEN);
    const [setLikesAsSeen, { error: setLikesAsSeenError }] = useMutation(SET_LIKES_AS_SEEN);
    // const [setVisitorsAsSeen, { error: setVisitorsAsSeenError }] = useMutation(SET_VISITORS_AS_SEEN);

    const countAllNotSeenPrimaryNotificationsRef: any = React.useRef();
    const countAllNotSeenLikesRef: any = React.useRef();
    const countAllNotSeenRequestsRef: any = React.useRef();

    const { t } = useTranslation();

    React.useEffect(() => {
        countAllNotSeenPrimaryNotificationsRef.current = countAllNotSeenPrimaryNotifications;
    }, [countAllNotSeenPrimaryNotifications]);

    React.useEffect(() => {
        countAllNotSeenLikesRef.current = countAllNotSeenLikes;
    }, [countAllNotSeenLikes]);

    React.useEffect(() => {
        countAllNotSeenRequestsRef.current = countAllNotSeenRequests;
    }, [countAllNotSeenRequests]);

    let query = LIKES;
    let mutationName = 'likes';
    switch (selectedTab) {
        case 'all':
            query = ALL_PRIMARY_NOTIFICATIONS; // (visitors + followers)
            mutationName = 'allPrimaryNotifications';
            break;
        case 'likes':
            query = LIKES;
            mutationName = 'likes';
            break;
        case 'requests': // sendRequestForAccessToPrivatePhotos
            query = REQUESTS;
            mutationName = 'requests';
            break;
        default:
            break;
    }

    const [
        getData,
        {
            data: dataSourceGql,
            loading: isDataLoading,
            error: isDataError,
            fetchMore: fetchMoreData
        }
    ] = useLazyQuery(query, { fetchPolicy: 'network-only' });
    const dataGql = dataSourceGql || {};
    const { isLastPage, isLimitReached } = dataGql[mutationName]?.pageInfo || {};

    const getQueryVariables = () => {
        const variables: any = {};

        variables.filter = {
            filterMain: {
                receiverId: me?._id
            }
        };

        return variables;
    };

    // First query for get data:
    const loadData = () => {
        const variables = getQueryVariables();

        getData({
            variables: {
                ...variables,
                offset: 0, // skip
                limit: itemsPerPage
            }
        });
    };

    // Load more data:
    const onLoadMoreData = () => {
        if (!isLastPage && !isLoadingMore && !isLimitReached && fetchMoreData) {
            setIsLoadingMore(true);
            const variables = getQueryVariables();

            fetchMoreData({
                variables: {
                    ...variables,
                    offset: dataGql[mutationName]?.data?.length // skip
                }
            }).finally(() => {
                setIsLoadingMore(false);
            });
        }
    };

    const setNotificationsAsSeen = () => {
        const options = {
            variables: {
                filter: {
                    filterSetAsSeen: {
                        receiverId: me?._id,
                        isSeenByReceiver: { $ne: true }
                    }
                },
                data: {
                    dataSetAsSeen: {
                        isSeenByReceiver: true
                    }
                }
            }
        };

        switch (selectedTab) {
            case "all":
                if (countAllNotSeenPrimaryNotificationsRef.current) {
                    setPrimaryNotificationsAsSeen(options).then((res) => {
                        if (res?.data?.setPrimaryNotificationsAsSeen?.updatedData) {
                            const param = {
                                idsAllNotSeenVisitors: [],
                                countAllNotSeenPrimaryNotifications: 0
                            };

                            setCountAllNotSeenPrimaryNotificationsActionProps(null, param);
                        }
                    });
                }
                break;
            case "likes":
                if (countAllNotSeenLikesRef.current) {
                    setLikesAsSeen(options).then((res) => {
                        if (res?.data?.setLikesAsSeen?.updatedData) {
                            setCountAllNotSeenLikesActionProps(null, 0);
                        }
                    });
                }
                break;
            default:
                break;
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // Load all data:
            loadData();

            // Get all unread interactions:
            if (me?._id) {
                setCountAllNotSeenPrimaryNotificationsActionProps({ userId: me?._id });
                setCountAllNotSeenLikesActionProps({ userId: me?._id });
                setCountAllNotSeenRequestsActionProps({ userId: me?._id });
                // setCountAllNotSeenVisitorsActionProps({ userId: me?._id });

                return () => {
                    // Set as seen:
                    setNotificationsAsSeen();
                };
            }
        }, [selectedTab])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewLike && selectedTab === 'likes') {
                // If new message created - Update count unread messages for each data:
                console.log('[socket] newLike');

                setData((previousData: IUserInteraction[]) => {
                    const nextData = [...previousData];

                    if (realtimeNewLike.isRemoved) {
                        const indexFoundToDelete = nextData?.findIndex((el: IUserInteraction) => el.id === realtimeNewLike.id);
                        if (indexFoundToDelete >= 0) { nextData.splice(indexFoundToDelete, 1); }
                    } else {
                        nextData.unshift(realtimeNewLike);
                    }

                    return nextData;
                });

                // reset redux:
                setRealtimeNewLikeActionProps(null);
            }
        }, [realtimeNewLike])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewPrimaryNotification && selectedTab === 'all') {
                console.log('[socket] newPrimaryNotification');

                setData((previousData: IUserInteraction[]) => {
                    const nextData = [...previousData];

                    switch (realtimeNewPrimaryNotification.entityName) {
                        case 'UserInterVisit':
                            // If user has already visited me:
                            if (realtimeNewPrimaryNotification.hasAlreadyInteracted) {
                                const indexFoundToDelete = nextData?.findIndex((el: IUserInteraction) => el.id === realtimeNewPrimaryNotification.id);

                                // Do moved to the top of the list:
                                if (indexFoundToDelete >= 0 && nextData[indexFoundToDelete]) {
                                    nextData.splice(indexFoundToDelete, 1);
                                    nextData.unshift(realtimeNewPrimaryNotification);
                                } else {
                                    // Out of pagination:
                                    nextData.unshift(realtimeNewPrimaryNotification);
                                }
                            } else {
                                nextData.unshift(realtimeNewPrimaryNotification);
                            }
                            break;
                        case 'UserInterFollow':
                            if (realtimeNewPrimaryNotification.isRemoved) {
                                const indexFoundToDelete = nextData?.findIndex((el: IUserInteraction) => el.id === realtimeNewPrimaryNotification.id);

                                if (indexFoundToDelete >= 0 && nextData[indexFoundToDelete]) {
                                    nextData.splice(indexFoundToDelete, 1);
                                }
                            } else {
                                nextData.unshift(realtimeNewPrimaryNotification);
                            }
                            break;
                        default:
                            break;
                    }

                    return nextData;
                });

                // reset redux:
                setRealtimeNewPrimaryNotificationActionProps(null);
            }
        }, [realtimeNewPrimaryNotification])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewRequest && selectedTab === 'requests') {
                console.log('[socket] newRequest');

                setData((previousData: IUserInteraction[]) => {
                    const nextData = [...previousData];

                    if (realtimeNewRequest.isRemoved) {
                        const indexFoundToDelete = nextData?.findIndex((el: IUserInteraction) => el.id === realtimeNewRequest.id);

                        if (indexFoundToDelete >= 0) { nextData.splice(indexFoundToDelete, 1); }
                    } else {
                        nextData.unshift(realtimeNewRequest);
                    }

                    return nextData;
                });

                // reset redux:
                setRealtimeNewRequestActionProps(null);
            }
        }, [realtimeNewRequest])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewBlock?.senderId) {
                // If new block received:
                console.log('[socket] newBlock');

                setData((previousData: IUserInteraction[]) => {
                    let nextData = [...previousData];

                    nextData = nextData?.filter((el: IUserInteraction) => (el?.senderId && el?.senderId !== realtimeNewBlock.senderId));

                    return nextData;
                });

                // reset redux:
                setRealtimeNewBlockActionProps(null);
            }
        }, [realtimeNewBlock])
    );

    useFocusEffect(
        React.useCallback(() => {
            setData(dataGql[mutationName]?.data);
        }, [dataGql])
    );

    if (isDataError) {
        console.error(isDataError);
        return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (setPrimaryNotificationsAsSeenError) { console.error(setPrimaryNotificationsAsSeenError); }
    if (setLikesAsSeenError) { console.error(setLikesAsSeenError); }
    // if (setVisitorsAsSeenError) { console.error(setVisitorsAsSeenError); }

    const renderFields = (fieldsSource: IUserInteraction) => {
        const {
            id,
            entityName,
            sender,
            at,
            isSeenByReceiver,
            isMutual,
            privatePhotosGranted,
        } = fieldsSource;
        const { displayName, id: userId } = sender as IUser || {};
        const title = displayName ? truncate(displayName, 30, '...') : '';

        const styleButton = {
            p: 1,
            pl: 2,
            pr: 2,
            style: { flex: 1 },
            _text: { fontSize: 11 }
        };

        const fields: any = {
            title,
            content: at,
            at: null,
            avatar: sender as IUser,
            navigate: { routeName: 'UserDetail', paramList: { userId } },
            customRenderContainer: () => null,
            badge: () => {
                return (
                    <>
                        {!isSeenByReceiver ? (
                            <Badge
                                colorScheme="danger"
                                rounded="full"
                                zIndex={1}
                                variant="solid"
                                _text={{fontSize: 12}}
                            >
                                1
                            </Badge>
                        ) : ''}
                    </>
                );
            }
        };

        switch (selectedTab) {
            case "all":
                let content = null;

                switch (entityName) {
                    case 'UserInterVisit':
                        content = t('user.userInteractions.myVisit.received');
                        fields.customRenderContainer = () => {
                            return (
                                <>
                                    <Icon size="7" as={<Ionicons name="eye-outline" />} />
                                </>
                            );
                        };
                        break;
                    case 'UserInterFollow':
                        content = t('user.userInteractions.myFollow.received');
                        fields.customRenderContainer = () => {
                            return (
                                <>
                                    {
                                        // TODO:
                                        (!isMutual) && (
                                            <Box pr={2}>
                                                <Button
                                                    leftIcon={<Icon as={Ionicons} name="star-outline" size="xs" />}
                                                    {...styleButton}
                                                    onPress={() => {
                                                        /*
                                                        sendFollow({
                                                            variables: {
                                                                data: {
                                                                    dataMain: {
                                                                        senderId: me?._id,
                                                                        receiverId: sender.id,
                                                                        at: new Date(),
                                                                        type: 'heart'
                                                                    }
                                                                }
                                                            }
                                                        })
                                                        */
                                                    }}
                                                >
                                                    { t('user.userInteractions.myLike.received_sendtoo') }
                                                </Button>
                                            </Box>
                                        )
                                    }

                                    <Icon size="7" as={<Ionicons name="star-outline" />} />
                                </>
                            );
                        };
                        break;
                    default:
                        break;
                }

                fields.content = `${content} ${at}`;
                break;
            case "likes":
                fields.content = t('user.userInteractions.myLike.received');
                fields.customRenderContainer = () => {
                    const likeReceivedIconStr = isMutual ? 'heart-circle' : 'heart';

                    return (
                        <>
                            {
                                (!isMutual) && (
                                    <Box pr={2}>
                                        <Button
                                            leftIcon={<Icon as={Ionicons} name="heart-outline" size="xs" />}
                                            {...styleButton}
                                            onPress={() => {
                                                // TODO
                                                /*
                                                sendLike({
                                                    variables: {
                                                        data: {
                                                            dataMain: {
                                                                senderId: me?._id,
                                                                receiverId: sender.id,
                                                                at: new Date(),
                                                                type: 'heart'
                                                            }
                                                        }
                                                    }
                                                })
                                                */
                                            }}
                                        >
                                            { t('user.userInteractions.myLike.received_sendtoo') }
                                        </Button>
                                    </Box>
                                )
                            }

                            <Icon size="7" color={colors.primary} as={<Ionicons name={likeReceivedIconStr} />} />
                        </>
                    );
                };
                break;
            case "requests":
                fields.content = t('user.userInteractions.myRequest.received_description');
                fields.customRenderContainer = () => {
                    const requestReceivedIconStr = (privatePhotosGranted === 'granted') ? 'lock-open-outline' : 'lock-closed-outline';

                    return (
                        <>
                            <Icon size="7" as={<Ionicons name={requestReceivedIconStr} />} />
                        </>
                    );
                };
                fields.customRenderContainerNextRows = () => {
                    return [
                        (
                            <ReplyToRequest
                                myRequest={fieldsSource}
                                fieldId={id}
                                onSetStateAtSubmit={(updatedData: any) => {
                                    setData((previousData: IUserInteraction[]) => {
                                        const nextData = [...previousData];
                                        const indexFound = previousData?.findIndex((el: IUserInteraction) => (el?.id === updatedData.id));
                                        if (indexFound < 0 || !nextData[indexFound]) { return nextData; }

                                        const dataToUpdate = _.cloneDeep(nextData[indexFound] || {});

                                        if (dataToUpdate) {
                                            dataToUpdate.privatePhotosGranted = updatedData.privatePhotosGranted;
                                            dataToUpdate.privatePhotosGrantedAt = updatedData.privatePhotosGrantedAt;
                                            dataToUpdate.isSeenByReceiver = true;
                                        }

                                        nextData[indexFound] = dataToUpdate;

                                        return nextData;
                                    });
                                }}
                            />
                        )
                    ];
                };
                break;
            default:
                break;
        }

        return fields;
    };

    return (
        <Box style={styles.main}>
            { isDataLoading && <Spinner /> }

            <List
                data={data}
                navigation={navigation}
                renderFields={renderFields}
                isDataLoading={isDataLoading}
                isDataLoadingMore={isLoadingMore}
                isDataError={isDataError}
                onLoadData={loadData}
                onLoadMoreData={onLoadMoreData}
            />
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        countAllNotSeenPrimaryNotifications: state.notifications.countAllNotSeenPrimaryNotifications,
        countAllNotSeenLikes: state.notifications.countAllNotSeenLikes,
        countAllNotSeenRequests: state.notifications.countAllNotSeenRequests,
        realtimeNewLike: state.realtimeData.newLike,
        realtimeNewRequest: state.realtimeData.newRequest,
        realtimeNewPrimaryNotification: state.realtimeData.newPrimaryNotification,
        realtimeNewBlock: state.realtimeData.newBlock
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        setCountAllNotSeenPrimaryNotificationsActionProps: bindActionCreators(setCountAllNotSeenPrimaryNotificationsAction, dispatch),
        setCountAllNotSeenLikesActionProps: bindActionCreators(setCountAllNotSeenLikesAction, dispatch),
        setCountAllNotSeenRequestsActionProps: bindActionCreators(setCountAllNotSeenRequestsAction, dispatch),
        setRealtimeNewLikeActionProps: bindActionCreators(setRealtimeNewLikeAction, dispatch),
        setRealtimeNewRequestActionProps: bindActionCreators(setRealtimeNewRequestAction, dispatch),
        setRealtimeNewPrimaryNotificationActionProps: bindActionCreators(setRealtimeNewPrimaryNotificationAction, dispatch),
        setRealtimeNewBlockActionProps: bindActionCreators(setRealtimeNewBlockAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabNotificationsCenterScreen);
