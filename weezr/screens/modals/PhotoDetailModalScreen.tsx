/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { Dimensions, Image, Text } from 'react-native';
import { Box, Center, Button } from "native-base";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { StackScreenProps } from '@react-navigation/stack';
import ImageViewer from 'react-native-image-zoom-viewer';
import { StackNavigationProp } from "@react-navigation/stack/src/types";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { openCamera, openPicker } from "react-native-image-crop-picker";
import { updateUserAction } from "../../reduxActions/user";
import { deleteFile, uploadFile } from "../../services/UploadFileService";
import { Spinner } from "../../components/Spinner";
import { IAlbum } from "../../entities";
import getStyles from "./PhotoDetailModalScreen.styles";

const { width, height } = Dimensions.get('window');
const styles = getStyles({ width });

interface IPhotoDetailModalScreen extends StackScreenProps<any, 'PhotoDetailModal'> {
    navigation: StackNavigationProp<any, any>;
    showActionSheetWithOptions: (data: any, callback: (buttonIndex: number) => any) => any;
    updateUserActionProps: (data: any) => any;
}

interface IPhotos {
    url: string;
    fileId?: string;
    album?: IAlbum;
    isForwardItem?: boolean;
    width?: number;
    height?: number;
}

interface IParam {
    photos: IPhotos[];
    indexCurrentPhoto: number;
    defaultSizeUri?: string; // size_xxx_xxx
    isEditing?: boolean;
    userId?: string;
    currentAlbumTab?: IAlbum;
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

function PhotoDetailModalScreenComponent({
    navigation,
    route,
    showActionSheetWithOptions,
    updateUserActionProps
}: IPhotoDetailModalScreen) {
    const {
        photos: photosParam,
        defaultSizeUri,
        isEditing,
        userId,
        indexCurrentPhoto: indexCurrentPhotoDefault,
        // currentAlbumTab
    } = route.params as IParam;

    const [photos, setPhotos] = React.useState<IPhotos[]>([]);
    const [indexCurrentPhoto, setIndexCurrentPhoto] = React.useState<number>(indexCurrentPhotoDefault || 0);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [updateUserPhoto, { error: updateUserPhotoIsError }] = useMutation(UPDATE_USER_PHOTO);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `${indexCurrentPhoto + 1}/${photos?.length}`,
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                >
                    Close
                </Button>
            )
        });
    }, [navigation, indexCurrentPhoto, photos]);

    React.useEffect(() => {
        const nextPhotos = photosParam?.map((photo) => {
            return {
                ...photo,
                width,
                height
            };
        });

        setPhotos(nextPhotos || []);
    }, [photosParam]);

    const onUpdateStatePhotos = (dataToUpdate: Partial<IPhotos>) => {
        if (dataToUpdate && indexCurrentPhoto !== -1 && photos[indexCurrentPhoto]) {
            const nextPhotos: any = [...photos];

            nextPhotos[indexCurrentPhoto] = {
                ...nextPhotos[indexCurrentPhoto]
            };

            if (dataToUpdate.url) {
                nextPhotos[indexCurrentPhoto].url = dataToUpdate.url;
                nextPhotos[indexCurrentPhoto].fileId = dataToUpdate.fileId;

                // Need this shit for do force update for ImageViewer:
                nextPhotos[indexCurrentPhoto].props = {
                    ...nextPhotos[indexCurrentPhoto].props,
                    source: {
                        ...nextPhotos[indexCurrentPhoto].props.source,
                        uri: dataToUpdate.url,
                    }
                };
            }

            if (dataToUpdate.isForwardItem) {
                nextPhotos[indexCurrentPhoto].isForwardItem = dataToUpdate.isForwardItem;
            }

            if (dataToUpdate.album) {
                // We should remove the changed photo to state, because isn't in the same album:
                // nextPhotos.splice(currentAlbumTab, 1);
                // setIndexCurrentPhoto(0);

                // But because react-native-image-zoom-viewer is shitting, we juste change the album name:
                nextPhotos[indexCurrentPhoto].album = dataToUpdate.album;
            }

            setPhotos(nextPhotos);
        }
    };

    const onUpdatePhoto = (blob: any, currentPhoto: IPhotos) => {
        const { fileId, album, isForwardItem } = currentPhoto || {};

        if (!blob || !fileId) {
            // Display toast
            return;
        }

        setIsLoading(true);

        uploadFile({
            photoBlob: blob,
            entityName: 'user',
            entityId: userId,
            isMultipleSize: true,
            isMultipleSelect: false
        })
            .then((resUploadedFile) => {
                const data = resUploadedFile?.data;
                const filesUrls = data?.filesUrls;

                if (data) {
                    return updateUserPhoto({
                        variables: {
                            filter: {
                                filterUpdate: {
                                    _id: userId
                                }
                            },
                            data: {
                                dataUpdate: {
                                    state: 'update',
                                    fileId: {
                                        selected: fileId,
                                        next: data.fileId
                                    },
                                    filesUrls,
                                    isForwardItemSelected: isForwardItem,
                                    selectedAlbum: album
                                }
                            }
                        }
                    }).then((resUpdatedUser: any) => {
                        return resUpdatedUser?.data?.updateUserPhoto?.updatedData;
                    });
                }
            })
            .then((res: any) => {
                if (isEditing && res?.user?.images) {
                    updateUserActionProps(res.user).then(() => {
                        /*
                        navigation.setParams({
                            ...route.params,
                            ...res.updatedOrAddedImage,
                            uri: res.updatedOrAddedImage && res.updatedOrAddedImage[defaultSizeUri || '']
                        });
                        */

                        onUpdateStatePhotos({
                            ...res.updatedOrAddedImage,
                            url: res.updatedOrAddedImage && res.updatedOrAddedImage[defaultSizeUri || '']
                        });
                    });
                }

                setIsLoading(false);
            }).catch((err: any) => {
                console.error(err);
                setIsLoading(false);
                // Display toast
            });
    };

    const onDeletePhoto = (currentPhoto: IPhotos) => {
        const { fileId, isForwardItem } = currentPhoto;

        if (!fileId) {
            // Display toast
            return;
        }

        setIsLoading(true);

        deleteFile({
            entityName: 'user',
            entityId: userId,
            selectedFileId: fileId
        })
            .then((resDeletedFile) => {
                const deletedFileId = resDeletedFile?.data?.deletedFileId;

                if (deletedFileId) {
                    return updateUserPhoto({
                        variables: {
                            filter: {
                                filterUpdate: {
                                    _id: userId,
                                    'images.list': { $elemMatch: { fileId: deletedFileId } }
                                }
                            },
                            data: {
                                dataUpdate: {
                                    state: 'delete',
                                    fileId: {
                                        selected: deletedFileId,
                                        next: null
                                    },
                                    isForwardItemSelected: isForwardItem
                                }
                            }
                        }
                    }).then((resUpdatedUser: any) => {
                        return resUpdatedUser?.data?.updateUserPhoto?.updatedData;
                    });
                }
            })
            .then((res: any) => {
                if (isEditing && res?.user?.images) {
                    updateUserActionProps(res?.user).then(() => {
                        navigation.goBack();
                        // Display toast
                    });
                }

                setIsLoading(false);
            }).catch((err: any) => {
                console.error(err);
                setIsLoading(false);
                // Display toast
            });
    };

    const onUpdatePhotoAsForward = (currentPhoto: IPhotos) => {
        const { fileId, isForwardItem } = currentPhoto || {};

        if (!fileId) {
            // Display toast
            return;
        }

        setIsLoading(true);

        updateUserPhoto({
            variables: {
                filter: {
                    filterUpdate: {
                        _id: userId,
                        'images.list': { $elemMatch: { fileId } }
                    }
                },
                data: {
                    dataUpdate: {
                        state: 'updateMetaData',
                        metaDataUpdate: {
                            $set: { 'images.forwardFileId': fileId }
                        },
                        fileId: {
                            selected: fileId,
                            next: fileId
                        },
                        isForwardItemSelected: isForwardItem
                    }
                }
            }
        }).then((res: any) => {
            const updatedData = res?.data?.updateUserPhoto?.updatedData;

            if (isEditing && updatedData?.user?.images) {
                updateUserActionProps(updatedData.user).then(() => {
                    /*
                    navigation.setParams({
                        ...route.params,
                        isForwardItem: true
                    });
                    */

                    onUpdateStatePhotos({ isForwardItem: true });
                    // Display toast
                });
            }

            setIsLoading(false);
        }).catch((err: any) => {
            console.error(err);
            setIsLoading(false);
            // Display toast
        });
    };

    const onUpdatePhotoMoveAlbum = (currentPhoto: IPhotos) => {
        const { fileId, album, isForwardItem } = currentPhoto;

        if (!fileId) {
            // Display toast
            return;
        }

        let albumToUpdate: any = 'public';
        if (album === 'public') { albumToUpdate = 'private'; }

        setIsLoading(true);

        updateUserPhoto({
            variables: {
                filter: {
                    filterUpdate: {
                        _id: userId,
                        'images.list': { $elemMatch: { fileId } }
                    }
                },
                data: {
                    dataUpdate: {
                        state: 'updateMetaData',
                        metaDataUpdate: {
                            $set: { 'images.list.$.album': albumToUpdate }
                        },
                        fileId: {
                            selected: fileId,
                            next: fileId
                        },
                        selectedAlbum: albumToUpdate,
                        isForwardItemSelected: isForwardItem
                    }
                }
            }
        }).then((res: any) => {
            const updatedData = res?.data?.updateUserPhoto?.updatedData;

            if (isEditing && updatedData?.user?.images) {
                updateUserActionProps(updatedData.user).then(() => {
                    /*
                    navigation.setParams({
                        ...route.params,
                        album: albumToUpdate
                    });
                    */

                    onUpdateStatePhotos({ album: albumToUpdate });
                    // Display toast
                });
            }

            setIsLoading(false);
        }).catch((err: any) => {
            console.error(err);
            setIsLoading(false);
            // Display toast
        });
    };

    const onOpenActionSheetForUpdatePhoto = (currentPhoto: IPhotos) => {
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
                            .then((blob) => {
                                onUpdatePhoto(blob, currentPhoto);
                            }).catch((err) => console.error(err));
                        break;
                    case 2:
                        // Choose from library
                        openPicker({ ...options })
                            .then((blob) => {
                                onUpdatePhoto(blob, currentPhoto);
                            }).catch((err) => console.error(err));
                        break;
                    default:
                        break;
                }
            }
        );
    };

    const renderImage = (props: any) => {
        const styleHeight = props.style?.height - 120;
        return <Image {...props} height={styleHeight} resizeMode="contain" />;
    };

    const renderLoader = () => <Spinner />;

    const renderFooter = (currentIndex: number) => {
        const currentPhoto = (photos && photos[currentIndex]) || {};
        const { album, isForwardItem } = currentPhoto;

        let infos = null;
        if (isForwardItem) {
            infos = 'Main photo';
        } else if (album) {
            infos = 'As ' + album?.charAt(0)?.toUpperCase() + album?.slice(1);
        }

        return (
            <Box style={[styles.container, styles.toolbarBottomContainer]}>
                <Box>
                    { infos && <Text style={styles.infosText}>{infos}</Text> }
                </Box>

                <Box style={{ flex: 1 }} />

                <Box>
                    {
                        isEditing && (
                            <Button
                                onPress={() => {
                                    if (showActionSheetWithOptions) {
                                        const options = [
                                            'Close',
                                            'Replace the photo'
                                        ];

                                        if (album === 'public' && !isForwardItem) {
                                            options.push('Set as main photo');
                                            options.push('Move to Private');
                                        } else if (album !== 'public') {
                                            options.push('Move to Public');
                                        }

                                        options.push('Delete the photo');

                                        showActionSheetWithOptions(
                                            {
                                                options,
                                                cancelButtonIndex: 0,
                                                userInterfaceStyle: 'dark',
                                                destructiveButtonIndex: options?.length - 1
                                            },
                                            (buttonIndex) => {
                                                if (album === 'public' && !isForwardItem) {
                                                    switch (buttonIndex) {
                                                        case 0:
                                                            // Close
                                                            break;
                                                        case 1:
                                                            // Replace the photo
                                                            onOpenActionSheetForUpdatePhoto(currentPhoto);
                                                            break;
                                                        case 2:
                                                            // Set as main photo ??
                                                            onUpdatePhotoAsForward(currentPhoto);
                                                            break;
                                                        case 3:
                                                            // Move to Private / Public
                                                            onUpdatePhotoMoveAlbum(currentPhoto);
                                                            break;
                                                        case 4:
                                                            // Delete the photo
                                                            onDeletePhoto(currentPhoto);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                } else if (album !== 'public') {
                                                    switch (buttonIndex) {
                                                        case 0:
                                                            // Close
                                                            break;
                                                        case 1:
                                                            // Replace the photo
                                                            onOpenActionSheetForUpdatePhoto(currentPhoto);
                                                            break;
                                                        case 2:
                                                            // Move to Private / Public
                                                            onUpdatePhotoMoveAlbum(currentPhoto);
                                                            break;
                                                        case 3:
                                                            // Delete the photo
                                                            onDeletePhoto(currentPhoto);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                } else {
                                                    switch (buttonIndex) {
                                                        case 0:
                                                            // Close
                                                            break;
                                                        case 1:
                                                            // Replace the photo
                                                            onOpenActionSheetForUpdatePhoto(currentPhoto);
                                                            break;
                                                        case 2:
                                                            // Delete the photo
                                                            onDeletePhoto(currentPhoto);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }
                                            }
                                        );
                                    }
                                }}
                            >
                                ✏️ Edit
                            </Button>
                        )
                    }
                </Box>
            </Box>
        );
    };

    if (updateUserPhotoIsError) {
        // TODO Display toast
        console.error(updateUserPhotoIsError);
    }

    return (
        <Box style={styles.main}>
            <Center style={{ position: 'relative', width: '100%', height: '100%' }}>
                <ImageViewer
                    key={photos?.length || 0}
                    enablePreload
                    style={{ width: '100%', height: '100%' }}
                    imageUrls={photos}
                    renderImage={renderImage}
                    loadingRender={renderLoader}
                    renderFooter={renderFooter}
                    renderIndicator={() => <Text> </Text>}
                    index={indexCurrentPhoto}
                    onChange={(index?: number) => setIndexCurrentPhoto(index as number)}
                />

                { isLoading && renderLoader() }
            </Center>
        </Box>
    );
}

/*
function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}
*/

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch),
    };
}

const PhotoDetailModalScreen = connectActionSheet(PhotoDetailModalScreenComponent);

export default connect(null, mapDispatchToProps)(PhotoDetailModalScreen);
