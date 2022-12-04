import {UploadedFileCreateAttributes, UploadedFileDescriptor} from "../../../../src/lsrs/core/model/uploaded-file";

export const uploadedFile1: UploadedFileDescriptor = {
    acceptedAs: "image/jpeg",
    createdAt: new Date("2022-12-02T15:00:00Z"),
    description: "Uploaded file #1",
    enabled: true,
    id: 1,
    updatedAt: null,
    originalFilename: "original_filename_1.jpg",
    path: "images/stored_filename_1.jpg",
    pathUUID: "d4b1830d-f368-37a0-88f9-2faf7fa8ded6",
    storedFilename: "stored_filename_1.jpg"
};

export const uploadedFile2: UploadedFileDescriptor = {
    acceptedAs: "image/png",
    createdAt: new Date("2022-12-02T16:00:00Z"),
    description: "Uploaded file #2",
    enabled: true,
    id: 2,
    updatedAt: new Date("2022-12-02T16:30:00Z"),
    originalFilename: "original_filename_2.png",
    path: "images/stored_filename_2.png",
    pathUUID: "a167450b-e162-309d-bac4-fb5149d10512",
    storedFilename: "stored_filename_2.png"
};

export const uploadedFile3: UploadedFileDescriptor = {
    acceptedAs: "image/jpeg",
    createdAt: new Date("2022-12-02T17:00:00Z"),
    description: "Uploaded file #3",
    enabled: false,
    id: 3,
    updatedAt: null,
    originalFilename: "original_filename_3.jpg",
    path: "images/stored_filename_3.jpg",
    pathUUID: "058c9d47-6ce4-3e48-9c44-35bb9c74b378",
    storedFilename: "stored_filename_3.jpg"
};

export const newUploadedFile: UploadedFileCreateAttributes = {
    acceptedAs: "image/gif",
    description: "Uploaded file new",
    originalFilename: "original_filename_new.jpg",
    path: "images/stored_filename_new.jpg",
    pathUUID: "fa245fcc-a6fb-4b9a-bacd-932d1f13a49d",
    storedFilename: "stored_filename_new.jpg"
};
