import VFSBrowser from "@app/core/service/browser/vfs-browser";
import FileManagementService from "@app/core/service/file-management-service";
import FileMetadataService from "@app/core/service/file-metadata-service";
import {
    vfsBrowserAcceptors,
    vfsBrowserFiles,
    vfsPathImages,
    vfsPathImagesDeepSub,
    vfsPathImagesSub1,
    vfsPathImagesSub2,
    vfsPathNonExistingUnderExistingAcceptor,
    vfsPathNonExistingUnderUnknownAcceptor,
    vfsPathOthers,
    vfsPathOthersSub3,
    vfsPathRoot
} from "@testdata/service";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for VFSBrowser", () => {

    let fileMetadataServiceMock: SinonStubbedInstance<FileMetadataService>;
    let fileManagementServiceMock: SinonStubbedInstance<FileManagementService>;
    let vfsBrowser: VFSBrowser;

    beforeEach(() => {

        fileMetadataServiceMock = sinon.createStubInstance(FileMetadataService);
        fileManagementServiceMock = sinon.createStubInstance(FileManagementService);

        vfsBrowser = new VFSBrowser(fileMetadataServiceMock, fileManagementServiceMock);

        fileMetadataServiceMock.getUploadedFiles.resolves(vfsBrowserFiles);
        fileManagementServiceMock.getAcceptorInfo.returns(vfsBrowserAcceptors);
    });

    describe("Test scenarios for #browseVFS", () => {

        it("should return VFS contents for root", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathRoot);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/");
            expect(result.currentPath).toBe("/");
            expect(result.directories).toStrictEqual([
                { folderName: "images", absolutePath: "/images" },
                { folderName: "others", absolutePath: "/others" }
            ]);
            expect(result.uploadedFiles).toStrictEqual([]);
        });

        it("should return VFS contents for images root", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathImages);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/");
            expect(result.currentPath).toBe("/images");
            expect(result.directories).toStrictEqual([
                { folderName: "sub1", absolutePath: "/images/sub1" },
                { folderName: "sub2", absolutePath: "/images/sub2" }
            ]);
            expect(result.uploadedFiles).toStrictEqual([
                vfsBrowserFiles[0],
                vfsBrowserFiles[1]
            ]);
        });

        it("should return VFS contents for images/sub1", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathImagesSub1);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/images");
            expect(result.currentPath).toBe("/images/sub1");
            expect(result.directories).toStrictEqual([
                { folderName: "deep1", absolutePath: "/images/sub1/deep1" }
            ]);
            expect(result.uploadedFiles).toStrictEqual([
                vfsBrowserFiles[2],
                vfsBrowserFiles[3],
                vfsBrowserFiles[4]
            ]);
        });

        it("should return VFS contents for images/sub1/deep1", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathImagesDeepSub);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/images/sub1");
            expect(result.currentPath).toBe("/images/sub1/deep1");
            expect(result.directories).toStrictEqual([]);
            expect(result.uploadedFiles).toStrictEqual([
                vfsBrowserFiles[5]
            ]);
        });

        it("should return VFS contents for images/sub2", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathImagesSub2);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/images");
            expect(result.currentPath).toBe("/images/sub2");
            expect(result.directories).toStrictEqual([]);
            expect(result.uploadedFiles).toStrictEqual([]);
        });

        it("should return VFS contents for others root", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathOthers);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/");
            expect(result.currentPath).toBe("/others");
            expect(result.directories).toStrictEqual([
                { folderName: "sub3", absolutePath: "/others/sub3" }
            ]);
            expect(result.uploadedFiles).toStrictEqual([]);
        });

        it("should return VFS contents for others/sub3", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathOthersSub3);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/others");
            expect(result.currentPath).toBe("/others/sub3");
            expect(result.directories).toStrictEqual([]);
            expect(result.uploadedFiles).toStrictEqual([
                vfsBrowserFiles[6],
                vfsBrowserFiles[7]
            ]);
        });

        it("should return empty contents for non-existing path under existing acceptor root", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathNonExistingUnderExistingAcceptor);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/images/non/existing");
            expect(result.currentPath).toBe("/images/non/existing/path");
            expect(result.directories).toStrictEqual([]);
            expect(result.uploadedFiles).toStrictEqual([]);
        });

        it("should return empty contents for non-existing path under non-existing acceptor root", async () => {

            // when
            const result = await vfsBrowser.browseVFS(vfsPathNonExistingUnderUnknownAcceptor);

            // then
            expect(result).not.toBeNull();
            expect(result.parent).toBe("/non/existing");
            expect(result.currentPath).toBe("/non/existing/path");
            expect(result.directories).toStrictEqual([]);
            expect(result.uploadedFiles).toStrictEqual([]);
        });
    });
});