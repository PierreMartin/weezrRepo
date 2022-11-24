import createStyles, { colors } from "../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        itemColumnContainer: {
            marginRight: 10
        },
        itemIcon: {
            // width: 40,
            // height: 40,
            paddingTop: 0,
            fontSize: 18
        },
        itemLabel: {
            // marginBottom: 0
        },
        secondaryText: {
            fontSize: 12,
            color: colors.dark.secondaryText
        }
    });
}

export default getStyles;
