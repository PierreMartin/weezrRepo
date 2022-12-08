/* eslint-disable @typescript-eslint/naming-convention */
import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        actionsContainer: {
            flexDirection: 'row',
            paddingHorizontal: 6
        },
        actionsButtonsGroup: {
            flex: 1,
            flexDirection: 'row',
            marginBottom: 1
        },
        actionItem: {
            marginHorizontal: 5
        },
        actionChevron: {
            position: 'absolute',
            bottom: 1,
            left: 4
        }
    });
}

export default getStyles;
