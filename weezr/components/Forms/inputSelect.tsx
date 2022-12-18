import * as React from "react";
import { Box, CheckIcon, Select } from "native-base";
import { Label } from "../index";

interface IOption {
    label: string;
    value: any;
}

interface IInputSelect {
    fieldData: {
        id?: string;
        iconEmoji?: string; // label
        title?: string; // label
        value: any;
        placeholder?: string;
    };
    options: IOption[];
    width?: number;
    style?: any;
    onChange?: ((fieldValue: any, fieldData?: any) => void) | null;
}

// TODO rename PickerInputSelect
export const InputSelect = (props: IInputSelect) => {
    const { fieldData, options, onChange, style, width, ...otherProps } = props;
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

                <Select
                    selectedValue={value}
                    minWidth="200"
                    accessibilityLabel={title}
                    placeholder={title}
                    _selectedItem={{
                        bg: "teal.600",
                        endIcon: <CheckIcon size="5" />
                    }}
                    mt={1}
                    onValueChange={(fieldValue: string) => onChange && onChange(fieldValue, fieldData)}
                    {...defaultProps}
                    {...otherProps}
                >
                    {
                        options?.map((option, index) => {
                            return <Select.Item key={index} label={option.label} value={option.value} />;
                        })
                    }
                </Select>
            </Box>
        </Box>
    );
};
