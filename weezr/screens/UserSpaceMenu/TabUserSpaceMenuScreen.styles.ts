import createStyles, { colors } from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            paddingBottom: 22
        },
        headerContainer: {
            position: 'relative',
            height: 85,
            backgroundColor: colors.dark.background,
            marginBottom: 100
        }
    });
}

export default getStyles;
