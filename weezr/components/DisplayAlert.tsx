import { Alert } from "react-native";

interface IDisplayAlert {
    title?: string;
    message?: string;
    confirmOk?: string;
    confirmCancel?: string;
}

export const displayAlert = ({
    title = '',
    message = '',
    confirmOk,
    confirmCancel
}: IDisplayAlert): Promise<boolean> => {
    return new Promise((resolve) => {
        const buttons: any[] = [
            {
                text: confirmOk || 'To confirm',
                onPress: () => resolve(true)
            }
        ];

        if (confirmCancel) {
            buttons.push({
                text: confirmCancel || 'Cancel',
                style: "cancel",
                onPress: () => resolve(false)
            });
        }

        Alert.alert(
            title,
            message,
            buttons
        );
    });
};
