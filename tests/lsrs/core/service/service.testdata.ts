import { AcceptorInfo, DownloadableFileWrapper, VFSContent, VFSPath } from "@app/core/model/file-browser-api";
import { FileInput, MIMEType } from "@app/core/model/file-input";
import {
    UploadedFileCreateAttributes,
    UploadedFileDescriptor,
    UploadedFileUpdateAttributes
} from "@app/core/model/uploaded-file";
import { uploadedFile1, uploadedFile2 } from "@testdata/dao";
import fs from "fs";
import { createFsFromVolume, IFs, vol } from "memfs";
import sinon, { SinonStub } from "sinon";

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

export const vfsContent: VFSContent = {

    parent: "/",
    currentPath: "/images",
    directories: [
        { folderName: "sub1", absolutePath: "/images/sub1" },
        { folderName: "sub2", absolutePath: "/images/sub2" }
    ],
    uploadedFiles: [
        uploadedFile1,
        uploadedFile2
    ]
}

export const vfsPathRoot: VFSPath = new VFSPath([]);
export const vfsPathImages: VFSPath = new VFSPath(["images"]);
export const vfsPathImagesSub1: VFSPath = new VFSPath(["images", "sub1"]);
export const vfsPathImagesSub2: VFSPath = new VFSPath(["images", "sub2"]);
export const vfsPathImagesDeepSub: VFSPath = new VFSPath(["images", "sub1", "deep1"]);
export const vfsPathOthers: VFSPath = new VFSPath(["others"]);
export const vfsPathOthersSub3: VFSPath = new VFSPath(["others", "sub3"]);
export const vfsPathNonExistingUnderExistingAcceptor: VFSPath = new VFSPath(["images", "non", "existing", "path"]);
export const vfsPathNonExistingUnderUnknownAcceptor: VFSPath = new VFSPath(["non", "existing", "path"]);

export const vfsBrowserFiles: UploadedFileDescriptor[] = [
    { path: "images/file1.jpg" },
    { path: "images/file2.jpg" },
    { path: "images/sub1/file3.jpg" },
    { path: "images/sub1/file4.jpg" },
    { path: "images/sub1/file5.jpg" },
    { path: "images/sub1/deep1/file6.jpg" },
    { path: "others/sub3/file7.pdf" },
    { path: "others/sub3/file8.pdf" },
] as UploadedFileDescriptor[];

export const vfsBrowserImagesAcceptor: AcceptorInfo = {

    acceptableMimeTypes: ["image/*"],
    children: ["sub1", "sub2", "sub1/deep1"],
    id: "image",
    root: "images"
}

export const vfsBrowserOtherAcceptor: AcceptorInfo = {

    acceptableMimeTypes: ["application/pdf"],
    children: ["sub3"],
    id: "other",
    root: "others"
}

export const vfsBrowserAcceptors: AcceptorInfo[] = [vfsBrowserImagesAcceptor, vfsBrowserOtherAcceptor];

let accessSyncStub: SinonStub;
let existsSyncStub: SinonStub;
let mkdirSyncStub: SinonStub;
let readdirSyncStub: SinonStub;
let readFileSyncStub: SinonStub;
let unlinkSyncStub: SinonStub;
let writeFileSyncStub: SinonStub;
let mockedFS: IFs;

export function initFSMocks(skip?: "readFile"[]): void {

    mockedFS = createFsFromVolume(vol);
    accessSyncStub = sinon.stub(fs, "accessSync").callsFake(mockedFS.accessSync);
    existsSyncStub = sinon.stub(fs, "existsSync").callsFake(mockedFS.existsSync);
    // @ts-ignore
    mkdirSyncStub = sinon.stub(fs, "mkdirSync").callsFake(mockedFS.mkdirSync);
    // @ts-ignore
    readdirSyncStub = sinon.stub(fs, "readdirSync").callsFake(mockedFS.readdirSync);
    if (skip && skip.includes("readFile")) {
        // @ts-ignore
        readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake(mockedFS.readFileSync);
    }
    unlinkSyncStub = sinon.stub(fs, "unlinkSync").callsFake(mockedFS.unlinkSync);
    // @ts-ignore
    writeFileSyncStub = sinon.stub(fs, "writeFileSync").callsFake(mockedFS.writeFileSync);
}

export function restoreFSMocks(): void {

    vol.reset();
    accessSyncStub.restore();
    existsSyncStub.restore();
    mkdirSyncStub.restore();
    readdirSyncStub.restore();
    readFileSyncStub?.restore();
    unlinkSyncStub.restore();
    writeFileSyncStub.restore();
}
