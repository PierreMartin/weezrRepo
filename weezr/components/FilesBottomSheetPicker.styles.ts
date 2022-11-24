/* eslint-disable @typescript-eslint/naming-convention */
import createStyles from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        bottomSheetModal_container: {
            flex: 1
        },
        bottomSheetModal_topActionsContainer: {

        },
        bottomSheetModal_bottomActionsContainer: {
            // flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: 25
        }
    });
}

export default getStyles;
