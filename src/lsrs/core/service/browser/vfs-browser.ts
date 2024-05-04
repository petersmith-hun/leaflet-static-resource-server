import { VFSContent, VFSFolder, VFSPath } from "@app/core/model/file-browser-api";
import { UploadedFileDescriptor } from "@app/core/model/uploaded-file";
import FileManagementService from "@app/core/service/file-management-service";
import FileMetadataService from "@app/core/service/file-metadata-service";
import { Service } from "typedi";

/**
 * Virtual file system browser implementation. Able to list the folders and files under a specific path in the VFS.
 */
@Service()
export default class VFSBrowser {

    private readonly fileMetadataService: FileMetadataService;
    private readonly fileManagementService: FileManagementService;

    constructor(fileMetadataService: FileMetadataService, fileManagementService: FileManagementService) {
        this.fileMetadataService = fileMetadataService;
        this.fileManagementService = fileManagementService;
    }

    /**
     * Generates the VFS contents for the given path. An empty path returns the acceptor roots, where no files should ever
     * exist. Any other path, including the acceptor root paths may include a set of folders, as well as a set of files.
     *
     * @param vfsPath path to browse
     */
    async browseVFS(vfsPath: VFSPath): Promise<VFSContent> {

        return {
            parent: vfsPath.parent,
            currentPath: `/${vfsPath.rootRelativePath ?? ""}`,
            directories: this.getDirectoriesInFolder(vfsPath),
            uploadedFiles: await this.getFilesInFolder(vfsPath)
        }
    }

    private getDirectoriesInFolder(vfsPath: VFSPath): VFSFolder[] {

        return vfsPath.currentDepth === 0
            ? this.getAcceptorRootFolders()
            : this.getSubFolders(vfsPath);
    }

    private getAcceptorRootFolders(): VFSFolder[] {

        return this.fileManagementService.getAcceptorInfo()
            .map(acceptor => {
                return {
                    folderName: acceptor.root,
                    absolutePath: `/${acceptor.root}`
                }
            });
    }

    private getSubFolders(vfsPath: VFSPath): VFSFolder[] {

        return this.fileManagementService.getAcceptorInfo()
            .filter(acceptor => acceptor.root === vfsPath.acceptorRootPath)
            .flatMap(acceptor => acceptor.children)
            .filter(folder => folder !== vfsPath.currentPath)
            .filter(folder => folder.startsWith(vfsPath.currentPath!))
            .filter(folder => this.isDirectChildFolder(folder, vfsPath))
            .map(folder => {
                return {
                    folderName: this.getFolderName(folder),
                    absolutePath: `/${vfsPath.acceptorRootPath}/${folder}`
                }
            });
    }

    private async getFilesInFolder(vfsPath: VFSPath): Promise<UploadedFileDescriptor[]> {

        const files = await this.fileMetadataService.getUploadedFiles();

        return files
            .filter(uploadedFile => uploadedFile.path.startsWith(vfsPath.rootRelativePath!))
            .filter(uploadedFile => this.isDirectChildFile(uploadedFile, vfsPath));
    }

    private isDirectChildFolder(folder: string, vfsPath: VFSPath): boolean {
        return this.calculateDepth(folder) === vfsPath.currentDepth;
    }

    private isDirectChildFile(uploadedFile: UploadedFileDescriptor, vfsPath: VFSPath): boolean {
        return this.calculateDepth(uploadedFile.path) - 1 === vfsPath.currentDepth;
    }

    private calculateDepth(path: string): number {
        return path.split("/").length;
    }

    private getFolderName(folderPath: string): string {
        return folderPath.split("/").pop() ?? "";
    }
}
