/* eslint-disable @typescript-eslint/naming-convention */
// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { useLazyQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Box, Button, Icon } from 'native-base';
import { connect } from "react-redux";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { openCamera, openPicker } from "react-native-image-crop-picker";
import { uploadFile } from "../services/UploadFileService";
import { PhotosGallery } from "./PhotosGallery";
import { IUser, IUserImagesList, IUserPhotoThread } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from "./FilesBottomSheetPicker.styles";

const styles = getStyles();

export interface IFilesBottomSheetPicker {
    me?: IUser;
    fetchRecentFilesGql: {
        query: any;
        params: any;
    };
    paramsUploadFile: {
        entityName: 'threadMessage';
        entityId: string;
        isMultipleSize: boolean;
        isMultipleSelect: boolean;
    };
    onLoadPending: () => void;
    onLoadSuccess: (data: any) => void;
    onLoadError: () => void;
}

const FilesBottomSheetPicker = React.forwardRef((props: IFilesBottomSheetPicker, ref: any) => {
    const [recentFiles, setRecentFiles] = React.useState<IUserPhotoThread[]>([]);
    const [selectedFile, setSelectedFile] = React.useState<Partial<IUserImagesList> | null>(null);
    const [isBottomSheetPickerOpened, setIsBottomSheetPickerOpened] = React.useState<boolean>(false);
    const [recentFilesIsLoading, setRecentFilesIsLoading] = React.useState<boolean>(true);

    const { t } = useTranslation();

    const {
        me,
        fetchRecentFilesGql,
        paramsUploadFile,
        onLoadPending,
        onLoadSuccess,
        onLoadError
    } = props;

    const [getRecentFiles, {
        data: recentFilesGql,
        // loading: recentFilesIsLoading,
        error: getRecentFilesIsError,
        // fetchMore: fetchMoreRecentFiles
    }] = useLazyQuery(fetchRecentFilesGql.query, {
        fetchPolicy: 'network-only',
        onCompleted: () => { setRecentFilesIsLoading(false); },
        onError: () => { setRecentFilesIsLoading(false); }
    });

    const TabPhotosGalleryStack: any = createNativeStackNavigator<any>();
    const TabPhotosGalleryTopStack: any = createMaterialTopTabNavigator<any>();

    React.useEffect(() => {
        if (isBottomSheetPickerOpened) {
            getRecentFiles(fetchRecentFilesGql.params);
        }
    }, [isBottomSheetPickerOpened]);

    React.useEffect(() => {
        if (recentFilesGql?.userPhotosThread?.data?.length) {
            setRecentFiles(recentFilesGql.userPhotosThread?.data);
        }
    }, [recentFilesGql]);

    const onClosePhotosPicker = React.useCallback(() => {
        ref?.current?.dismiss();
    }, []);

    const onUploadNewFile = (fileBlob: any) => {
        if (!fileBlob) { return; }

        // Tmp loading:
        onLoadPending();

        // Close BottomSheetModal:
        onClosePhotosPicker();

        uploadFile({
            photoBlob: fileBlob,
            ...paramsUploadFile
        })
            .then((resUploadedFile: any) => {
                if (resUploadedFile?.data) {
                    onLoadSuccess({ ...resUploadedFile.data, isNewUploadedFile: true });
                }
            }).catch((err: any) => {
                // Tmp error:
                onLoadError();
                console.error(err);
                // Display toast
            });
    };

    const onSendExistingFile = (fileToSend: any) => {
        if (!fileToSend?.fileId) { return; }

        // Tmp loading:
        onLoadPending();

        // Close BottomSheetModal:
        onClosePhotosPicker();

        onLoadSuccess(fileToSend);
    };

    if (getRecentFilesIsError) {
        // TODO Display toast
        console.error(getRecentFilesIsError);
    }

    const optionsMedia: any = { mediaType: 'photo', width: 500, height: 500, cropping: true };

    const styleBottomActionsButton = {
        // borderTopWidth: 1,
        borderTopColor: 'gray.300',
        width: '100%',
        variant: 'none',
        _text: { fontSize: 17, color: 'primary.500' }
    };

    return (
        <BottomSheetModal
            ref={ref}
            index={1}
            snapPoints={['40%', '70%']}
            backdropComponent={(propsBackdrop) => (<BottomSheetBackdrop {...propsBackdrop} />)}
            onChange={(index: number) => setIsBottomSheetPickerOpened(index !== -1)}
        >
            <Box style={[styles.container, styles.bottomSheetModal_container]}>
                {/* Top actions sheet container
                <Box style={{ flexDirection: 'row-reverse', marginBottom: 6}}>
                    <Button
                        leftIcon={<Icon as={Ionicons} name="close-outline" size="xs" />}
                        variant="solid"
                        p={1}
                        onPress={onClosePhotosPicker}
                    />
                </Box>
                */}

                {/* Wee need to use <NavigationContainer> here because we are in BottomSheetModal */}
                <NavigationContainer>
                    <TabPhotosGalleryStack.Navigator screenOptions={{ headerShown: false }}>
                        <TabPhotosGalleryStack.Screen name="TabPhotosGallery">
                            {() => {
                                return (
                                    <TabPhotosGalleryTopStack.Navigator
                                        screenOptions={{
                                            tabBarLabelStyle: {
                                                fontSize: 12
                                            }
                                        }}
                                    >
                                        <TabPhotosGalleryTopStack.Screen name="TabRecent" options={{ tabBarLabel: 'Recent' }}>
                                            {() => (
                                                <PhotosGallery
                                                    data={recentFiles}
                                                    isLoading={recentFilesIsLoading}
                                                    onSelectedItem={(selectedItemParam: Partial<IUserImagesList> | null) => { setSelectedFile(selectedItemParam); }}
                                                    selectedItem={selectedFile}
                                                    numColumns={3}
                                                    numRows={2}
                                                />
                                            )}
                                        </TabPhotosGalleryTopStack.Screen>

                                        <TabPhotosGalleryTopStack.Screen name="TabPublic" options={{ tabBarLabel: 'My public photos' }}>
                                            {() => (
                                                <PhotosGallery
                                                    data={me?.images?.list?.filter((image) => image.album === 'public')}
                                                    isLoading={!me?._id}
                                                    onSelectedItem={(selectedItemParam: Partial<IUserImagesList> | null) => { setSelectedFile(selectedItemParam); }}
                                                    selectedItem={selectedFile}
                                                    numColumns={3}
                                                    numRows={2}
                                                />
                                            )}
                                        </TabPhotosGalleryTopStack.Screen>

                                        <TabPhotosGalleryTopStack.Screen name="TabPrivate" options={{ tabBarLabel: 'My private photos' }}>
                                            {() => (
                                                <PhotosGallery
                                                    data={me?.images?.list?.filter((image) => image.album === 'private')}
                                                    isLoading={!me?._id}
                                                    onSelectedItem={(selectedItemParam: Partial<IUserImagesList> | null) => { setSelectedFile(selectedItemParam); }}
                                                    selectedItem={selectedFile}
                                                    numColumns={3}
                                                    numRows={2}
                                                />
                                            )}
                                        </TabPhotosGalleryTopStack.Screen>
                                    </TabPhotosGalleryTopStack.Navigator>
                                );
                            }}
                        </TabPhotosGalleryStack.Screen>
                    </TabPhotosGalleryStack.Navigator>
                </NavigationContainer>

                <Box style={styles.bottomSheetModal_bottomActionsContainer}>
                    {
                        selectedFile?.fileId && (
                            <Button
                                {...styleBottomActionsButton}
                                leftIcon={<Icon as={Ionicons} name="send-outline" size="sm" />}
                                onPress={() => {
                                    onSendExistingFile({
                                        filesUrls: {
                                            size_130_130: selectedFile?.size_130_130,
                                            size_40_40: selectedFile?.size_40_40,
                                            size_320_400: selectedFile?.size_320_400
                                        },
                                        fileId: selectedFile.fileId
                                    });
                                }}
                            >
                                {t('filesBottomSheetPicker.bottomActions.sendSelectedPhoto')}
                            </Button>
                        )
                    }

                    <Button
                        {...styleBottomActionsButton}
                        leftIcon={<Icon as={Ionicons} name="camera-outline" size="sm" />}
                        onPress={() => {
                            openCamera({ ...optionsMedia })
                                .then((image) => {
                                    onUploadNewFile(image);
                                })
                                .catch((err) => console.error(err));
                        }}
                    >
                        {t('filesBottomSheetPicker.bottomActions.takePhoto')}
                    </Button>

                    <Button
                        {...styleBottomActionsButton}
                        leftIcon={<Icon as={Ionicons} name="albums-outline" size="sm" />}
                        onPress={() => {
                            openPicker({ ...optionsMedia })
                                .then((image) => {
                                    onUploadNewFile(image);
                                })
                                .catch((err) => console.error(err));
                        }}
                    >
                        {t('filesBottomSheetPicker.bottomActions.choosePhoto')}
                    </Button>

                    <Button
                        {...styleBottomActionsButton}
                        leftIcon={<Icon as={Ionicons} name="close-outline" size="sm" />}
                        onPress={() => ref?.current?.dismiss()}
                    >
                        {t('filesBottomSheetPicker.bottomActions.close')}
                    </Button>
                </Box>
            </Box>
        </BottomSheetModal>
    );
});

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(FilesBottomSheetPicker);
