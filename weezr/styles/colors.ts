const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

/* TODO refacto dark mode
const colors = {
    primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },
    secondary: {...}
    ...
};
*/

const colors = {
    primary: '#ff0055',
    secondary: '#254B5A',
    tertiary: '#5DA6A7',

    bg: {
        main: '#1a1b20',
        variant1: '#2c2d32',
        variant2: '#18191d',
    },

    text: {
        main: '#b4b4b4'
    },

    textShadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1
    },

    light: {
        text: '#000',
        background: '#fff',
        tint: tintColorLight,
        inactiveTint: 'gray',
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorLight,
        secondaryText: 'gray',
        border: '#d9d9d9',
        backgroundOpacity: 'rgba(52, 52, 52, 0.8)',
    },
    dark: {
        text: '#fff',
        background: '#000',
        tint: tintColorDark,
        inactiveTint: 'gray',
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorDark,
        secondaryText: 'gray',
        border: '#d9d9d9',
        backgroundOpacity: 'rgba(52, 52, 52, 0.8)',
    }
};

export default colors;
