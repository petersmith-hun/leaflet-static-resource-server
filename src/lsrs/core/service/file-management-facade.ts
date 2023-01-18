import {Logger} from "tslog";
import {Service} from "typedi";
import {InMemoryCache} from "../../helper/cache";
import {Optional} from "../../helper/common-utilities";
import LoggerFactory from "../../helper/logger-factory";
import {AcceptorInfo, DownloadableFileWrapper} from "../model/file-browser-api";
import {FileInput} from "../model/file-input";
import {
    UploadedFileCreateAttributes,
    UploadedFileDescriptor,
    UploadedFileUpdateAttributes
} from "../model/uploaded-file";
import FileManagementService from "./file-management-service";
import FileMetadataService from "./file-metadata-service";

/**
 * Facade for file management operations, including info storage.
 */
@Service()
export default class FileManagementFacade {

    private static readonly metadataCache = "metadata";

    private readonly logger: Logger = LoggerFactory.getLogger(FileManagementFacade);

    private readonly fileMetadataService: FileMetadataService;
    private readonly fileManagementService: FileManagementService;
    private readonly cache: InMemoryCache;

    constructor(fileMetadataService: FileMetadataService, fileManagementService: FileManagementService, cache: InMemoryCache) {
        this.fileMetadataService = fileMetadataService;
        this.fileManagementService = fileManagementService;
        this.cache = cache;
    }


    /**
     * Handles file upload.
     *
     * @param fileInput source file information (which is being uploaded)
     * @return uploaded file information
     */
    async upload(fileInput: FileInput): Promise<UploadedFileCreateAttributes> {

        const uploadedFile = this.fileManagementService.upload(fileInput);
        await this.fileMetadataService.storeMetadata(uploadedFile);

        return uploadedFile;
    }

    /**
     * Downloads an existing file by its path UUID.
     *
     * @param pathUUID pathUUID of the file to download
     * @return uploaded file and its meta information as DownloadableFileWrapper
     */
    async download(pathUUID: string): Promise<DownloadableFileWrapper> {

        const uploadedFile = await this.cache.get(FileManagementFacade.metadataCache, pathUUID,
            async (key) => await this.fileMetadataService.retrieveMetadata(key))!;
        const fileContent = this.fileManagementService.download(uploadedFile.path);

        return {
            originalFilename: uploadedFile.originalFilename!,
            mimeType: uploadedFile.acceptedAs,
            length: fileContent.length,
            fileContent: fileContent
        }
    }

    /**
     * Removes an existing file by its path UUID.
     *
     * @param pathUUID pathUUID of the file to remove
     */
    async remove(pathUUID: string): Promise<void> {

        const uploadedFile = await this.fileMetadataService.retrieveMetadata(pathUUID);
        this.cache.remove(FileManagementFacade.metadataCache, pathUUID);
        this.fileManagementService.remove(uploadedFile.path);
        await this.fileMetadataService.removeMetadata(pathUUID);
    }

    /**
     * Creates a new directory under given parent directory.
     *
     * @param parent parent directory name (must be already existing)
     * @param directoryName name of the directory to create
     */
    createDirectory(parent: string, directoryName: string): void {
        this.fileManagementService.createDirectory(parent, directoryName);
    }

    /**
     * Retrieves a list of stored files.
     *
     * @return List of UploadedFileDescriptor objects holding information about stored files
     */
    async retrieveStoredFileList(): Promise<UploadedFileDescriptor[]> {
        return await this.fileMetadataService.getUploadedFiles();
    }

    /**
     * Updates file meta information.
     *
     * @param pathUUID pathUUID of existing file to update meta info of
     * @param updatedMetadata updated meta information
     */
    async updateMetadata(pathUUID: string, updatedMetadata: UploadedFileUpdateAttributes): Promise<void> {
        await this.fileMetadataService.updateMetadata(pathUUID, updatedMetadata);
        this.cache.remove(FileManagementFacade.metadataCache, pathUUID);
    }

    /**
     * Retrieves given file's meta info only if the file exists.
     *
     * @param pathUUID pathUUID of the file to get meta info of
     * @return UploadedFileDescriptor if the file exists, null otherwise
     */
    async getCheckedMetaInfo(pathUUID: string): Promise<Optional<UploadedFileDescriptor>> {

        let uploadedFile: Optional<UploadedFileDescriptor> = null;

        try {
            const existingFile = await this.fileMetadataService.retrieveMetadata(pathUUID);
            if (this.fileManagementService.exists(existingFile.path)) {
                uploadedFile = existingFile;
            } else {
                this.logger.error(`Requested file by pathUUID=${pathUUID} is missing in storage`);
            }
        } catch (error) {
            this.logger.error(`Requested file by pathUUID=${pathUUID} does not exist`);
        }

        return uploadedFile;
    }

    /**
     * Retrieves information of existing acceptors.
     *
     * @return List of AcceptorInfo holding information about acceptors
     */
    getAcceptorInfo(): AcceptorInfo[] {
        return this.fileManagementService.getAcceptorInfo();
    }
}
