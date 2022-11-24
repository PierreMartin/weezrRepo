import createStyles, { colors } from "../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        itemRowContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 10
        },
        labelHeaderMenu: {
            fontSize: 17,
            marginBottom: 6
        }
    });
}

export default getStyles;
