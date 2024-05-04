import { UploadedFileUpdateAttributes } from "@app/core/model/uploaded-file";
import {
    BrowseRequest,
    DirectoryCreationRequestModel,
    DirectoryModel,
    FileIdentifier,
    FileModel,
    FileUploadRequestModel,
    InputFile,
    UpdateFileMetadataRequestModel,
    VFSBrowserModel
} from "@app/web/model/files";
import { fileBuffer, fileInput } from "@testdata/service";
import { Request } from "express";

export const fileModel1: FileModel = {
    acceptedAs: "image/jpeg",
    description: "Uploaded file #1",
    originalFilename: "original_filename_1.jpg",
    path: "images/stored_filename_1.jpg",
    reference: "/d4b1830d-f368-37a0-88f9-2faf7fa8ded6/stored_filename_1.jpg",
    pathUUID: "d4b1830d-f368-37a0-88f9-2faf7fa8ded6"
};

export const fileModel2: FileModel = {
    acceptedAs: "image/png",
    description: "Uploaded file #2",
    originalFilename: "original_filename_2.png",
    path: "images/stored_filename_2.png",
    reference: "/a167450b-e162-309d-bac4-fb5149d10512/stored_filename_2.png",
    pathUUID: "a167450b-e162-309d-bac4-fb5149d10512"
};

export const fileIdentifier: FileIdentifier = new FileIdentifier({
    params: {
        pathUUID: "d4b1830d-f368-37a0-88f9-2faf7fa8ded6"
    }
} as unknown as Request);

export const fileIdentifierInvalid: FileIdentifier = new FileIdentifier({
    params: {
        pathUUID: "invalid-path-uuid"
    }
} as unknown as Request);

export const directoryModel1: DirectoryModel = {

    acceptableMimeTypes: ["image/*"],
    children: ["sub1", "sub2", "sub2/sub4"],
    id: "image",
    root: "images"
}

export const directoryModel2: DirectoryModel = {

    acceptableMimeTypes: ["application/octet-stream", "application/pdf"],
    children: ["sub3"],
    id: "other",
    root: "files"
}

export const fileUploadRequestModel: FileUploadRequestModel = new FileUploadRequestModel({
    body: {
        inputFile: {
            content: fileBuffer,
            originalFilename: fileInput.originalFilename,
            mimetype: fileInput.contentType.toString(),
            size: fileInput.size
        } as InputFile,
        subFolder: "",
        description: "test image"
    }
} as unknown as Request);

export const fileUploadRequestModelInvalid: FileUploadRequestModel = new FileUploadRequestModel({
    body: {
        subFolder: "sub1",
        description: "Uploaded file #1"
    }
} as unknown as Request);

export const directoryCreationRequestModel: DirectoryCreationRequestModel = new DirectoryCreationRequestModel({
    body: {
        parent: "parent_dir",
        name: "new_dir"
    }
} as unknown as Request);

export const directoryCreationRequestModelInvalid: DirectoryCreationRequestModel = new DirectoryCreationRequestModel({
    body: {
        name: "new_dir"
    }
} as unknown as Request);

export const updateFileMetadataRequestModel: UpdateFileMetadataRequestModel = new UpdateFileMetadataRequestModel({
    params: {
        pathUUID: "d4b1830d-f368-37a0-88f9-2faf7fa8ded6"
    },
    body: {
        originalFilename: "new_original_filename.jpg",
        description: "updated description"
    }
} as unknown as Request);

export const updateFileMetadataRequestModelInvalid: UpdateFileMetadataRequestModel = new UpdateFileMetadataRequestModel({
    params: {},
    body: {
        description: "updated description"
    }
} as unknown as Request);

export const uploadedFileUpdateAttributes: UploadedFileUpdateAttributes = {
    originalFilename: "new_original_filename.jpg",
    description: "updated description"
};

export const browseRequestRoot: BrowseRequest = new BrowseRequest({
    params: {}
} as unknown as Request);

export const browseRequestImages: BrowseRequest = new BrowseRequest({
    params: {
        path: "images"
    }
} as unknown as Request);

export const browseRequestImagesSub1: BrowseRequest = new BrowseRequest({
    params: {
        path: "images/sub1"
    }
} as unknown as Request);

export const browseRequestImagesDeepSub: BrowseRequest = new BrowseRequest({
    params: {
        path: "images/sub1/deep1"
    }
} as unknown as Request);

export const vfsBrowserModel: VFSBrowserModel = {

    parent: "/",
    currentPath: "/images",
    directories: [
        { folderName: "sub1", absolutePath: "/images/sub1" },
        { folderName: "sub2", absolutePath: "/images/sub2" }
    ],
    files: [
        fileModel1,
        fileModel2
    ]
}
