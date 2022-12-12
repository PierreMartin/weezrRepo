import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        // For swipe:
        backRightBtn: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 75, // Same negative value of prop "rightOpenValue"
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'red'
        }
    });
}

export default getStyles;
