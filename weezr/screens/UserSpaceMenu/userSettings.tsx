/* eslint-disable quote-props */
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Text } from "native-base";
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import BlockedsProfiles from "../../components/BlockedsProfiles";
import { Input } from "../../components/Forms/Form";
import { PickerInputSelect } from "../../components/Pickers/PickerInputSelect";
// eslint-disable-next-line import/no-cycle
import { IItem } from "../../components/MenuList";
import { checkIsValidLanguage } from "../../toolbox/toolbox";
import { ILanguage, IUser } from "../../entities";
import UserEditingPhotosScreen from "./UserEditingPhotos/UserEditingPhotosScreen";

interface IOnUpdateUserSettings {
    dataToUpdate: Partial<IUser>;
    mutationName: string;
    mutationFunc: (params: any) => any;
    updateEntityActionProps: (data: any) => any;
    me: IUser;
}

// Height:
const heightValues: number[] = [];
for (let i = 140; i < 220; i++) { heightValues.push(i); }
const optionsHeight = heightValues.map((height) => ({ label: height.toString(), value: height }));

// Weight:
const weightValues: number[] = [];
for (let i = 40; i < 160; i++) { weightValues.push(i); }
const optionsWeight = weightValues.map((weight) => ({ label: weight.toString(), value: weight }));

export const defaultRenderValue = (menuItemParam: IItem) => {
    return menuItemParam?.value?.toString()?.substr(0, 22);
};

export const onUpdateUserSettings = ({
    dataToUpdate,
    mutationName,
    mutationFunc,
    updateEntityActionProps,
    me
}: IOnUpdateUserSettings) => {
    if (Object.keys(dataToUpdate || {})?.length) {
        return mutationFunc({
            variables: {
                filter: {
                    filterUpdate: {
                        _id: me._id
                    }
                },
                data: {
                    dataUpdate: dataToUpdate // Some fields are in dot notation for update nested field with MongoDB (ex: 'career.job')
                }
            }
        }).then((res: any) => {
            const data: Partial<IUser> = res?.data[mutationName] && res?.data[mutationName]?.updatedData;

            if (data) {
                updateEntityActionProps({ ...data, isOnboardingNeverUsed: !!dataToUpdate.isOnboardingNeverUsed });
            }

            return Promise.resolve(!!data);
        });
    }

    return Promise.resolve(false);
};

export const getInputField = (
    item: IItem,
    navigation?: StackNavigationProp<any, any>
) => {
    const { fieldType, data, onFieldChange, onFieldSubmit } = item?.renderScreen || {};
    const { optionsInputSelect } = data || {};
    let renderField = null;
    let label;
    let type: any = 'inputText';

    if (item.iconEmoji || item.title) { label = `${item.iconEmoji || ''} ${item.title || ''}`; }

    switch (fieldType) {
        case 'textArea':
            type = 'inputTextArea';
        // eslint-disable-next-line no-fallthrough
        case 'text':
            renderField = (
                <Input
                    type={type}
                    fieldId={item.id}
                    label={label}
                    placeholder={item.placeholder || ''}
                    formValues={{ [item.id]: item.value }}
                    // formErrors={{ [item.id]: 'Error...' }}
                    // elementInsideInput={{ type: 'icon', placement: 'left', iconName: item.iconStr }}
                    onChangeText={(fieldId: string, value: any) => {
                        if (onFieldChange) { onFieldChange(value, item); }
                    }}
                />
            );
            break;
        case 'select': // TODO pickerInputSelect
            renderField = (
                <PickerInputSelect
                    data={optionsInputSelect}
                    label={label}
                    placeholder={item.placeholder || ''}
                    value={item.value}
                    // error="Error..."
                    onChange={(value: any) => {
                        if (onFieldChange) { onFieldChange(value, item); }
                    }}
                    /*
                    rules={[
                        {
                            required: true,
                            message: 'Please input your E-mail!',
                        }
                    ]}
                    enabledValidationOnTyping
                    onSubmit={(value: any) => {
                        if (onFieldChange) { onFieldChange(value, item); }
                    }}
                    */
                />
            );
            break;
        case 'radio':
            renderField = (
                <Box style={{ display: 'flex' }} w="100%">
                    <Text>{`${item.iconEmoji || ''} ${item.title}`}</Text>
                </Box>
            );
            break;
        case 'file':
            const props = { navigation, marginsAroundContainer: 20, tab: "public" } as any;
            renderField = <UserEditingPhotosScreen {...props} />;
            break;
        case 'blockedsProfilesList':
            renderField = (<BlockedsProfiles />);
            break;
        case 'onSubmit':
            renderField = (
                <Button
                    m={4}
                    _text={{ fontSize: 13 }}
                    onPress={onFieldSubmit}
                >
                    Finish
                </Button>
            );
            break;
        default:
            break;
    }

    return renderField;
};

