/* eslint-disable @typescript-eslint/dot-notation */
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import StepIndicator from 'react-native-step-indicator';
import Swiper from 'react-native-swiper';
import { StackScreenProps } from '@react-navigation/stack';
import { Box, Heading, Text, Center, Icon } from 'native-base';
import userSettings, { getInputField, onUpdateUserSettings } from "./UserSpaceMenu/userSettings";
import { getNestedObjectByStringifyKeys } from "../toolbox/toolbox";
import { IItemGroup } from "../components/MenuListGroup";
import { IItem } from "../components/MenuList";
import { updateUserAction } from "../reduxActions/user";
import { States } from "../reduxReducers/states";
import { IUser } from "../entities";
import getStyles from "./OnboardingScreen.styles";
import colors from "../styles/colors";

const offsetPagination = 50;
const styles = getStyles({ offsetPagination });

const colorWhenStepDone = '#fff';

const indicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 2,
    stepStrokeCurrentColor: colorWhenStepDone,
    stepStrokeWidth: 2,
    separatorStrokeFinishedWidth: 4,
    stepStrokeFinishedColor: colorWhenStepDone,
    stepStrokeUnFinishedColor: '#fff',
    separatorFinishedColor: colorWhenStepDone,
    separatorUnFinishedColor: '#fff',
    stepIndicatorFinishedColor: colorWhenStepDone,
    stepIndicatorUnFinishedColor: colors.primary,
    stepIndicatorCurrentColor: colors.primary,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: colorWhenStepDone,
    stepIndicatorLabelFinishedColor: colors.primary,
    stepIndicatorLabelUnFinishedColor: '#fff',
    labelColor: colors.dark.background,
    labelSize: 10,
    currentStepLabelColor: colorWhenStepDone
};

interface IGroupPage {
    pagesContent: IItemGroup[];
    pagination: {
        label: string;
        iconStr?: string;
        iconColor?: string;
    };
}

interface IOnboardingScreen extends StackScreenProps<any, 'Onboarding'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    updateUserActionProps: (data: any) => any;
}

// NOTE: Pass all fields to update for Redux to "updatedData" (don't forget field)
const UPDATE_USER = gql`
    mutation ($filter: User_Filter, $data: User_Data) {
        updateUser(filter: $filter, data: $data) {
            updatedPageInfo {
                success
                message
            }
            updatedData {
                id
                gender
                birthAt
                displayName
                about
                career
                physicalAppearance
                preferencesFilter
                preferenceAccount
                basedLocation
                poi
            }
        }
    }
`;

interface IIndexes {
    indexGroup: number;
    indexPage: number;
    indexPageAccumulated: number;
}

