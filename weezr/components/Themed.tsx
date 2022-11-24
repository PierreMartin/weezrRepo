import { ColorSchemeName, useColorScheme } from 'react-native';
import { colors } from "../styles/base";

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof colors.light & keyof typeof colors.dark
) {
    const theme = useColorScheme() as NonNullable<ColorSchemeName>;
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    }

    return colors[theme][colorName];
}
