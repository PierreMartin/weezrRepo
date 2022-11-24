/* eslint-disable @typescript-eslint/naming-convention */
import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        actionsContainer: {
            flexDirection: 'row',
            padding: 6
        },
        actionsItem: {
            marginHorizontal: 9
        }
    });
}

export default getStyles;
