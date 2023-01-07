import * as fs from "fs";
import path from "path";
import {Logger} from "tslog";
import {Service} from "typedi";
import LoggerFactory from "../../helper/logger-factory";
import ConfigurationProvider, {Acceptor} from "../config/configuration-provider";
import {InaccessibleFileError, InvalidFileInputError} from "../error/error-types";
import {AcceptorInfo} from "../model/file-browser-api";
import {FileInput} from "../model/file-input";
import {UploadedFileCreateAttributes} from "../model/uploaded-file";
import FileUploader from "./upload/file-uploader";
import PathUtility from "./upload/path-utility";

/**
 * Service to handle file operations.
 * Supports uploading new files and retrieve existing ones.
 */
@Service()
export default class FileManagementService {

    private readonly logger: Logger = LoggerFactory.getLogger(FileManagementService);

    private readonly fileUploader: FileUploader;
    private readonly pathUtility: PathUtility;
    private readonly acceptors: Acceptor[];

    constructor(fileUploader: FileUploader, pathUtility: PathUtility,
                configurationProvider: ConfigurationProvider) {
        this.fileUploader = fileUploader;
        this.pathUtility = pathUtility;
        this.acceptors = configurationProvider.getStorageConfig().acceptors;
    }

    /**
     * Handles file upload.
     *
     * @param fileInput source file information (which is being uploaded)
     * @return uploaded file information
     */
    upload(fileInput: FileInput): UploadedFileCreateAttributes {

        this.assertFileSize(fileInput);

        const uploadedFile = this.fileUploader.upload(fileInput);
        if (!uploadedFile) {
            this.logger.error(`No acceptor for MIME [${fileInput.contentType}] found to upload file [${fileInput.originalFilename}]`);
            throw new InvalidFileInputError("No acceptor found to upload file");
        }

        return uploadedFile;
    }

    /**
     * Downloads an existing file by its stored filename.
     * Path should be relative to the storage root.
     *
     * @param relativePath path of the file to download (relative to storage root)
     * @return uploaded file as Buffer
     */
    download(relativePath: string): Buffer {

        const absolutePath = this.getAccessibleAbsolutePath(relativePath);

        return this.executeFileOperation(absolutePath, () => fs.readFileSync(absolutePath))!;
    }

    /**
     * Removes an existing file by its stored filename.
     *
     * @param relativePath path of the file to remove (relative to storage root)
     */
    remove(relativePath: string): void {

        const absolutePath = this.getAccessibleAbsolutePath(relativePath);

        this.executeFileOperation(absolutePath, () => fs.unlinkSync(absolutePath));
    }

    /**
     * Creates a new directory under given parent directory.
     *
     * @param parent parent directory name (must be already existing)
     * @param directoryName name of the directory to create
     */
    createDirectory(parent: string, directoryName: string): void {

        const newDirectoryPath = path.join(parent, directoryName);
        const absolutePath = this.pathUtility.createFileAbsolutePath(newDirectoryPath);

        this.executeFileOperation(absolutePath, () => fs.mkdirSync(absolutePath));
    }

    /**
     * Checks if given file exists.
     *
     * @param relativePath path of the file (relative to storage root)
     * @return true if file exists, false otherwise
     */
    exists(relativePath: string): boolean {

        let exists = true;
        try {
            this.getAccessibleAbsolutePath(relativePath);
        } catch (error) {
            exists = false;
        }

        return exists;
    }

    /**
     * Retrieves information of existing acceptors.
     *
     * @return List of AcceptorInfo holding information about acceptors
     */
    getAcceptorInfo(): AcceptorInfo[] {

        return this.acceptors.map((acceptor) => {
            return {
                id: acceptor.acceptedAs,
                rootDirectoryName: acceptor.groupRootDirectory,
                acceptableMimeTypes: acceptor.acceptedMIMETypes.map(mime => mime.toString()),
                childrenDirectories: this.getChildrenDirectories(acceptor)
            }
        });
    }

    private assertFileSize(fileInput: FileInput): void {

        if (fileInput.size <= 0) {
            throw new InvalidFileInputError("File must not be empty");
        }
    }

    private getAccessibleAbsolutePath(relativePath: string): string {

        const absolutePath = this.pathUtility.createFileAbsolutePath(relativePath);
        this.assertExistence(absolutePath);
        this.assertReadAccess(absolutePath);

        return absolutePath;
    }

    private assertExistence(absolutePath: string): void {

        if (!fs.existsSync(absolutePath)) {
            throw new InaccessibleFileError(absolutePath);
        }
    }

    private assertReadAccess(absolutePath: string): void {

        try {
            fs.accessSync(absolutePath, fs.constants.R_OK);
        } catch (error) {
            throw new InaccessibleFileError(absolutePath);
        }
    }

    private executeFileOperation<Type>(absolutePath: string, operation: () => Type | void): Type | void {

        try {
            return operation();
        } catch (error) {
            this.logger.error("Failed to execute file operation", error);
            throw new InaccessibleFileError(absolutePath);
        }
    }

    private getChildrenDirectories(acceptor: Acceptor): string[] {

        const absolutePath = this.pathUtility.createFileAbsolutePath(acceptor.groupRootDirectory);

        return this.walkDirectory(absolutePath, absolutePath);
    }

    private walkDirectory(basePath: string, currentPath: string): string[] {

        return fs.readdirSync(currentPath, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(currentPath, dirent.name))
            .map(directoryPath => [
                this.pathUtility.normalizePath(path.relative(basePath, directoryPath)),
                ...this.walkDirectory(basePath, directoryPath)
            ])
            .flat();
    }
}
