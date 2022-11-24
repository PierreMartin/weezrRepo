import * as React from 'react';
import { Box } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { IItem, MenuList } from "./MenuList";
import getStyles from "./MenuListGroup.styles";

const styles = getStyles();

export interface IItemGroup {
    config?: {
        renderHeader?: string;
        renderDescription?: string;
        isRequired?: boolean;
    };
    style?: any;
    items: IItem[];
}

interface IMenuListGroup {
    itemsGroup: IItemGroup[];
    navigation?: StackNavigationProp<any, any>;
    parentMenuItem?: IItem;
    renderHeader?: () => any;
}

export function MenuListGroup({
    itemsGroup,
    navigation,
    parentMenuItem,
    renderHeader
}: IMenuListGroup) {
    React.useLayoutEffect(() => {
        let renderHeaderNode = {};
        if (renderHeader) { renderHeaderNode = renderHeader(); }

        if (navigation?.setOptions) {
            navigation.setOptions({
                title: `${parentMenuItem?.iconEmoji || ''} ${parentMenuItem?.title}`,
                ...renderHeaderNode
            });
        }
    }, []);

    return (
        <Box style={styles.main}>
            {
                itemsGroup?.map((itemGroup: IItemGroup, index: number) => {
                    const props: any = {};
                    const config = itemGroup?.config;
                    if (config?.renderHeader) { props.renderHeader = config.renderHeader; }

                    return (
                        <MenuList
                            key={index}
                            items={itemGroup?.items as IItem[]}
                            navigation={navigation}
                            style={(itemsGroup?.length > 1 && index === 0) ? { marginTop: 16 } : {}}
                            {...props}
                        />
                    );
                })
            }
        </Box>
    );
}
