import * as React from "react";
import { Box, Input } from "native-base";
import { Label } from "./index";

interface IInputText {
    fieldData: {
        id?: string;
        iconEmoji?: string; // label
        title?: string; // label
        value: any;
        placeholder?: string;
    };
    width?: number;
    style?: any;
    onChange?: ((fieldValue: string, fieldData?: any) => void) | null;
}

export const InputText = (props: IInputText) => {
    const { fieldData, onChange, style, width, ...otherProps } = props;
    const { iconEmoji, title, value, placeholder } = fieldData;

    const defaultProps: any = {
        width: width || '100%',
        placeholder: placeholder || ''
    };

    const defaultStyles: any = {
        fieldContainer: {
            flexDirection: 'row'
        }
    };

    return (
        <Box style={defaultStyles.fieldContainer}>
            <Box style={{ display: 'flex' }} w="100%">
                { (iconEmoji || title) && (<Label>{`${iconEmoji || ''} ${title || ''}`}</Label>) }

                <Input
                    type="text"
                    mt={1}
                    placeholder={title}
                    onChangeText={(fieldValue: string) => onChange && onChange(fieldValue, fieldData)}
                    value={value}
                    {...defaultProps}
                    {...otherProps}
                />
            </Box>
        </Box>
    );
};
