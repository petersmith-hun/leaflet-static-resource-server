import {AcceptorInfo} from "../../../../src/lsrs/core/model/file-browser-api";
import {FileInput, MIMEType} from "../../../../src/lsrs/core/model/file-input";
import {
    UploadedFileCreateAttributes,
    UploadedFileUpdateAttributes
} from "../../../../src/lsrs/core/model/uploaded-file";

export const fileBuffer: Buffer = Buffer.alloc(10, "*");

export const fileInput: FileInput = {

    contentType: new MIMEType("image/png"),
    description: "test image",
    fileContentStream: fileBuffer.buffer,
    originalFilename: "Test Image.png",
    relativePath: "/images/test_image.png",
    size: 10
};

export const uploadedFileCreateAttributes: UploadedFileCreateAttributes = {

    acceptedAs: "image",
    description: "test image",
    originalFilename: "Test Image.png",
    path: "/images/test_image.png",
    pathUUID: "14b5780c-9ec7-4c59-b3a5-a3c9cd56a6d5",
    storedFilename: "test_image.png"
};

export const uploadedFileUpdateAttributes: UploadedFileUpdateAttributes = {

    originalFilename: "new original filename.png",
    description: "new description"
};

export const acceptorInfo1: AcceptorInfo = {

    acceptableMimeTypes: ["image/*"],
    childrenDirectories: ["sub1", "sub2", "sub2/sub4"],
    id: "image",
    rootDirectoryName: "images"
}

export const acceptorInfo2: AcceptorInfo = {

    acceptableMimeTypes: ["application/octet-stream", "application/pdf"],
    childrenDirectories: ["sub3"],
    id: "other",
    rootDirectoryName: "files"
}
