// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from "react";
import { Box, Icon, Input } from "native-base";
import { Label } from "./index";

interface IInputSearch {
    fieldData: {
        id?: string;
        iconEmoji?: string; // label
        title?: string; // label
        value?: any;
        placeholder?: string;
    };
    width?: number;
    style?: any;
    onChange?: ((fieldValue: string, fieldData?: any) => void) | null;
}

export const InputSearch = (props: IInputSearch) => {
    const { fieldData, onChange, style, width, ...otherProps } = props;
    const { iconEmoji, title, value, placeholder } = fieldData;

    const defaultProps: any = {
        width: width || '100%',
        placeholder: placeholder || 'Search',
        background: '#dcdcdc',
        borderRadius: 10,
        borderWidth: 0,
        py: 1,
        px: 2
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
                    InputLeftElement={<Icon ml="2" size="4" color="gray.400" as={<Ionicons name="ios-search" />} />}
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
