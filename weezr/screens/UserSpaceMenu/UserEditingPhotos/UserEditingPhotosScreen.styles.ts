import createStyles, { colors } from "../../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        itemContainer: {
            // flex: 1,
            // flexGrow: 1,
            // justifyContent: 'center',
            ...params.borderRadiusCells,
            borderWidth: 1,
            marginLeft: params.marginSizeCells,
            marginBottom: params.marginSizeCells
        },
        itemContainerForAdd: {
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center'
        }
    });
}

export default getStyles;
