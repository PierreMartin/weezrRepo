import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle, StatusBar } from 'react-native';
import colors from './colors';

type NamedStyles = { [key: string]: ViewStyle | TextStyle | ImageStyle };

const dimensions = {
    fullHeight: Dimensions.get('window').height,
    fullWidth: Dimensions.get('window').width
};

const padding = {
    sm: 10,
    md: 20,
    lg: 30,
    xl: 40
};

const fonts = {
    sm: 12,
    md: 18,
    lg: 28,
    primary: 'Cochin'
};

/* NOTE: good practice example:
    itemContainer: {...},
    itemTitle: {...},
    itemDescription: {...},

    iconContainer: {...},
    iconTitle: {...},
    iconDescription: {...}
*/

const baseStyles = {
    main: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0
    },
    container: {
        paddingHorizontal: 10
    },
    header: {
        //
    },
    section: {
        //
    },
    basicText: {
        color: '#fff'
    },
    secondaryText: {
        fontSize: 12,
        color: colors.dark.secondaryText
    }
} as NamedStyles;

export { colors, padding, fonts, dimensions, StatusBar };

export default function createStyles(overrides: NamedStyles = {}) {
    const mergedOverrides: NamedStyles = {};

    for (const key in baseStyles) {
        if (baseStyles.hasOwnProperty(key) && overrides[key]) {
            mergedOverrides[key] = {
                ...baseStyles[key],
                ...overrides[key]
            };
        }
    }

    return StyleSheet.create({
        ...baseStyles,
        ...overrides,
        ...mergedOverrides
    } as NamedStyles);
}
