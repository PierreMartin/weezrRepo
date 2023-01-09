import React from 'react';
import {
    TouchableOpacity,
    Text as DefaultText,
    View as DefaultView
} from 'react-native';
import { Heading } from 'native-base';
import { useThemeColor } from "./Themed";

type ThemeProps = {
    lightColor?: string;
    darkColor?: string;
};

export type TextProps = ThemeProps & { style?: any, children?: any };
export type ViewProps = ThemeProps & { style?: any, children?: any };
export type HeaderProps = ThemeProps & { style?: any, children?: any };
export type LabelProps = ThemeProps & { style?: any, children?: any, isRequired?: boolean };
export type LinkProps = ThemeProps & { style?: any, children?: any, navigate: () => any };
export type InputSearchProps = ThemeProps & { style?: any, children?: any, placeholder?: string, onChangeText?: (value: string) => void, width?: any };

export function View(props: ViewProps) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const defaultStyles = {
        padding: 0,
        margin: 0
    };

    return <DefaultView style={[defaultStyles, style]} {...otherProps} />;
}

export function Header(props: HeaderProps) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const defaultStyles = {
        fontSize: 21,
        fontWeight: 'bold',
        paddingVertical: 12,
        // backgroundColor
    };

    return (
        <Heading style={[defaultStyles, style]} {...otherProps} />
    );
}

export function Text(props: TextProps) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const defaultStyles = {
        fontSize: 14,
        color
        // color: theme.colors.primary
    };

    return <DefaultText style={[defaultStyles, style]} {...otherProps} />;
}

export function Label(props: LabelProps) {
    const { style, lightColor, darkColor, isRequired, ...otherProps } = props;
    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const defaultStyles = {
        fontSize: 13,
        // lineHeight: 12,
        fontWeight: 'bold',
        color: 'black'
    };

    return (
        <DefaultText style={{ flexDirection: 'row' }}>
            <DefaultText style={[defaultStyles, style]} {...otherProps} />
            { isRequired && <DefaultText style={{ color: 'red' }}> *</DefaultText> }
        </DefaultText>
    );
}

export function Link(props: LinkProps) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const defaultStyles = {
        fontWeight: 'bold'
    };

    return (
        <TouchableOpacity onPress={() => props.navigate()}>
            <DefaultText style={[defaultStyles, style]} {...otherProps}>
                { props.children }
            </DefaultText>
        </TouchableOpacity>
    );
}
