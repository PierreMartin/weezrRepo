// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import { RefreshControl, TouchableHighlight } from 'react-native';
import { Box, Center, Icon } from "native-base";
import { RowMap, SwipeListView } from "react-native-swipe-list-view";
import { StackNavigationProp } from '@react-navigation/stack/src/types';
import { Header, Text, View } from '.';
import { InputSearch } from "./InputSearch";
import { Avatar } from "./Avatar";
import { SpinnerIndicator } from "./SpinnerIndicator";
import getStyles from "./list.styles";

const styles = getStyles();

interface IList {
    navigation?: StackNavigationProp<any, any>;
    data: any;
    renderFields: (fieldsSource: any) => any;
    customRenderItem?: (fieldsSource: any) => any;
    onLoadData: () => void;
    onLoadMoreData: () => void;
    isDataLoading?: boolean;
    isDataLoadingMore?: boolean;
    isDataError?: any;
    hasHeaderHidden?: boolean;
    isSwipeable?: boolean;
    swipeListComponentProps?: {
        renderHiddenFields: (itemData: any, rowMap: RowMap<any>) => any;
        disableLeftSwipe?: boolean;
        disableRightSwipe?: boolean;
        leftOpenValue?: number;
        rightOpenValue?: number;
    }
}

export const List = ({
    data,
    renderFields,
    isDataLoadingMore,
    isDataLoading,
    isDataError,
    onLoadData,
    onLoadMoreData,
    navigation,
    hasHeaderHidden,
    isSwipeable,
    swipeListComponentProps
}: IList) => {
    const [swipedItem, setSwipedItem] = React.useState<string | null>(null);

    const renderItem = ({ item: fieldsSource, separators }: any) => {
        const fields = renderFields(fieldsSource) || {};
        const { routeName, paramList } = fields?.navigate || {};

        return (
            <TouchableHighlight
                key={fieldsSource.id}
                activeOpacity={0.8}
                underlayColor="#DDDDDD"
                disabled={!fields?.navigate?.routeName}
                onPress={() => {
                    if (swipedItem) { return; }

                    if (navigation && routeName) {
                        navigation.navigate(routeName, paramList);
                    }
                }}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}
                style={styles.itemRowFrontContainer}
            >
                <View>
                    {/* Main row: */}
                    <View style={styles.itemRowFront}>
                        <Avatar
                            style={styles.itemPicture}
                            user={fields.avatar}
                            size="sm"
                        />

                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row' }}>
                                { fields.isOnline && (<Icon as={Ionicons} name="radio-button-on-outline" size="4" color="#16BF24FF" mr={1} />) }
                                { (fields.title?.length > 0) && <Text style={styles.itemPrimaryText}>{fields.title}</Text> }
                            </View>

                            { (fields.content) && <Text style={styles.itemSecondaryText}>{fields.content}</Text> }
                        </View>

                        {/* Custom container: */}
                        {
                            fields.customRenderContainer && (
                                <View style={{ marginRight: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {fields.customRenderContainer() }
                                    </View>
                                </View>
                            )
                        }

                        <View>
                            <View style={{ flexDirection: 'row' }}>
                                { fields.at && <Text style={styles.itemSecondaryText}>{fields.at}</Text> }
                                { fields.checkmark && <Text> {fields.checkmark()}</Text> }
                            </View>

                            <Text style={{ marginTop: 6 }}>
                                { fields.badge && fields.badge() }
                            </Text>
                        </View>
                    </View>

                    {/* Custom rows: */}
                    {
                        fields.customRenderContainerNextRows && fields.customRenderContainerNextRows()?.map((customRow: any, index: number) => {
                            if (!customRow) { return null; }

                            return (
                                <View key={index} style={styles.itemRowFront}>
                                    <View style={{ width: 40 }} />

                                    <View style={{ flex: 1 }}>
                                        {customRow}
                                    </View>
                                </View>
                            );
                        })
                    }
                </View>
            </TouchableHighlight>
        );
    };

    // For swipe
    const renderHiddenItem = (itemData: any, rowMap: RowMap<any>) => {
        if (!isSwipeable || !swipeListComponentProps?.renderHiddenFields) { return null; }

        return (
            <View style={styles.itemRowBackContainer}>
                {swipeListComponentProps.renderHiddenFields(itemData, rowMap)}
            </View>
        );
    };

    const renderSeparator = () => <View style={{ height: 1, backgroundColor: '#d9d9d9' }} />;

    const renderHeader = () => {
        if (hasHeaderHidden) { return null; }

        return (
            <View style={[styles.itemRowFront, { backgroundColor: '#eeeeee' }]}>
                <InputSearch fieldData={{ placeholder: 'Search' }} />
            </View>
        );
    };

    const renderFooter = () => {
        return isDataLoadingMore ? <SpinnerIndicator style={{ width: 65, height: 60, marginTop: -70 }} /> : null;
    };

    const renderEmpty = () => {
        let emptyNode = null;

        if (!isDataLoading && !isDataError) {
            emptyNode = (
                <Center safeArea>
                    <Header>Aucun résultat</Header>
                </Center>
            );
        }

        return emptyNode;
    };

    const onRefresh = () => {
        onLoadData();
    };

    return (
        <Box style={{ flexDirection: 'row', width: '100%' }}>
            {/*
            <FlatList
                data={data?.map((d: any, index: number) => ({ ...d, id: (d._id || d.id || index) }))}
                renderItem={renderItem}
                keyExtractor={(dataParam: any) => dataParam.id?.toString()}
                ItemSeparatorComponent={renderSeparator}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
                onEndReached={onLoadMoreData}
                onEndReachedThreshold={0.02}
            />
            */}

            <SwipeListView
                data={data?.map((d: any, index: number) => ({ ...d, id: (d._id || d.id || index) }))}
                renderItem={renderItem}
                keyExtractor={(dataParam: any) => dataParam.id?.toString()}
                ItemSeparatorComponent={renderSeparator}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
                onEndReached={onLoadMoreData}
                onEndReachedThreshold={0.02}
                renderHiddenItem={renderHiddenItem}/* For swipe */
                disableRightSwipe/* For swipe */
                rightOpenValue={-75}/* For swipe */
                onRowOpen={(selectedItemId: string) => setSwipedItem(selectedItemId)}/* For swipe */
                onRowClose={() => setSwipedItem(null)}/* For swipe */
            />
        </Box>
    );
};