const userSettings = {
    getItems: (
        valuesFormData: any,
        onFieldChange?: ((value: any, optionalData?: IItem) => void) | null,
        onFieldSubmit?: ((fields?: any) => Promise<any>) | null
    ) => {
        const { t, i18n } = useTranslation();

        return {
            // User preferences
            'preferencesFilter.desiredGender': {
                id: 'preferencesFilter.desiredGender',
                value: valuesFormData.preferencesFilter?.desiredGender || '',
                title: t('user.preferencesFilter.desiredGender'),
                iconEmoji: '🔍',
                renderScreen: {
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.preferencesFilter.desiredGender_m'),
                                value: 'm'
                            },
                            {
                                label: t('user.preferencesFilter.desiredGender_f'),
                                value: 'f'
                            },
                            {
                                label: t('user.preferencesFilter.desiredGender_everybody'),
                                value: 'everybody'
                            }
                        ]
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'preferencesFilter.desiredAgeRange': {
                id: 'preferencesFilter.desiredAgeRange',
                value: valuesFormData.preferencesFilter?.desiredAgeRange || '',
                title: t('user.preferencesFilter.desiredAgeRange'),
                iconEmoji: '🔍',
                renderScreen: {
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: '18 / 25',
                                value: '[18, 25]'
                            },
                            {
                                label: '25 / 40',
                                value: '[25, 40]'
                            }
                        ],
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'preferencesFilter.profileWithPhotoOnly': {
                id: 'preferencesFilter.profileWithPhotoOnly',
                value: valuesFormData.preferencesFilter?.profileWithPhotoOnly,
                title: t('user.preferencesFilter.profileWithPhotoOnly'),
                iconEmoji: '🔍',
                renderScreen: {
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.preferencesFilter.profileWithPhotoOnly_true'),
                                value: true
                            },
                            {
                                label: t('user.preferencesFilter.profileWithPhotoOnly_false'),
                                value: false
                            }
                        ],
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },

            // User about
            'gender': {
                id: 'gender',
                value: valuesFormData.gender,
                title: t('user.gender'),
                iconEmoji: '🧑',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.gender_m'),
                                value: 'm'
                            },
                            {
                                label: t('user.gender_f'),
                                value: 'f'
                            }
                        ],
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'birthAt': {
                id: 'birthAt',
                value: valuesFormData.birthAt,
                title: t('user.birthAt'),
                iconEmoji: '🎂',
                renderScreen: {
                    fieldType: 'select',
                    routeNameIfNavigable: 'FieldsForm',
                    data: {
                        optionsInputSelect: [
                            {
                                label: '1980',
                                value: new Date('09/18/1980')
                            },
                            {
                                label: '1990',
                                value: new Date('09/18/1990')
                            },
                            {
                                label: '2000',
                                value: new Date('09/18/2000')
                            },
                            {
                                label: '2005',
                                value: new Date('09/18/2005')
                            }
                        ],
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'displayName': {
                id: 'displayName',
                value: valuesFormData.displayName,
                title: t('user.displayName'),
                iconEmoji: '👀',
                renderScreen: {
                    fieldType: 'text',
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'about.aboutMe': {
                id: 'about.aboutMe',
                value: valuesFormData.about?.aboutMe || '',
                title: t('user.about.aboutMe'),
                iconEmoji: '✍️',
                renderScreen: {
                    fieldType: 'textArea',
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'career.job': {
                id: 'career.job',
                value: valuesFormData.career?.job || '',
                title: t('user.career.job'),
                iconEmoji: '️️💼',
                renderScreen: {
                    fieldType: 'text',
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'career.employer': {
                id: 'career.employer',
                value: valuesFormData.career?.employer || '',
                title: t('user.career.employer'),
                iconEmoji: '🏢️',
                renderScreen: {
                    fieldType: 'text',
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'about.desiredMeetingType': {
                id: 'about.desiredMeetingType',
                value: valuesFormData.about?.desiredMeetingType || '',
                title: t('user.about.desiredMeetingType'),
                iconEmoji: '💕️',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.about.desiredMeetingType_friends'),
                                value: 'friends'
                            },
                            {
                                label: t('user.about.desiredMeetingType_loveRelationship'),
                                value: 'loveRelationship'
                            },
                            {
                                label: t('user.about.desiredMeetingType_fun'),
                                value: 'fun'
                            }
                        ],
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'about.relationship': {
                id: 'about.relationship',
                value: valuesFormData.about?.relationship || '',
                title: t('user.about.relationship'),
                iconEmoji: '🧑‍🤝‍🧑',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.about.relationship_single'),
                                value: 'single'
                            },
                            {
                                label: t('user.about.relationship_married'),
                                value: 'married'
                            }
                        ]
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },

            // User physicalAppearance
            'physicalAppearance.height': {
                id: 'physicalAppearance.height',
                value: valuesFormData.physicalAppearance?.height || '',
                title: t('user.physicalAppearance.height'),
                iconEmoji: '📏️',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: optionsHeight
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'physicalAppearance.weight': {
                id: 'physicalAppearance.weight',
                value: valuesFormData.physicalAppearance?.weight || '',
                title: t('user.physicalAppearance.weight'),
                iconEmoji: '⚖️',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: optionsWeight
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },

            // User preferenceAccount
            'email': { // TODO check if email doesn't exist before save!
                id: 'email',
                value: valuesFormData.email || '',
                title: t('user.email'),
                iconEmoji: '✉️',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'text',
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'preferenceAccount.unitSystem': {
                id: 'preferenceAccount.unitSystem',
                value: valuesFormData.preferenceAccount?.unitSystem || '',
                title: t('user.preferenceAccount.unitSystem'),
                iconEmoji: '📏',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('user.preferenceAccount.unitSystem_imperial'),
                                value: 'imperial'
                            },
                            {
                                label: t('user.preferenceAccount.unitSystem_metric'),
                                value: 'metric'
                            }
                        ]
                    },
                    onFieldChange,
                    onFieldSubmit
                }
            },
            'preferenceAccount.language': {
                id: 'preferenceAccount.language',
                value: valuesFormData.preferenceAccount?.language || '',
                title: t('user.preferenceAccount.language'),
                iconEmoji: '🗣️',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'select',
                    data: {
                        optionsInputSelect: [
                            {
                                label: t('preferenceAccount.language_en'),
                                value: 'en'
                            },
                            {
                                label: t('preferenceAccount.language_fr'),
                                value: 'fr'
                            }
                        ]
                    },
                    onFieldSubmit: (field: any) => {
                        const selectedLanguage = field['preferenceAccount.language'] as ILanguage;
                        const isValidLanguage = checkIsValidLanguage(selectedLanguage);

                        if (isValidLanguage && i18n?.changeLanguage && onFieldSubmit) {
                            onFieldSubmit(field).then((res: any) => {
                                if (res) {
                                    console.log('UPDATE - Used system language ===> ', selectedLanguage);
                                    i18n.changeLanguage(selectedLanguage);
                                }
                            });
                        }
                    },
                    onFieldChange
                }
            },

            // User other
            'images': {
                id: 'images',
                value: valuesFormData.images || '',
                title: t('user.images'),
                iconEmoji: '🖼️',
                renderScreen: {
                    fieldType: 'file'
                }
            },
            'blockedsProfiles': {
                id: 'blockedsProfiles',
                title: t('user.userInteractions.myBlock.sent_blockedsProfiles'),
                iconEmoji: '🚫',
                renderScreen: {
                    routeNameIfNavigable: 'FieldsForm',
                    fieldType: 'blockedsProfilesList'
                }
            },
            'xxx': {
                id: 'xxx',
                title: t('user.xxx'),
                iconEmoji: '✅',
                renderScreen: {
                    fieldType: 'text',
                    onFieldSubmit
                }
            },

            // Other fields (not from entities):
            '_onSubmit': {
                id: '_onSubmit',
                title: t('onboarding.lastStep.title'),
                iconEmoji: '✅',
                renderScreen: {
                    fieldType: 'onSubmit',
                    onFieldSubmit
                }
            }
        } as { [key: string]: IItem };
    }
};

export default userSettings;
