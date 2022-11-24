import * as React from 'react';
import { FlatList, RefreshControl, TouchableHighlight } from 'react-native';
import { Box, Center } from "native-base";
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
    hasHeaderHidden
}: IList) => {
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
                    if (navigation && routeName) {
                        navigation.navigate(routeName, paramList);
                    }
                }}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}
            >
                <View>
                    {/* Main row: */}
                    <View style={styles.itemRow}>
                        <Avatar
                            style={styles.itemPicture}
                            user={fields.avatar}
                            size="sm"
                        />
                        <View style={{ flex: 1 }}>
                            { (fields.title?.length > 0) && <Text style={styles.itemPrimaryText}>{fields.title}</Text> }
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
                            { fields.at && <Text style={styles.itemSecondaryText}>{fields.at}</Text> }

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
                                <View key={index} style={styles.itemRow}>
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

    const renderSeparator = () => <View style={{ height: 1, backgroundColor: '#d9d9d9' }} />;

    const renderHeader = () => {
        if (hasHeaderHidden) { return null; }

        return (
            <View style={[styles.itemRow, { backgroundColor: '#eeeeee' }]}>
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
        </Box>
    );
};
