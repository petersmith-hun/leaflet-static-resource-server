import { UploadedFileDescriptor } from "./uploaded-file";

/**
 * Descriptor model for acceptors to be used on the external API.
 */
export interface AcceptorInfo {

    id: string;
    root: string;
    children: string[];
    acceptableMimeTypes: string[];
}

/**
 * Wrapper model for files being downloaded. It contains the file contents along with some necessary meta information
 * to be passed as headers in the HTTP response.
 */
export interface DownloadableFileWrapper {

    fileContent: Buffer;
    originalFilename: string;
    mimeType: string;
    length: number;
}

/**
 * Internal domain class representing a path in the virtual file system. Splits the given path into the acceptor root
 * folder and the acceptor-root-relative folder path, as well as a root relative path, the current path's parent path
 * and the depth of the path.
 */
export class VFSPath {

    currentDepth: number;
    acceptorRootPath?: string;
    currentPath?: string;
    rootRelativePath?: string;
    parent: string;

    constructor(vfsPath: string[]) {
        this.currentDepth = vfsPath.length;
        this.parent = this.getParent(vfsPath);
        if (this.currentDepth > 0) {
            this.currentPath = vfsPath.slice(1).join("/");
            this.acceptorRootPath = vfsPath[0];
            this.rootRelativePath = this.currentPath
                ? `${this.acceptorRootPath}/${this.currentPath}`
                : this.acceptorRootPath;
        }
    }

    private getParent(path: string[]): string {

        let parent = "/";

        if (path.length > 1) {
            parent += path.slice(0, -1).join("/");
        }

        return parent;
    }
}

/**
 * Domain class representing a single folder in the VFS.
 */
export interface VFSFolder {

    folderName: string;
    absolutePath: string;
}

/**
 * Domain class representing the contents of a specific folder in the VFS.
 */
export interface VFSContent {

    parent: string;
    currentPath: string;
    directories: VFSFolder[];
    uploadedFiles: UploadedFileDescriptor[];
}
