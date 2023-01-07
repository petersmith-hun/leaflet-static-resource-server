/**
 * Descriptor model for acceptors to be used on the external API.
 */
export interface AcceptorInfo {

    id: string;
    rootDirectoryName: string;
    childrenDirectories: string[];
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