const OnboardingScreen = ({
    navigation,
    updateUserActionProps,
    me
}: IOnboardingScreen) => {
    const [indexes, setIndexes] = React.useState<IIndexes>({ indexGroup: 0, indexPage: 0, indexPageAccumulated: 0 });
    const [formData, setFormData] = React.useState<{ [name: string]: any }>({}); // Nested objects for local state (ex: 'career: { job }')
    const [formDataToUpdate, setFormDataToUpdate] = React.useState<{ [name: string]: any }>({}); // Dot notation for MongoDB updating (ex: 'career.job')

    const [updateUser, { error: updateUserError }] = useMutation(UPDATE_USER);
    const refSwiper = React.useRef(null);
    const { t } = useTranslation();

    const onFieldChange = (value: any, item?: IItem) => {
        if (item?.id) {
            setFormData((prevFormData) => {
                let object = { ...prevFormData, [item.id]: value };
                object = getNestedObjectByStringifyKeys(item.id, object, value);

                return object;
            });

            setFormDataToUpdate((prevFormData) => {
                return { ...prevFormData, [item.id]: value };
            });

            if (item.renderScreen.fieldType?.toLowerCase()?.includes('picker')) {
                // Do auto next:
                const { indexGroup, indexPage } = indexes;
                const isLastGroup = indexGroup === groupsPage.length - 1;
                const isLastPage = indexPage === groupsPage[indexGroup].pagesContent.length - 1;
                const isLast = (isLastGroup && isLastPage);

                const page = groupsPage[indexGroup];
                const pageContent = page.pagesContent[indexPage];
                const isMultipleFields = pageContent.items?.length > 1;

                if (!isLast && !isMultipleFields && refSwiper?.current) {
                    (refSwiper.current as any)?.scrollBy(1);
                }
            }
        }
    };

    const onDone = () => {
        return onUpdateUser({ ...formDataToUpdate, isOnboardingNeverUsed: false });
    };

    const groupsPage = [
        // group My infos:
        {
            pagesContent: [
                {
                    config: {
                        renderHeader: t('user.gender'),
                        renderHeaderEmoji: '⚥',
                        renderDescription: t('user.gender_desc'),
                        isRequired: true
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['gender']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.birthAt'),
                        renderHeaderEmoji: '🎂',
                        renderDescription: t('user.birthAt_desc'),
                        isRequired: true
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['birthAt']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.about.desiredMeetingType'),
                        renderHeaderEmoji: '👀',
                        renderDescription: t('user.about.desiredMeetingType_desc'),
                        isRequired: true
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['about.desiredMeetingType']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.displayName')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['displayName']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.about.aboutMe')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['about.aboutMe']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.career.job')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['career.job']
                    ] as IItem[]
                }
            ],
            pagination: {
                label: t('onboarding.pagination.groupMyInfos'),
                iconStr: 'information-outline',
                iconColor: '#ffffff'
            }
        },

        // group Physical appearance:
        {
            pagesContent: [
                {
                    config: {
                        renderHeader: t('user.physicalAppearance.height')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['physicalAppearance.height']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('user.physicalAppearance.weight')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange, null, { hideLabel: true })['physicalAppearance.weight']
                    ] as IItem[]
                },
            ],
            pagination: {
                label: t('onboarding.pagination.groupAppearance'),
                iconStr: 'glasses-outline',
                iconColor: '#ffffff'
            }
        },

        // group My prefs:
        {
            pagesContent: [
                {
                    config: {
                        renderHeader: t('user.preferencesFilter._groupTitle')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, onFieldChange)['preferencesFilter.desiredGender'],
                        userSettings.getItems(formData, onFieldChange)['preferencesFilter.desiredAgeRange'],
                        userSettings.getItems(formData, onFieldChange)['preferencesFilter.profileWithPhotoOnly']
                    ] as IItem[]
                }
            ],
            pagination: {
                label: t('onboarding.pagination.groupMyPrefs'),
                iconStr: 'heart-outline',
                iconColor: '#ffffff'
            }
        },

        // group My photos:
        {
            pagesContent: [
                {
                    config: {
                        renderHeader: t('user.images'),
                        renderDescription: t('user.images_desc'),
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData)['images']
                    ] as IItem[]
                },
                {
                    config: {
                        renderHeader: t('onboarding.pagesContent.lastPage.header')
                    },
                    style: {
                        backgroundColor: colors.bg.main
                    },
                    items: [
                        userSettings.getItems(formData, null, onDone)['_onSubmit']
                    ] as IItem[]
                }
            ],
            pagination: {
                label: t('onboarding.pagination.groupMyPhotos'),
                iconStr: 'camera-outline',
                iconColor: '#ffffff'
            }
        }
    ] as IGroupPage[];

    const getIndexes = (page: number) => {
        let accumulator = 0;
        let indexGroup = 0;
        let indexPage = 0;
        let isMatch = false;

        for (let i = 0; i < groupsPage?.length; i++) {
            const groupPage = groupsPage[i];
            for (let j = 0; j < groupPage?.pagesContent?.length; j++) {
                if (page === accumulator) {
                    indexGroup = i;
                    indexPage = j;
                    isMatch = true;
                    break;
                }

                accumulator++;
            }

            if (isMatch) {
                break;
            }
        }

        if (typeof indexGroup === 'undefined' || indexGroup === -1) {
            indexGroup = 0;
        }

        // console.log(indexGroup, indexPage, page);

        return {
            indexGroup,
            indexPage,
            indexPageAccumulated: page
        };
    };

    const onUpdateUser = (dataToUpdate: Partial<IUser>) => {
        const params = {
            dataToUpdate,
            mutationName: 'updateUser',
            mutationFunc: updateUser,
            updateEntityActionProps: updateUserActionProps,
            me
        };

        return onUpdateUserSettings(params)
            .then((res: any) => {
                if (res) {
                    navigation.navigate('Main');
                }

                return Promise.resolve(res);
            });
    };

    const checkIfNextButtonDisabled = () => {
        const page = groupsPage[indexes.indexGroup];
        const pageContent = page.pagesContent[indexes.indexPage];
        const isCurrentPageRequired = pageContent.config?.isRequired;
        const fieldIdsInCurrentPage = pageContent.items?.map((item) => item?.id);
        let isAFieldIsEmptyInCurrentPage = false;

        // Disabled next button if page required and no value:
        if (isCurrentPageRequired) {
            for (let i = 0; i < fieldIdsInCurrentPage?.length; i++) {
                const fieldId = fieldIdsInCurrentPage[i];
                if (!formDataToUpdate[fieldId]) {
                    isAFieldIsEmptyInCurrentPage = true;
                    break;
                }
            }
        }

        return isAFieldIsEmptyInCurrentPage && isCurrentPageRequired;
    };

    if (updateUserError) {
        console.error(updateUserError); // Display toast
    }

    const renderPageContent = (page: IItemGroup, indexGroup: number, indexPage: number) => {
        const { style, items, config } = page || {};

        return (
            <Box key={`${indexGroup}-${indexPage}`} style={[styles.pageContentContainer]} backgroundColor={style.backgroundColor}>
                <Center>
                    <Heading color={colors.primary}>
                        { config?.renderHeaderEmoji || '' } {config?.renderHeader || ''}
                    </Heading>
                    <Text color="#fff">{config?.renderDescription || ''}</Text>
                </Center>

                <Box style={{ flex: 1, justifyContent: 'center' }}>
                    <Center>
                        {
                            items?.map((item: IItem) => {
                                const renderField = getInputField(item, navigation);

                                return (
                                    <Box key={item.id} style={styles.formContainer}>
                                        {renderField}
                                    </Box>
                                );
                            })
                        }
                    </Center>
                </Box>
            </Box>
        );
    };

    const renderIconsPagination = ({
        position,
        stepStatus
    }: any) => {
        if (!groupsPage[position]) { return null; }

        const { iconStr } = groupsPage[position].pagination;

        const iconProps = {
            name: iconStr,
            color: stepStatus === 'finished' ? colors.primary : '#fff',
            size: 20
        };

        return <Ionicons {...iconProps} />;
    };

    const renderNavigationButton = (name: string, direction: 'prev' | 'next') => {
        const isNextButtonDisabled = direction === 'next' && checkIfNextButtonDisabled();

        return (
            <Box style={[styles.navigationButton, isNextButtonDisabled ? { backgroundColor: 'rgba(255, 255, 255, 0.4)' } : {}]}>
                <Text style={styles.navigationTextButton}>
                    <Icon as={Ionicons} name={name} size={7} color="primary.500" />
                </Text>
            </Box>
        );
    };

    return (
        <Box style={styles.main}>
            <Swiper
                ref={refSwiper}
                style={{ flexGrow: 1 }}
                index={indexes.indexPageAccumulated}
                loop={false}
                autoplay={false}
                scrollEnabled={false}
                showsPagination={false}
                disableNextButton={checkIfNextButtonDisabled()}
                showsButtons
                buttonWrapperStyle={{
                    alignItems: 'flex-end',
                    paddingBottom: offsetPagination
                }}
                prevButton={renderNavigationButton('chevron-back-outline', 'prev')}
                nextButton={renderNavigationButton('chevron-forward-outline', 'next')}
                onIndexChanged={(index) => setIndexes(getIndexes(index))}
                loadMinimal
                loadMinimalSize={1}
            >
                {
                    groupsPage
                        ?.map((groupPage, indexGroup) => {
                            return groupPage.pagesContent?.map((pageContent, indexPage) => {
                                return { ...pageContent, indexGroup, indexPage };
                            });
                        })
                        ?.flat()
                        ?.map((page) => {
                            return renderPageContent(page, page.indexGroup, page.indexPage);
                        })
                }
            </Swiper>

            <Box style={styles.paginationContainer}>
                {/*
                <Box style={styles.buttonsContainer}>
                    <Button
                        m={4}
                        _text={{ fontSize: 13 }}
                        onPress={() => {
                            setCurrentPage((prevCurrentPage) => {
                                return prevCurrentPage - 1;
                            });
                        }}
                    >
                        {'< Prev'}
                    </Button>

                    <Button
                        m={4}
                        _text={{ fontSize: 13 }}
                        onPress={() => {
                            setCurrentPage((prevCurrentPage) => {
                                return prevCurrentPage + 1;
                            });
                        }}
                    >
                        {'Next / Skip >'}
                    </Button>
                </Box>
                */}

                <StepIndicator
                    customStyles={indicatorStyles}
                    currentPosition={indexes.indexGroup}
                    renderStepIndicator={renderIconsPagination}
                    stepCount={groupsPage?.length}
                    labels={groupsPage?.map((groupPage) => groupPage.pagination?.label)}
                />
            </Box>
        </Box>
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingScreen);
