// @ts-ignore
// import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { Text, Box } from 'native-base';
import { useTranslation } from "react-i18next";
import { IUser } from "../entities";
import { Header } from "./index";
import getStyles from "./UserInfosList.styles";

const styles = getStyles();

interface IItems {
    field: any;
    title?: string;
    iconEmoji?: string;
    prefix?: string;
    suffix?: string;
    fieldType?: 'list';
}

interface IGroupItems {
    groupTitle?: string;
    items: IItems[];
}

interface IUserListInfos {
    user: IUser;
    style?: any;
}

export function UserListInfos(props: IUserListInfos) {
    const { t } = useTranslation();
    const { user } = props;

    if (!(user?._id || user?.id)) {
        return null;
    }

    const {
        about,
        physicalAppearance,
        career,
        poi
        // birthAt
    } = user || {};

    const groupItems: IGroupItems[] = [
        {
            // groupTitle: t('user.detail.aboutMe.groupTitle'),
            items: [
                {
                    field: about?.aboutMe,
                    // iconEmoji: '✍🏼'
                }
            ]
        },
        {
            groupTitle: t('user.detail.poi.groupTitle'),
            items: [
                {
                    field: poi,
                    fieldType: 'list',
                    // iconEmoji: '🏄'
                }
            ]
        },
        {
            groupTitle: t('user.detail.generalInfo.groupTitle'),
            items: [
                {
                    field: about?.desiredMeetingType,
                    title: t('user.about.desiredMeetingType'),
                    iconEmoji: '🔍'
                },
                {
                    field: about?.relationship,
                    // title: t('user.about.relationship'),
                    iconEmoji: '❤️'
                },
                {
                    field: about?.spokenLanguages,
                    // title: t('user.about.spokenLanguages'),
                    iconEmoji: '🗣️️'
                }
            ]
        },
        {
            groupTitle: t('user.detail.career.groupTitle'),
            items: [
                {
                    field: career?.job,
                    title: t('user.career.job'),
                    iconEmoji: '⚒️'
                },
                {
                    field: career?.employer,
                    title: t('user.career.employer'),
                    iconEmoji: '🏢'
                }
            ]
        },
        {
            groupTitle: t('user.detail.physicalAppearance.groupTitle'),
            items: [
                {
                    field: physicalAppearance?.height,
                    // title: 'Height',
                    prefix: 'cm',
                    iconEmoji: '📏'
                },
                {
                    field: physicalAppearance?.weight,
                    // title: 'Weight',
                    prefix: 'kg',
                    iconEmoji: '⚖️'
                }
            ]
        },
    ];

    const groupItemsLength = groupItems?.length;

    return (
        <Box>
            {
                groupItems?.map((group, groupIndex: number) => {
                    const definedItems = group?.items?.filter((item) => { return (typeof item.field !== 'undefined' && item.field !== null); });
                    const itemsLength = definedItems?.length;

                    if (!itemsLength) { return null; }

                    const isLastGroupItem = groupItemsLength === (groupIndex + 1);

                    return (
                        <Box key={groupIndex} style={[styles.itemFullContainer, { borderBottomWidth: isLastGroupItem ? 0 : 1 }]}>
                            { group.groupTitle && <Header style={[styles.basicText, { paddingVertical: 0 }]}>{group.groupTitle}</Header> }

                            {
                                definedItems?.map((subItem, subItemIndex: number) => {
                                    const valField = subItem?.field;
                                    const isLastSubItem = itemsLength === (subItemIndex + 1);

                                    return (
                                        <Box key={subItemIndex} style={styles.itemContainer}>
                                            <Box style={styles.iconContainer}>
                                                <Text style={styles.basicText}>
                                                    {subItem?.iconEmoji}
                                                </Text>
                                            </Box>

                                            <Box style={[styles.textContainer, { borderBottomWidth: isLastSubItem ? 0 : 1 }]}>
                                                { subItem?.title && <Text style={[styles.secondaryText, { marginBottom: -4 }]}>{subItem?.title}</Text> }

                                                {
                                                    (subItem?.fieldType === 'list' && valField?.length) ? (
                                                        <Box style={{ flexDirection: 'row' }}>
                                                            {
                                                                valField.map((itemList: string, index: number) => {
                                                                    const isPoiMatchWithMine = index === 0; // TODO all false if isSelectedProfileOwner

                                                                    return (
                                                                        <Box key={index} style={[styles.bubble, isPoiMatchWithMine ? { backgroundColor: 'yellow' } : {}]}>
                                                                            <Text style={[styles.basicText, isPoiMatchWithMine ? { color: '#000' } : {}]}>{itemList}</Text>
                                                                        </Box>
                                                                    );
                                                                })
                                                            }
                                                        </Box>
                                                    ) : (
                                                        <Text style={[styles.basicText]}>{valField || ''}{subItem?.prefix ? subItem?.prefix : ''}</Text>
                                                    )
                                                }
                                            </Box>
                                        </Box>
                                    );
                                })
                            }
                        </Box>
                    );
                })
            }
        </Box>
    );
}
