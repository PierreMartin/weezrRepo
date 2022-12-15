// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import {
    FlatList,
    TouchableHighlight,
    Dimensions,
    RefreshControl,
    ImageBackground
} from 'react-native';
import { Badge, Box, Button, Center, Icon } from "native-base";
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { useLazyQuery, gql } from '@apollo/client';
import _ from "lodash";
import { Header, Text } from '../components';
import { setRealtimeNewLikeAction, newMessageAction } from "../reduxActions/realtimeData";
import { getUserForwardPhoto, setElementInArrayAtIndex } from "../toolbox/toolbox";
import { Spinner } from "../components/Spinner";
import { SpinnerIndicator } from "../components/SpinnerIndicator";
import { InputSearch } from "../components/InputSearch";
import { IUser } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from './TabUsersGridScreen.style';

const marginSize = 1;
const styles = getStyles({ marginSize });
const itemsPerPage = 15;

const USERS = gql`
    query ($filter: User_Filter, $data: User_Data, $offset: Int, $limit: Int) {
        users(filter: $filter, data: $data, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                email
                displayName
                __typename
                id
                currentLocation {
                    latitude
                    longitude
                }
                isOnline
                unreadMessages
                distanceComparedToMe
                images
                userInteractions {
                    myLike {
                        received {
                            id
                            isMutual
                        }
                    }
                }
            }
        }
    }
`;

interface ITabUsersGridScreen {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    realtimeNewMessage: States.INewMessage;
    realtimeNewLike: States.INewLike;
    realtimeNewBlock: States.INewBlock;
    newMessageActionProps: (data: any) => void;
    setRealtimeNewLikeActionProps: (data: any) => void;
    selectedTab: string;
    // cacheDataUsers: States.ICacheData;
    // setCacheDataActionProps: (entity: string, dataCache: States.ICacheData) => void;
}

