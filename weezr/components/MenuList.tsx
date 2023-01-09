import React from 'react';
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { FlatList, TouchableHighlight, LogBox } from 'react-native';
import { Label, View } from "./index";
import { defaultRenderValue, getInputField } from "../screens/UserSpaceMenu/userSettings";
import { MenuItem } from "./MenuItem";
import { colors } from "../styles/base";
import getStyles from "./MenuList.styles";

const styles = getStyles();

export interface IItem {
    id: string;
    value?: string | any;
    title: string;
    description?: string;
    placeholder?: string;
    iconStr?: string;
    iconEmoji?: string;
    iconColor?: string;
    hideLabel?: boolean;
    renderScreen: {
        routeNameIfNavigable?: string;
        fieldType?: 'text' | 'textArea' | 'dataPicker' | 'datePicker' | 'file' | 'onSubmit' | 'blockedsProfilesList';
        pickerConf?: {
            type: 'inline' | 'bottomSheet' | 'modal';
            layout?: {
                opening?: 'none' | 'input' | 'button' | 'link';
                dataList?: 'row' | 'column';
            }
        }
        data?: {
            optionsInputSelect?: any[];
            canMultipleSelect?: boolean;
        }
        onFieldChange?: (data: any, item?: IItem) => void;
        onFieldSubmit?: (data: any, item?: IItem) => void;
    }
}

export interface IMenuListProps {
    items: IItem[];
    navigation?: StackNavigationProp<any, any>;
    style?: any;
    renderHeader?: string;
    renderFooter?: () => any;
}

export function MenuList(props: IMenuListProps) {
    const {
        items,
        style,
        // lightColor,
        // darkColor,
        renderHeader,
        renderFooter,
        navigation
    } = props;

    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

    React.useEffect(() => {
        // See "Solution 2": https://stackoverflow.com/questions/67623952/error-virtualizedlists-should-never-be-nested-inside-plain-scrollviews-with-th
        LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
    }, []);

    const renderItem = ({ item: menuItem, separators }: { item: IItem, separators: any }) => {
        // If custom item:
        const renderField = getInputField(menuItem);

        if (!menuItem?.renderScreen?.routeNameIfNavigable) {
            return (
                <View style={styles.itemRowContainer}>
                    { renderField }
                </View>
            );
        }

        return (
            <TouchableHighlight
                key={menuItem.id}
                activeOpacity={0.8}
                underlayColor="#DDDDDD"
                onPress={() => {
                    if (navigation?.navigate && menuItem?.renderScreen?.routeNameIfNavigable) {
                        let params: any = {};
                        if (menuItem?.renderScreen) { params = menuItem; }

                        navigation.navigate(menuItem.renderScreen.routeNameIfNavigable, params);
                    }
                }}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}
            >
                <View style={styles.itemRowContainer}>
                    <MenuItem menuItem={menuItem} renderColumnValue={defaultRenderValue} />
                </View>
            </TouchableHighlight>
        );
    };

    const renderSeparator = () => <View style={{ height: 1, backgroundColor: colors.dark.border }} />;

    const listHeaderComponent = () => {
        if (!renderHeader) { return null; }

        return (
            <View style={[styles.itemRowContainer, { paddingBottom: 0 }]}>
                <Label style={styles.labelHeaderMenu}>{ renderHeader }</Label>
            </View>
        );
    };

    const listFooterComponent = () => {
        const footer = renderFooter && renderFooter();
        if (!footer) { return null; }

        return (
            <View style={styles.itemRowContainer}>
                { footer }
            </View>
        );
    };

    return <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(menuItem: any) => menuItem?.id}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        style={{ backgroundColor: '#fff', marginBottom: 16, ...style }}
        scrollEnabled={false}
    />;
}
