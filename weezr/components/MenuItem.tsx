// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from "react";
import { Text } from "native-base";
import { IItem } from "./MenuList";
import { defaultRenderValueInMenu } from "../screens/UserSpaceMenu/userSettings";
import { Label, View } from "./index";
import getStyles from "./MenuItem.styles";

const styles = getStyles();

interface IMenuItem {
    menuItem: IItem;
}

export const MenuItem = (props: IMenuItem) => {
    const {
        menuItem
    } = props;

    const renderValueInMenu = (item: IItem) => {
        if (item.renderValueInMenu) {
            return item.renderValueInMenu();
        }

        return defaultRenderValueInMenu(item);
    };

    return (
        <>
            <View style={styles.itemColumnContainer}>
                <Text style={styles.itemIcon}>
                    {menuItem.iconEmoji}
                    {/* <Ionicons size={24} name={menuItem.iconStr} /> */}
                </Text>
            </View>

            <View style={[styles.itemColumnContainer, { flex: 1 }]}>
                <Label style={styles.itemLabel}>{menuItem.title}</Label>
                { menuItem.description && <Text style={styles.secondaryText}>{menuItem.description}</Text> }
            </View>

            {
                (renderValueInMenu && renderValueInMenu(menuItem)?.length > 0) && (
                    <View style={[styles.itemColumnContainer, { paddingBottom: 5 }]}>
                        <Text style={styles.secondaryText}>
                            { renderValueInMenu(menuItem) }
                        </Text>
                    </View>
                )
            }

            <View style={[styles.itemColumnContainer, { marginRight: 0 }]}>
                <Text style={styles.secondaryText}>
                    <Ionicons size={24} name="chevron-forward-outline" />
                </Text>
            </View>
        </>
    );
};
