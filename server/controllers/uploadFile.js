import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";
import multer from "multer";
import { v4 as uuid } from 'uuid';
import s3Storage from 'multer-sharp-s3';
import { assertAuthenticated } from "./authorizationMiddleware";
import path from "path";

// Multer is a Node.js middleware for handling, multipart/form-data which is primarily used for uploading files
// Multer-s3 handle the multipart uploading to s3 without saving on local disk

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'app-dating';
const BUCKET_REGION = process.env.AWS_BUCKET_REGION || 'eu-west-3';
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3AllFiles = new S3Client({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: BUCKET_REGION
});

const s3PhotoOnly = new AWS.S3();

AWS.config.update({
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    accessKeyId: ACCESS_KEY_ID
});

/*
s3AllFiles.listBuckets(function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});
*/

console.log('AWS S3 - BUCKET_NAME =====> ', BUCKET_NAME);

let newFileId = null;

const isFileValid = (filetypes, { fileNameParam, mimetypeParam, checkOnlyExtension, extension }) => {
    let isValide = false;
    let extname;
    let mimetype;

    if (checkOnlyExtension) {
        if (!extension || typeof extension !== 'string') { return false; }
        return filetypes.test(extension?.toLowerCase());
    }

    if (fileNameParam && mimetypeParam) {
        extname = filetypes.test(path.extname(fileNameParam)?.toLowerCase());
        mimetype = filetypes.test(mimetypeParam);

        if (mimetype || extname) {
            isValide = true;
        }
    }

    return isValide;
};

const getSizes = (params) => {
    // If mono size:
    let sizesFiles = [
        { suffix: 'default', width: 320, height: 400 }
    ];

    // if multiple sizes:
    if (params.ismultiplesize === 'true') {
        sizesFiles = [
            { suffix: 'size_40_40', width: 40, height: 40 },
            { suffix: 'size_130_130', width: 130, height: 130 },
            { suffix: 'size_320_400', width: 320, height: 400 }
        ];
    }

    return sizesFiles;
}

/*
// 1) We send file in cloud:
const upload = multer({
    limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
    fileFilter(req, file, cb) {
        const isValide = isFileValid(/jpeg|jpg|png|bmp|gif/, { fileNameParam: file.originalname, mimetypeParam: file.mimetype });
        if (isValide) {
            return cb(null, true);
        } else {
            cb("Error: Allow images only of extensions jpeg|jpg|png|bmp|gif !");
        }
    },
    storage: multerS3({
        s3: s3AllFiles,
        acl: 'public-read',
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        // id: 'size_320_400',
        shouldTransform: (req, file, cb) => {
            cb(null, /^image/i.test(file.mimetype));
        },
        key: function (req, file, cb) {
            // Here we set the file in storage:
            const { entityname, entityid, foldername: folderNameParam } = req.params || {};
            let subFolderName = entityid;

            if (subFolderName === 'notEntityId') {
                switch (entityname) {
                    case 'user':
                        subFolderName = 'unknown-user-id';
                        break;
                    case 'thread':
                        subFolderName = 'unknown-thread-id';
                        break;
                    default:
                        subFolderName = 'unknown-entity-id';
                        break;
                }
            }

            // Get file extension:
            const originalNameArr = file?.originalname?.split('.') || [];
            const mimeTypeArr = file?.mimetype?.split('/') || [];
            let extension = originalNameArr[originalNameArr?.length - 1] || mimeTypeArr[mimeTypeArr?.length - 1] || null;

            // Check if file extension valid:
            const isValide = isFileValid(/jpeg|jpg|png|bmp|gif/, { checkOnlyExtension: true, extension });
            if (!isValide) { extension = 'jpg'; }

            // Set file name:
            newFileId = uuid();
            const fileName = `${newFileId}.${extension?.toLowerCase()}`;
            const folderName = folderNameParam !== 'notFolderName' ? folderNameParam : entityname;
            const path = `${folderName}/${subFolderName}/${fileName}`;

            cb(null, path);
        }
    })
});
*/

const generatePathFile = (req, file) => {
    // Here we set the file in storage:
    const {
        filetype,
        entityname,
        entityid,
        foldername: folderNameParam
    } = req.params || {};

    let subFolderName = entityid;

    if (subFolderName === 'notEntityId') {
        switch (entityname) {
            case 'user':
                subFolderName = 'unknown-user-id';
                break;
            case 'threadMessage':
                subFolderName = 'unknown-threadmessage-id';
                break;
            default:
                subFolderName = 'unknown-entity-id';
                break;
        }
    }

    // Get file extension:
    const originalNameArr = file?.originalname?.split('.') || [];
    const mimeTypeArr = file?.mimetype?.split('/') || [];
    let extension = null;

    if (originalNameArr?.length > 1) {
        extension = originalNameArr?.at(-1);
    } else if (mimeTypeArr?.at(-1)) {
        extension = mimeTypeArr?.at(-1);
    }

    extension = extension?.split('-')?.at(-1);

    // Check if file extension valid:
    let isValide = true;
    switch (filetype) {
        case 'image':
            isValide = isFileValid(/jpeg|jpg|png|bmp|gif/, { checkOnlyExtension: true, extension });
            if (!isValide) { extension = 'jpg'; }
            break;
        case 'audio':
            isValide = isFileValid(/m4a|x-m4a|aac|mp3|mp4|aif|aiff|au|wave/, { checkOnlyExtension: true, extension });
            if (!isValide) { extension = 'm4a'; }
            break;
        default:
            break;
    }

    // Set file name:
    newFileId = uuid();
    extension = extension?.toLowerCase();

    const fileName = `${newFileId}.${extension}`;
    const folderName = folderNameParam !== 'notFolderName' ? folderNameParam : entityname;

    let path = null;
    switch (filetype) {
        case 'image':
            path = `${folderName}/${subFolderName}/${fileName}`;
            break;
        case 'audio':
            path = `${folderName}/${subFolderName}/voiceMessages/${fileName}`;
            break;
        default:
            break;
    }

    // console.log('file => ', file);
    // console.log('path ===> ', path);

    return path;
}

