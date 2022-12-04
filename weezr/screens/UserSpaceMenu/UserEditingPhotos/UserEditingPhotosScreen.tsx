/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    TouchableHighlight,
    ScrollView,
    LogBox
} from 'react-native';
import { StackScreenProps } from "@react-navigation/stack";
import { Box, Center, Image } from "native-base";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { gql, useMutation } from "@apollo/client";
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import { StackNavigationProp } from '@react-navigation/stack/src/types';
import { useFocusEffect } from "@react-navigation/native";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { updateUserAction } from "../../../reduxActions/user";
import { uploadFile } from "../../../services/UploadFileService";
import { States } from "../../../reduxReducers/states";
import { Header, Text } from '../../../components';
import { setElementInArrayAtIndex } from "../../../toolbox/toolbox";
import { IAlbum, IUser } from "../../../entities";
import getStyles from "./UserEditingPhotosScreen.styles";

const numberLimitOfPhotos = 9;
const marginSizeCells = 5;
const borderRadiusCells = { borderRadius: 12 };

const styles = getStyles({ borderRadiusCells, marginSizeCells });

interface IUserEditingPhotosScreen extends StackScreenProps<any, 'UserEditingPhotos'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    tab: IAlbum;
    updateUserActionProps: (data: any) => any;
    showActionSheetWithOptions: (data: any, callback: (buttonIndex: number) => any) => any;
    marginsAroundContainer?: number;
}

const UPDATE_USER_PHOTO = gql`
    mutation ($filter: User_Filter, $data: User_Data) {
        updateUserPhoto(filter: $filter, data: $data) {
            updatedPageInfo {
                success
                message
            }
            updatedData {
                user {
                    id
                    images
                }
                updatedOrAddedImage
            }
        }
    }
`;