function TabUsersGridScreen({
    navigation,
    me,
    realtimeNewMessage,
    realtimeNewLike,
    realtimeNewBlock,
    newMessageActionProps,
    setRealtimeNewLikeActionProps,
    selectedTab
}: ITabUsersGridScreen) {
    const [users, setUsers] = React.useState<IUser[]>([]);
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
    const [loadUsers, {
        loading: getUsersLoading,
        data: usersData,
        error: getUsersError,
        fetchMore: fetchMoreUsers
    }] = useLazyQuery(USERS, {
        fetchPolicy: 'network-only',
        /*
        onCompleted: (data) => {
            if (data?.users?.data) {
                const sortedUsers = setElementInArrayAtIndex(data.users.data, 'id', me?._id, 0);
                setUsers(sortedUsers);
            }
        }
        */
    });

    /* Handling manual pagination:
    const cacheDataRef: any = React.useRef();

    // Get cache data from redux:
    React.useEffect(() => {
        cacheDataRef.current = getCacheData(cacheDataUsers);
    }, [cacheDataUsers]);

    // Set cache data:
    React.useEffect(() => {
        setCacheData(setCacheDataActionProps, users);
    }, [users]);
    */

    // const [pagination, setPagination] = React.useState<IPaginationState>({ page: 0, isLastPage: false, isLoading: false });
    // const isFocused = useIsFocused();
    const numColumns = 3;
    const { width } = Dimensions.get('window');
    const offsetWhenMargins = (numColumns * marginSize) + marginSize;
    const itemWidth: number = (width - offsetWhenMargins) / numColumns;
    const { isLastPage, isLimitReached } = usersData?.users?.pageInfo || {};

    const getQueryVariables = () => {
        const variables: any = {};

        variables.filter = {
            filterMain: {
                // TODO { 'account.lastActivityAt': { $gte: new Date() - (1000 * 60 * 30) } } // last 30 min
            }
        };

        variables.data = {
            dataMain: {
                userMeId: me._id,
                coordinates: me.currentLocation.coordinates
            }
        };

        switch (selectedTab) {
            case 'friends':
            case 'loveRelationship':
            case 'fun':
                variables.filter.filterDesiredMeetingType = {
                    'about.desiredMeetingType': selectedTab
                };
                break;
            case 'followers':
                variables.filter.filterFollowers = {
                    senderId: me?._id
                };
                break;
            default:
                break;
        }

        return variables;
    };

    // First query for get users:
    const onLoadUsers = () => {
        if (me?._id && me?.currentLocation?.coordinates) {
            const variables = getQueryVariables();

            loadUsers({
                variables: {
                    ...variables,
                    offset: 0, // skip
                    limit: itemsPerPage
                }
            });
        }
    };

    /*
    // Handling manual pagination:
    const onLoadUsers = (forceRefresh?: boolean) => {
        if (me?._id && me?.currentLocation?.coordinates) {
            const variables = getQueryVariables();
            // console.log('cacheDataLog - use ', cacheDataRef?.current?.data);

            if (!forceRefresh && cacheDataRef?.current?.data?.length) {
                setUsers(cacheDataRef.current.data);
            } else {
                loadUsers({
                    variables: {
                        ...variables,
                        offset: 0, // skip
                        limit: itemsPerPage
                    }
                });
            }
        }
    };
    */

    // Load more users:
    const onLoadUsersMore = () => {
        if (!isLastPage && !isLoadingMore && !isLimitReached && fetchMoreUsers) {
            setIsLoadingMore(true);
            const variables = getQueryVariables();

            // selectedTab "about.desiredMeetingType: selectedTab"
            fetchMoreUsers({
                variables: {
                    ...variables,
                    offset: usersData?.users?.data?.length // skip
                }
            })
                /* Handling manual pagination:
                .then((res) => {
                    const nextUsers = res?.data?.users?.data;

                    if (nextUsers?.length) {
                        setUsers((previousUsers: IUser[]) => {
                            return [...previousUsers, ...nextUsers];
                        });
                    }
                })
                */
                .finally(() => {
                    setIsLoadingMore(false);
                });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            onLoadUsers();
        }, [])
    );

    // Set users to state:
    useFocusEffect(
        React.useCallback(() => {
            if (usersData?.users?.data) {
                const sortedUsers = setElementInArrayAtIndex(usersData?.users?.data, 'id', me?._id, 0);
                setUsers(sortedUsers);
            }
        }, [usersData])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Box>
                    <Button
                        m={0}
                        p={1}
                        variant="solid"
                        backgroundColor="#fff"
                        // borderColor="gray"
                        _text={{
                            color: "primary.500"
                        }}
                        leftIcon={<Icon as={Ionicons} name="options-outline" size="5" />}
                        onPress={() => navigation.navigate('UserPreferencesMenu')}
                    />
                    {/*
                    <InputSearch
                        fieldData={{ placeholder: 'Search' }}
                        onChange={(value: string) => console.log(value)}
                    />
                    */}
                </Box>
            )
        });
    }, [navigation]);

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewMessage) {
                // If new message created - Update count unread messages for the user:
                console.log('[socket] newMessage');

                setUsers((previousUsers: IUser[]) => {
                    const nextUsers = [...previousUsers];

                    const indexFound = previousUsers?.findIndex((previousUser: IUser) => previousUser?.id === realtimeNewMessage.user?._id);
                    const userToUpdate = {...nextUsers[indexFound]};

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

                    nextUsers[indexFound] = userToUpdate;

                    return nextUsers;
                });

                // reset redux:
                newMessageActionProps(null);
            }
        }, [realtimeNewMessage])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewLike) {
                // If new like received - Update user:
                console.log('[socket] newLike');

                setUsers((previousUsers: IUser[]) => {
                    const nextUsers = [...previousUsers];

                    const indexFound = previousUsers?.findIndex((previousUser: IUser) => previousUser?.id === realtimeNewLike?.senderId);
                    if (indexFound < 0) { return previousUsers; }

                    const userToUpdate = _.cloneDeep(nextUsers[indexFound] || {});

                    if (userToUpdate?.userInteractions?.myLike) {
                        if (!realtimeNewLike.isRemoved && realtimeNewLike.id) {
                            // Add:
                            userToUpdate.userInteractions.myLike.received = realtimeNewLike;
                        } else {
                            // Remove:
                            userToUpdate.userInteractions.myLike.received = null;
                        }
                    }

                    nextUsers[indexFound] = userToUpdate;

                    return nextUsers;
                });

                // reset redux:
                setRealtimeNewLikeActionProps(null);
            }
        }, [realtimeNewLike])
    );

    // Socket events:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewBlock?.senderId) {
                // If new block received - Update user:
                console.log('[socket] newBlock');

                setUsers((previousUsers: IUser[]) => {
                    const nextUsers = [...previousUsers];

                    const indexFoundToDelete = previousUsers?.findIndex((previousUser: IUser) => previousUser?.id === realtimeNewBlock?.senderId);
                    if (indexFoundToDelete < 0 || !nextUsers[indexFoundToDelete]) { return nextUsers; }

                    // Delete the user who blocked to me:
                    nextUsers.splice(indexFoundToDelete, 1);

                    return nextUsers;
                });

                // reset redux:
                setRealtimeNewLikeActionProps(null);
            }
        }, [realtimeNewBlock])
    );

    if (getUsersError || !width) return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;

    const renderItem = ({ item }: any) => {
        const {
            displayName,
            // email,
            distanceComparedToMe,
            unreadMessages,
            isOnline,
            userInteractions
        } = item;

        const { uri }: any = getUserForwardPhoto(item, 'size_130_130');

        let likeReceivedIconStr;
        if (userInteractions?.myLike?.received?.id) {
            likeReceivedIconStr = 'heart';
            if (userInteractions.myLike.received.isMutual) { likeReceivedIconStr = 'heart-circle'; }
        }

        return (
            <TouchableHighlight
                key={item.id}
                activeOpacity={0.8}
                underlayColor="transparent"
                onPress={() => navigation.navigate('UserDetail', {userId: item.id})}
            >
                <ImageBackground
                    style={[
                        styles.itemContainer,
                        {
                            width: itemWidth,
                            height: itemWidth
                        }
                    ]}
                    resizeMode="cover"
                    source={{ uri }}
                >
                    <Box p={3} style={{ position: 'relative', flex: 1 }}>
                        <Text style={{ position: 'absolute', top: 10, right: 10 }}>
                            {(unreadMessages > 0) ? (
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

                        <Box style={{ position: 'absolute', bottom: 4, left: 4 }}>
                            {
                                distanceComparedToMe >= 0 && (
                                    <Box style={{ flexDirection: 'row', marginBottom: 2 }}>
                                        <Icon style={styles.userDistanceIcon} as={Ionicons} name="location-outline" size="4" color="#fff" />
                                        <Text style={styles.userDistanceText}>{distanceComparedToMe?.toFixed(2)} Km</Text>
                                    </Box>
                                )
                            }

                            <Box style={{ flexDirection: 'row' }}>
                                { isOnline && (<Icon style={{ marginRight: 4 }} as={Ionicons} name="radio-button-on-outline" size="4" color="#16BF24FF" />) }
                                { likeReceivedIconStr && (<Icon as={Ionicons} name={likeReceivedIconStr} size="4" color="primary.500" />) }
                                { displayName && <Text style={styles.userTitleText}>{displayName || 'User'}</Text> }
                            </Box>
                        </Box>
                    </Box>
                </ImageBackground>
            </TouchableHighlight>
        );
    };

    const renderHeader = () => {
        return (
            <Box style={[styles.searchContainer]}>
                <InputSearch
                    fieldData={{ placeholder: 'Search' }}
                    onChange={(value: string) => console.log(value)}
                />
            </Box>
        );
    };

    const renderFooter = () => {
        return isLoadingMore ? <SpinnerIndicator style={{ width: 65, height: 60, marginTop: -70 }} /> : null;
    };

    const renderEmpty = () => {
        let emptyNode = null;

        if (!getUsersError && !getUsersLoading) {
            emptyNode = (
                <Center safeArea>
                    <Header>Aucun résultat</Header>
                </Center>
            );
        }

        return emptyNode;
    };

    const onRefresh = () => {
        onLoadUsers();
    };

    return (
        <Box style={styles.main}>
            { getUsersLoading && <Spinner />}

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id as any}
                numColumns={numColumns}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={<RefreshControl refreshing={/* getUsersLoading */false} onRefresh={onRefresh} />}
                contentContainerStyle={{
                    // marginTop: 20
                }}
                onEndReached={onLoadUsersMore}
                onEndReachedThreshold={0.02}
            />
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        realtimeNewMessage: state.realtimeData.newMessage,
        realtimeNewLike: state.realtimeData.newLike,
        realtimeNewBlock: state.realtimeData.newBlock
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        newMessageActionProps: bindActionCreators(newMessageAction, dispatch),
        setRealtimeNewLikeActionProps: bindActionCreators(setRealtimeNewLikeAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabUsersGridScreen);
