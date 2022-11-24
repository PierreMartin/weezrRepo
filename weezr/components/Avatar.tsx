import React from 'react';
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { TouchableHighlight } from 'react-native';
import { Center, Text, Avatar as DefaultAvatar, Box } from 'native-base';
import { getUserForwardPhoto } from "../toolbox/toolbox";
import { IUser } from "../entities";
import getStyles from "./Avatar.styles";

const styles = getStyles();

export interface IAvatarProps {
    user: IUser;
    navigation?: StackNavigationProp<any, any>;
    style?: any;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    label?: string;
    routeNameNavigation?: string;
    displayDefaultAvatarIfNeeded?: boolean;
}

export function Avatar(props: IAvatarProps) {
    const { user, navigation, size, style, label, routeNameNavigation, displayDefaultAvatarIfNeeded } = props;
    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

    if (!(user?._id || user?.id)) {
        console.error('There is no user');
        return null;
    }

    const { uri, initial }: any = getUserForwardPhoto(user, 'size_130_130', displayDefaultAvatarIfNeeded);

    return <Center style={style || {}}>
        <TouchableHighlight
            activeOpacity={0.8}
            underlayColor="transparent"
            onPress={() => {
                if (navigation?.navigate && routeNameNavigation && user._id) {
                    navigation.navigate(routeNameNavigation, { userId: user._id });
                }
            }}
        >
            <Center>
                {
                    uri ? (
                        <DefaultAvatar
                            size={size || 'xl'}
                            source={{ uri }}
                        />
                    ) : (
                        <Box style={styles.initialContainer}>
                            <Text style={styles.initialText}>{initial}</Text>
                        </Box>
                    )
                }

                { label && (
                    <Text style={styles.secondaryText}>{label}</Text>
                ) }
            </Center>
        </TouchableHighlight>
    </Center>;
}