function UserEditingPhotosScreenComponent(props: IUserEditingPhotosScreen) {
    const {
        navigation,
        me,
        tab,
        updateUserActionProps,
        showActionSheetWithOptions,
        marginsAroundContainer = 0
    } = props;

    const [formData, setFormData] = React.useState<{ [name: string]: any }>({});
    const [selectedItemIdOnLoading, setSelectedItemIdOnLoading] = React.useState<string | null>(null);

    const [updateUserPhoto, { error: updateUserPhotoIsError }] = useMutation(UPDATE_USER_PHOTO);

    const numColumns = 3;
    const { width } = Dimensions.get('window');
    const offsetWhenMargins = (numColumns * marginSizeCells) + marginSizeCells;
    const itemWidth: number = ((width - marginsAroundContainer) - offsetWhenMargins) / numColumns;

    React.useEffect(() => {
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    React.useLayoutEffect(() => {
        if (navigation?.setOptions) {
            navigation.setOptions({
                title: `My photos`
            });
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            let allPhotos: any[] = me?.images?.list || [];

            allPhotos = allPhotos
                ?.filter((photo: any) => photo?.album === tab)
                ?.map((photo: any) => ({ ...photo, itemId: photo.fileId }));

            // Set forward photo at first el of array:
            allPhotos = setElementInArrayAtIndex(allPhotos, 'fileId', me?.images?.forwardFileId);

            const allItems = [...allPhotos];

            // Set items 'Add photo' if needed:
            if (allPhotos?.length < numberLimitOfPhotos) {
                for (let i = allPhotos?.length; i < numberLimitOfPhotos; i++) {
                    allPhotos.push({
                        itemId: i.toString(),
                        '40-40': null,
                        '130-130': null,
                        '320-400': null,
                        isForAdd: true,
                        album: null
                    });
                }
            }

            let forwardItem = null;
            let itemsInHeader = [];
            let itemsInContentList = allPhotos;

            if (tab === 'public') {
                forwardItem = allPhotos[0];
                itemsInHeader = allPhotos?.slice(1, 3);
                itemsInContentList = allPhotos?.slice(3);
            }

            setFormData({
                allItems,
                forwardItem,
                itemsInHeader,
                itemsInContentList
            });
        }, [me, tab])
    );

    const onAddPhoto = (photoBlob: any, isForAdd: boolean, selectedItemId = '', isForwardItemSelected?: boolean) => {
        setSelectedItemIdOnLoading(selectedItemId);

        const fileObj = {
            // uri: Platform.OS === 'ios' ? `file:///${photoBlob.path}` : photoBlob.path,
            uri: photoBlob.path,
            type: photoBlob.mime,
            name: photoBlob.filename || `${Date.now()}.jpg`
        };

        uploadFile({
            fileObj,
            entityName: 'user',
            entityId: me._id,
            isMultipleSize: true,
            isMultipleSelect: false,
            fileType: 'image'
        })
            .then((resUploadedFile) => {
                const data = resUploadedFile?.data;
                const filesUrls = data?.filesUrls;

                if (data) {
                    return updateUserPhoto({
                        variables: {
                            filter: {
                                filterUpdate: {
                                    _id: me._id
                                }
                            },
                            data: {
                                dataUpdate: {
                                    state: 'add',
                                    fileId: {
                                        selected: null,
                                        next: data.fileId
                                    },
                                    filesUrls,
                                    isForwardItemSelected,
                                    selectedAlbum: tab
                                }
                            }
                        }
                    }).then((resUpdatedUser: any) => {
                        return resUpdatedUser?.data?.updateUserPhoto?.updatedData;
                    });
                }
            })
            .then((res: any) => {
                if (res?.user) {
                    updateUserActionProps(res.user);
                }

                setSelectedItemIdOnLoading(null);
                // Display toast
            }).catch((err: any) => {
                setSelectedItemIdOnLoading(null);
                console.error(err);
                // Display toast
            });
    };

    if (!me?._id) {
        console.error('There is no userMe');
        return <Center style={styles.main}><Text>Error at loading data...</Text></Center>;
    }

    if (updateUserPhotoIsError) {
        // TODO Display toast
        console.error(updateUserPhotoIsError);
    }

    const renderItem = (photo: any, stylesParam: any = {}, isForwardItem = false) => {
        const {
            itemId,
            size_130_130,
            size_320_400,
            isForAdd
        } = photo;

        let photoUrl = size_130_130;
        const hasError = !photoUrl && !isForAdd; // TODO check if the file of 'photoUrl' existe on the cloud (do query here)
        let itemNode = null;

        if (isForwardItem) {
            photoUrl = size_320_400;
        }

        // Is loading:
        if (selectedItemIdOnLoading && selectedItemIdOnLoading === itemId) {
            itemNode = (
                <Box
                    style={[
                        styles.itemContainer,
                        styles.itemContainerForAdd,
                        {
                            width: itemWidth,
                            height: itemWidth,
                            ...stylesParam,
                        }
                    ]}
                >
                    <ActivityIndicator size="large" animating={true} color="primary.500" style={{ marginBottom: 12 }} />
                </Box>
            );
        } else if (hasError) {
            // If error on photo:
            itemNode = (
                <Box
                    style={[
                        styles.itemContainer,
                        styles.itemContainerForAdd,
                        {
                            width: itemWidth,
                            height: itemWidth,
                            ...stylesParam,
                        }
                    ]}
                >
                    <Image
                        size="xs"
                        resizeMode="contain"
                        source={{ uri: "https://www.iconsdb.com/icons/preview/red/error-xxl.png" }}
                    />
                </Box>
            );
        } else if (photoUrl) {
            // If photo loaded:
            itemNode = (
                <ImageBackground
                    style={[
                        styles.itemContainer,
                        {
                            width: itemWidth,
                            height: itemWidth,
                            ...stylesParam
                        }
                    ]}
                    imageStyle={[borderRadiusCells]}
                    resizeMode="cover"
                    source={{ uri: photoUrl || null }}
                >
                    <Box style={{ position: 'relative' }}>
                        {/*
                        <Text style={{ position: 'absolute', bottom: -20, right: 10 }}>
                            {itemId}
                        </Text>
                        */}
                    </Box>
                </ImageBackground>
            );
        } else if (isForAdd) {
            // If add item:
            itemNode = (
                <Box
                    style={[
                        styles.itemContainer,
                        styles.itemContainerForAdd,
                        {
                            width: itemWidth,
                            height: itemWidth,
                            ...stylesParam,
                        }
                    ]}
                >
                    <Image
                        size="xs"
                        resizeMode="contain"
                        source={{ uri: "https://icons.iconarchive.com/icons/iconsmind/outline/32/Add-icon.png" }}
                        alt="Alternate Text"
                    />
                    {/*
                    <Text style={{ position: 'absolute', bottom: -20, right: 10 }}>
                        {itemId}
                    </Text>
                    */}
                </Box>
            );
        }

        return (
            <TouchableHighlight
                key={itemId}
                activeOpacity={0.8}
                underlayColor="transparent"
                onPress={() => {
                    if (hasError) {
                        console.error('Error at the loading of the photo ', itemId);
                    } else if (isForAdd) {
                        if (showActionSheetWithOptions) {
                            showActionSheetWithOptions(
                                {
                                    options: ["Cancel", "Take photo", "Choose from library"],
                                    cancelButtonIndex: 0,
                                    userInterfaceStyle: 'dark'
                                },
                                (buttonIndex) => {
                                    const options: any = { mediaType: 'photo', width: 500, height: 500, cropping: true };

                                    switch (buttonIndex) {
                                        case 0:
                                            // Cancel
                                            break;
                                        case 1:
                                            // Take photo
                                            openCamera({ ...options })
                                                .then((image) => {
                                                    onAddPhoto(image, isForAdd, itemId, isForwardItem);
                                                }).catch((err) => console.error(err));
                                            break;
                                        case 2:
                                            // Choose from library
                                            openPicker({ ...options })
                                                .then((image) => {
                                                    onAddPhoto(image, isForAdd, itemId, isForwardItem);
                                                }).catch((err) => console.error(err));
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            );
                        }
                    } else {
                        const defaultSizeUri = 'size_320_400';
                        const indexCurrentPhoto = formData.allItems?.findIndex((item: any) => item.itemId === photo.itemId) || 0;

                        const photos = formData.allItems?.map((item: any, index: number) => {
                            if (!(item && item[defaultSizeUri])) { return false; }

                            return {
                                url: item[defaultSizeUri],
                                fileId: item.itemId,
                                // album: item.album,
                                album: tab,
                                isForwardItem: (tab === 'public' && index === 0)
                            };
                        });

                        if (indexCurrentPhoto !== -1 && photos?.length && photos[indexCurrentPhoto]) {
                            navigation.navigate('PhotoDetailModal', {
                                photos,
                                indexCurrentPhoto,
                                defaultSizeUri,
                                isEditing: true,
                                userId: me?._id,
                                currentAlbumTab: tab
                            });
                        } else {
                            console.error('Not image found!');
                        }
                    }
                }}
            >
                {itemNode}
            </TouchableHighlight>
        );
    };

    const renderEmpty = () => {
        return (
            <Center safeArea>
                <Header>No photo</Header>
            </Center>
        );
    };

    /*
    const renderFooter = () => {
        if (selectedItemIdOnLoading) {
            return <ActivityIndicator size="large" animating={true} color="primary.500" style={{ marginBottom: 12 }} />;
        }

        return null;
    };
    */

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <Box style={{/* styles.container */}}>
                    <FlatList
                        data={formData?.itemsInContentList?.length ? formData.itemsInContentList : []}
                        renderItem={({ item: photo }: any) => renderItem(photo)}
                        keyExtractor={(item) => item.itemId as any}
                        numColumns={numColumns}
                        // ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                        ListHeaderComponent={() => {
                            if (tab === 'public') {
                                let forwardItemNode = null;
                                let itemsInHeaderNode = null;

                                if (formData?.forwardItem) {
                                    forwardItemNode = renderItem(formData.forwardItem, { height: itemWidth * 2, width: itemWidth * 2 }, true);
                                }

                                if (formData?.itemsInHeader?.length) {
                                    itemsInHeaderNode = formData.itemsInHeader.map((item: any) => renderItem(item));
                                }

                                return (
                                    <Box style={{ flexDirection: 'row' }}>
                                        {forwardItemNode}

                                        <Box style={{ flexDirection: 'column' }}>
                                            {itemsInHeaderNode}
                                        </Box>
                                    </Box>
                                );
                            }

                            return null;
                        }}
                        scrollEnabled={false}
                        contentContainerStyle={{
                            marginTop: 5
                        }}
                    />
                </Box>
            </ScrollView>
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch),
    };
}

const UserEditingPhotosScreen = connectActionSheet(UserEditingPhotosScreenComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserEditingPhotosScreen);
