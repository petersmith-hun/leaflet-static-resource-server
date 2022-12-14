import {AcceptorInfo, DownloadableFileWrapper} from "../../../../src/lsrs/core/model/file-browser-api";
import {FileInput, MIMEType} from "../../../../src/lsrs/core/model/file-input";
import {
    UploadedFileCreateAttributes,
    UploadedFileUpdateAttributes
} from "../../../../src/lsrs/core/model/uploaded-file";
import {uploadedFile1} from "../dao/uploaded-file-dao.testdata";

export const fileBuffer: Buffer = Buffer.alloc(10, "*");

export const fileInput: FileInput = {

    contentType: new MIMEType("image/png"),
    description: "test image",
    fileContentStream: fileBuffer,
    originalFilename: "Test Image.png",
    relativePath: "",
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
    children: ["sub1", "sub2", "sub2/sub4"],
    id: "image",
    root: "images"
}

export const acceptorInfo2: AcceptorInfo = {

    acceptableMimeTypes: ["application/octet-stream", "application/pdf"],
    children: ["sub3"],
    id: "other",
    root: "files"
}

export const downloadableFileWrapper: DownloadableFileWrapper = {
    originalFilename: uploadedFile1.originalFilename!,
    mimeType: uploadedFile1.acceptedAs,
    length: fileBuffer.length,
    fileContent: fileBuffer
}
