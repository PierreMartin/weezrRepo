import createStyles from "../../styles/base";
import colors from "../../styles/colors";

function getStyles() {
    return createStyles({
        // Group of items:
        itemsContainer: {
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
        },

        // One item:
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 80,
            width: 80,
            margin: 8,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: colors.text.main,
            borderRadius: 8
        },

        // Infos or errors:
        messagesContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8
        }
    });
}

export default getStyles;
