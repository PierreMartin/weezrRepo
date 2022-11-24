/* eslint-disable @typescript-eslint/naming-convention */
// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions, FlatList, ImageBackground, Text, TouchableHighlight } from "react-native";
import { Box, Icon } from 'native-base';
import { Spinner } from "./Spinner";
import { Header } from "./index";
import { IUserImagesList } from "../entities";

const marginSize = 2;

export interface IPhotosGallery {
    data?: Partial<IUserImagesList>[];
    isLoading: boolean;
    onSelectedItem?: (selectedItem: Partial<IUserImagesList> | null) => void;
    selectedItem?: Partial<IUserImagesList> | null;
    numColumns?: number;
    numRows?: number;
}

export function PhotosGallery(props: IPhotosGallery) {
    const {
        data,
        isLoading,
        onSelectedItem,
        selectedItem,
        numColumns: numColumnsProps,
        // numRows: numRowsProps
    } = props;

    useFocusEffect(
        React.useCallback(() => {
            if (onSelectedItem) { onSelectedItem(null); }
        }, [])
    );

    const haveImages = (
        data
        && data?.length > 0
        && data.some((image) => image?.size_130_130)
    );

    const numColumns = numColumnsProps || 3;
    // const numRows = numRowsProps || 8;
    const { width } = Dimensions.get('window');
    const offsetWhenMargins = (numColumns * marginSize) + marginSize;
    const offsetExternalMargins = 8;
    const itemWidth: number = (width - offsetWhenMargins - offsetExternalMargins) / numColumns;
    // const containerGalleryHeight = (itemWidth * numRows) || 300;

    const renderItem = ({ item }: { item: Partial<IUserImagesList> }) => {
        const { fileId, size_130_130 } = item;

        if (!fileId || !size_130_130) { return null; }

        return (
            <TouchableHighlight
                key={fileId}
                activeOpacity={0.8}
                underlayColor="transparent"
                onPress={() => {
                    if (onSelectedItem) {
                        const nextSelectedItem = (selectedItem?.fileId && selectedItem.fileId === fileId) ? null : item;
                        onSelectedItem(nextSelectedItem);
                    }
                }}
            >
                <ImageBackground
                    style={[
                        // styles.itemContainer,
                        {
                            width: itemWidth,
                            height: itemWidth
                        }
                    ]}
                    resizeMode="cover"
                    source={{ uri: size_130_130 }}
                >
                    <Box p={3} style={{ position: 'relative' }}>
                        <Text style={{ position: 'absolute', top: 8, right: 8 }}>
                            {(selectedItem?.fileId && selectedItem.fileId === fileId) ? (
                                <Icon as={Ionicons} name="checkmark-circle" color="primary.500" size={5} ml="2" mr="2" />
                            ) : ''}
                        </Text>
                    </Box>
                </ImageBackground>
            </TouchableHighlight>
        );
    };

    return (
        <Box flex={1}>
            {
                (!isLoading && haveImages) ? (
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.fileId as any}
                        numColumns={numColumns}
                        contentContainerStyle={{
                            // marginTop: 20
                        }}
                    />
                ) : (
                    <Box flex={1} alignItems="center" justifyContent="center">
                        {
                            isLoading ? (<Spinner />) : (<Header>Aucun résultat</Header>)
                        }
                    </Box>
                )
            }
        </Box>
    );
}