// 1) We send file in cloud - Uploading single file to aws s3 bucket
export const uploadFileMulter = (req, res, next) => {
    const {
        filetype,
        ismultiplesize,
        ismultipleselect
    } = req.params || {};

    const sizesFiles = getSizes(req.params);
    let storage = () => null;

    switch (filetype) {
        case 'image':
            storage = s3Storage({
                Key: (req, file, cb) => {
                    const path = generatePathFile(req, file);
                    cb(null, path);
                },
                s3: s3PhotoOnly,
                Bucket: BUCKET_NAME,
                ACL: 'public-read',
                /*
                Metadata: function (req, file, cb) {
                    cb(null, { fieldName: file.fieldname });
                },
                */
                multiple: ismultiplesize === 'true',
                resize: ismultiplesize === 'true' ? sizesFiles : { ...sizesFiles[0] }
            });
            break;
        case 'audio':
            storage = multerS3({
                s3: s3AllFiles,
                acl: 'public-read',
                bucket: BUCKET_NAME,
                metadata: function (req, file, cb) {
                    cb(null, { fieldName: file.fieldname });
                },
                // id: 'size_320_400',
                /*
                shouldTransform: (req, file, cb) => {
                    cb(null, /^image/i.test(file.mimetype));
                },
                */
                key: function (req, file, cb) {
                    const path = generatePathFile(req, file);
                    cb(null, path);
                }
            });
            break;
        default:
            break;
    }

    // 1) We send file in cloud:
    const upload = multer({
        limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
        fileFilter(req, file, cb) {
            let isValide = false;

            switch (filetype) {
                case 'image':
                    isValide = isFileValid(/jpeg|jpg|png|bmp|gif/, { fileNameParam: file.originalname, mimetypeParam: file.mimetype });
                    break;
                case 'audio':
                    isValide = isFileValid(/m4a|x-m4a|aac|mp3|mp4|aif|aiff|au|wave/, { fileNameParam: file.originalname, mimetypeParam: file.mimetype });
                    break;
                default:
                    break;
            }

            if (isValide) {
                return cb(null, true);
            } else {
                return cb(null, false);
                // cb("Error: Allow images only of extensions jpeg|jpg|png|bmp|gif !"); // String in first param is only for web
            }
        },
        storage
    });

    if (ismultipleselect === 'true') {
        return upload.array('file')(req, res, next);
    }

    return upload.single('file')(req, res, next);
};

// TODO voir comment delete un fichier
export const deleteFileMulter = (req, res, next) => {
    const upload = multer({
        storage: s3Storage({
            Key: (req, file, cb) => {
                // Here we set the file in storage:
                const { entityname, entityid, foldername: folderNameParam } = req.params || {};
                let subFolderName = entityid;

                // Set file name:
                const fileName = `xxx`;
                const folderName = folderNameParam !== 'notFolderName' ? folderNameParam : entityname;
                const path = `${folderName}/${subFolderName}/${fileName}`;

                cb(null, path);
            },
            s3: s3AllFiles,
            Bucket: BUCKET_NAME,
            ACL: 'public-read'
        })
    });

    return upload.single('file')(req, res, next);
};

/**
 * POST /api/upload_file/:filetype/:entityname/:entityid
 * 2) File uploaded done, now we provide urls (strings) of the images stored in the cloud:
 */
export function uploadFile(req, res, next) {
    assertAuthenticated(req, res, next, 'uploadFile', (userRes) => {
        const file = req.file; // 'file' provided from multer
        // const { entityname, entityid } = req.params || {};
        // const { ... } = req.body || {}; // All is stringified here !!

        if (!file) {
            return res.status(500).json({ message: 'A error has occurred at the updating file - Allow images only of extensions jpeg|jpg|png|bmp|gif !' });
        }

        const filesUrls = {};

        if (file.location) {
            // Is mono file:
            filesUrls.url = file.location;
        } else {
            // Is multiple file size:
            const sizesFiles = getSizes(req.params);

            for (let i = 0; i < sizesFiles?.length; i++) {
                const val = sizesFiles[i];
                const key = val?.suffix;

                if (key && file && file[key] && file[key].Location) {
                    filesUrls[key] = file[key].Location;
                }
            }
        }

        const data = {
            filesUrls,
            fileId: newFileId,
            provider: 'local'
        };

        return res.status(200).json({
            message: 'File uploaded successfully',
            data
        });
    });
}

/**
 * POST /api/delete_file/:filetype/:entityname/:entityid
 */
export function deleteFile(req, res, next) {
    assertAuthenticated(req, res, next, 'deleteFile', (userRes) => {
        const { selectedFileId } = req.body || {}; // All is stringified here !!

        return res.status(200).json({
            message: 'File deleted successfully',
            data: {
                deletedFileId: selectedFileId
            }
        });
    });
}

