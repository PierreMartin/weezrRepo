import createStyles, { colors } from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        button: {
            // marginBottom: 8
        }
    });
}

export default getStyles;
