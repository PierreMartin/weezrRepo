import createStyles, { colors } from "../styles/base";

const border = {
    borderBottomColor: colors.dark.secondaryText,
    borderBottomWidth: 1
};

function getStyles(params: any = {}) {
    return createStyles({
        itemFullContainer: {
            ...border,
            paddingVertical: 8
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        iconContainer: {
            marginRight: 12,
        },
        textContainer: {
            ...border,
            flex: 1,
            paddingVertical: 4
        },
        basicText: {
            color: '#fff'
        },
        bubble: {
            borderColor: 'yellow',
            borderWidth: 1,
            borderRadius: 9,
            marginHorizontal: 5,
            paddingHorizontal: 9
        }
    });
}

export default getStyles;
