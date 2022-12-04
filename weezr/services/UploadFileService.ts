import { AsyncStorage } from "react-native";
import { localClient } from './index';

export interface IUploadFile {
    fileObj: {
        uri: string;
        name: string;
        type?: string;
    };
    fileType: 'image' | 'audio';
    entityName: 'user' | 'threadMessage' | 'notEntityName';
    entityId: string | undefined;
    folderName?: string;
    isMultipleSize?: boolean;
    isMultipleSelect?: boolean;
}

export function uploadFile({
    fileObj,
    fileType = 'image',
    entityName = 'notEntityName',
    entityId = 'notEntityId',
    folderName = 'notFolderName',
    isMultipleSize: isMultipleSizeParam,
    isMultipleSelect: isMultipleSelectParam
}: IUploadFile) {
    let messageError = null;

    switch (fileType) {
        case 'image':
            if (!fileObj?.type?.includes('image')) { messageError = 'Wrong format image'; }
            break;
        case 'audio':
            // if (!fileObj?.type?.includes('mp3')) { messageError = 'Wrong format audio'; }
            break;
        default:
            break;
    }

    if (messageError) {
        return Promise.reject(messageError);
    }

    if (fileObj?.uri) {
        console.log('fileObj ', fileObj);

        // 1) resize images with multer-sharp-s3 + replicate image in different sizes
        // 2) Store image on AWS

        const formFileData = new FormData();
        /*
        const fileObj = {
            // uri: Platform.OS === 'ios' ? `file:///${photoBlob.path}` : photoBlob.path,
            uri: photoBlob.path,
            type: photoBlob.mime,
            name: photoBlob.filename || `${Date.now()}.jpg`
        };
        */

        // @ts-ignore
        formFileData.append('file', fileObj, fileObj.name);

        /*
        // formFileData.append('userId', entityId);

        // If update:
        if (selectedFileId) {
            formFileData.append('selectedFileId', selectedFileId);
        }
        */

        const isMultipleSize: string = isMultipleSizeParam ? 'true' : 'false';
        const isMultipleSelect: string = isMultipleSelectParam ? 'true' : 'false';

        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                return localClient.request({
                    method: 'POST',
                    url: `upload_file/${fileType}/${entityName}/${entityId}/${folderName}/${isMultipleSize}/${isMultipleSelect}`,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    data: formFileData || {}
                })
                    .then((res: any) => Promise.resolve(res?.data))
                    .catch((err: any) => Promise.reject(err?.response?.data));
            }

            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('no token');
        });
    }

    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('No file');
}

export function deleteFile({
    fileType = 'image',
    entityName,
    entityId,
    selectedFileId
}: any) {
    const data = { selectedFileId };

    return AsyncStorage.getItem('jwt').then((token: string | null) => {
        if (token) {
            return localClient.request({
                method: 'POST',
                url: `delete_file/${fileType}/${entityName || ''}/${entityId || ''}`,
                headers: {
                    // 'Content-Type': 'multipart/form-data',
                    // Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                data: data || {}
            })
                .then((res: any) => Promise.resolve(res?.data))
                .catch((err: any) => Promise.reject(err?.response?.data));
        }

        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('no token');
    });
}
