// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from "react";
import { Box, Button, Center, Icon } from "native-base";
import { connect } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { List } from "./List";
import { Spinner } from "./Spinner";
import { Text } from "./index";
import { displayAlert } from "./DisplayAlert";
import { TO_BLOCK } from "./ActionsForUserInteractions/ToBlock";
import { truncate } from "../toolbox/toolbox";
import { States } from "../reduxReducers/states";
import { IUser, IUserInteraction, UserInterBlock } from "../entities";
import getStyles from "./BlockedsProfiles.styles";

const styles = getStyles();
const itemsPerPage = 120;

interface IBlockedsProfiles {
    me?: IUser;
}

const BLOCKEDS = gql`
    query ($filter: UserInterBlock_Filter!, $offset: Int, $limit: Int) {
        blockeds(filter: $filter, offset: $offset, limit: $limit) {
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
                receiver {
                    id
                    displayName
                    images
                }
            }
        }
    }
`;

const BlockedsProfiles = ({
    me
}: IBlockedsProfiles) => {
    const [blockeds, setBlockeds] = React.useState<UserInterBlock[]>([]);
    const [isBlockedsLoadingMore, setIsBlockedsLoadingMore] = React.useState<boolean>(false);

    const [
        getBlockeds,
        {
            data: blockedsGql,
            loading: isBlockedsLoading,
            error: blockedsError,
            fetchMore: fetchMoreBlockeds
        }
    ] = useLazyQuery(BLOCKEDS, { fetchPolicy: 'network-only' });

    const [toBlock, { error: toBlockError }] = useMutation(TO_BLOCK);

    const { t } = useTranslation();

    const { isLastPage, isLimitReached } = blockedsGql?.blockeds?.pageInfo || {};

    const getQueryVariables = () => {
        const variables: any = {};

        variables.filter = {
            filterMain: {
                senderId: me?._id
            }
        };

        return variables;
    };

    // First query for get data:
    const loadBlockeds = () => {
        const variables = getQueryVariables();

        getBlockeds({
            variables: {
                ...variables,
                offset: 0, // skip
                limit: itemsPerPage
            }
        });
    };

    // Load more data:
    const onLoadMoreBlockeds = () => {
        if (!isLastPage && !isBlockedsLoadingMore && !isLimitReached && fetchMoreBlockeds) {
            setIsBlockedsLoadingMore(true);
            const variables = getQueryVariables();

            fetchMoreBlockeds({
                variables: {
                    ...variables,
                    offset: blockeds?.length // skip
                }
            }).finally(() => {
                setIsBlockedsLoadingMore(false);
            });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // Load all data:
            loadBlockeds();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            setBlockeds(blockedsGql?.blockeds?.data);
        }, [blockedsGql])
    );

    if (blockedsError) {
        console.error(blockedsError);
        return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (toBlockError) {
        // TODO Display toast
        console.error(toBlockError);
    }

    const renderFields = (fieldsSource: UserInterBlock) => {
        const { id, receiver, at } = fieldsSource;
        const { displayName } = receiver as IUser || {};
        const title = displayName ? truncate(displayName, 30, '...') : 'User';

        const styleButton = {
            p: 1,
            pl: 2,
            pr: 2,
            style: { flex: 1 },
            _text: { fontSize: 11 }
        };

        const fields: any = {
            title,
            content: `${t('user.userInteractions.myBlock.sent')} ${at}`,
            at: null,
            avatar: receiver as IUser,
            customRenderContainer: () => {
                return (
                    <>
                        <Box pr={2}>
                            <Button
                                leftIcon={<Icon as={Ionicons} name="lock-open-outline" size="xs" />}
                                {...styleButton}
                                onPress={() => {
                                    displayAlert({
                                        title: t('user.userInteractions.myBlock.sent_unblock_confirm_title'),
                                        confirmOk: t('user.userInteractions.myBlock.sent_unblock_confirm_ok'),
                                        confirmCancel: t('userDetail.secondaryActions.cancel')
                                    }).then((isPressedOk) => {
                                        if (isPressedOk && id) {
                                            toBlock({
                                                variables: {
                                                    filter: {
                                                        filterUnblock: {
                                                            _id: id
                                                        }
                                                    }
                                                }
                                            }).then((res: any) => {
                                                const userInterToBlock = res?.data?.toBlock?.updatedData as IUserInteraction;

                                                if (userInterToBlock) {
                                                    setBlockeds((previousBlockeds: UserInterBlock[]) => {
                                                        return [...previousBlockeds].filter((blocked: UserInterBlock) => blocked?.id !== id);
                                                    });

                                                    // TODO Display toast remove
                                                }
                                            });
                                        }
                                    });
                                }}
                            >
                                { t('user.userInteractions.myBlock.sent_unblock') }
                            </Button>
                        </Box>

                        <Icon size="7" as={<Ionicons name="lock-closed-outline" />} />
                    </>
                );
            }
        };

        return fields;
    };

    return (
        <Box>
            { isBlockedsLoading && <Spinner /> }

            <List
                data={blockeds}
                renderFields={renderFields}
                isDataLoading={isBlockedsLoading}
                isDataLoadingMore={isBlockedsLoadingMore}
                isDataError={blockedsError}
                onLoadData={loadBlockeds}
                onLoadMoreData={onLoadMoreBlockeds}
                hasHeaderHidden
            />
        </Box>
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(BlockedsProfiles);
