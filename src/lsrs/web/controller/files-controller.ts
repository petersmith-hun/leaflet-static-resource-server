import ConfigurationProvider, { ServerConfig, StorageConfig } from "@app/core/config/configuration-provider";
import { ResourceNotFoundError } from "@app/core/error/error-types";
import { VFSPath } from "@app/core/model/file-browser-api";
import { UploadedFile } from "@app/core/model/uploaded-file";
import FileManagementFacade from "@app/core/service/file-management-facade";
import { ControllerToken } from "@app/helper/typedi-tokens";
import { Controller, ControllerType } from "@app/web/controller/controller";
import {
    convertBrowserResponse,
    convertMetadataUpdateRequest,
    convertUploadedFile,
    convertUploadRequest
} from "@app/web/converter/converters";
import { header, Headers, HttpStatus, ResponseWrapper } from "@app/web/model/common";
import {
    BrowseRequest,
    DirectoryCreationRequestModel,
    DirectoryListModel,
    DirectoryModel,
    FileIdentifier,
    FileListModel,
    FileModel,
    FileUploadRequestModel,
    UpdateFileMetadataRequestModel,
    VFSBrowserModel
} from "@app/web/model/files";
import { Validated } from "@app/web/utility/validator";
import { Service } from "typedi";

/**
 * Controller for file related endpoints.
 */
@Service({eager: true, multiple: true, id: ControllerToken})
export default class FilesController implements Controller {

    private readonly fileManagementFacade: FileManagementFacade;
    private readonly serverConfig: ServerConfig;
    private readonly cacheControl: string;

    constructor(fileManagementFacade: FileManagementFacade, configurationProvider: ConfigurationProvider) {
        this.fileManagementFacade = fileManagementFacade;
        this.serverConfig = configurationProvider.getServerConfig();
        this.cacheControl = this.createCacheControl(configurationProvider.getStorageConfig());
    }

    /**
     * GET /files
     * Returns list of uploaded files.
     */
    public async getUploadedFiles(): Promise<ResponseWrapper<FileListModel>> {

        const files: FileModel[] = (await this.fileManagementFacade.retrieveStoredFileList())
            .map(uploadedFile => convertUploadedFile(uploadedFile));

        return new ResponseWrapper<FileListModel>(HttpStatus.OK, {files: files});
    }

    /**
     * GET /files/{fileIdentifier}/{storedFilename}
     * Downloads given file.
     *
     * @param fileIdentifier FileIdentifier object containing file path UUID of the file
     */
    @Validated()
    public async download(fileIdentifier: FileIdentifier): Promise<ResponseWrapper<Buffer>> {

        const uploadedFile = await this.fileManagementFacade.download(fileIdentifier.pathUUID);

        return new ResponseWrapper<Buffer>(HttpStatus.OK, uploadedFile.fileContent, [
            header(Headers.CONTENT_LENGTH, uploadedFile.length),
            header(Headers.CONTENT_TYPE, uploadedFile.mimeType),
            header(Headers.CACHE_CONTROL, this.cacheControl)
        ], true);
    }


    /**
     * GET /files/{fileIdentifier}
     * Retrieves file meta information for given file identifier.
     *
     * @param fileIdentifier FileIdentifier object containing file path UUID of the file
     */
    @Validated()
    public async getFileDetails(fileIdentifier: FileIdentifier): Promise<ResponseWrapper<FileModel>> {

        const uploadedFile = await this.fileManagementFacade.getCheckedMetaInfo(fileIdentifier.pathUUID);
        if (!uploadedFile) {
            throw new ResourceNotFoundError(UploadedFile, fileIdentifier.pathUUID);
        }

        return new ResponseWrapper<FileModel>(HttpStatus.OK, convertUploadedFile(uploadedFile));
    }

    /**
     * GET /files/directories
     * Retrieves existing acceptor root directories and their children directories.
     */
    public async getDirectories(): Promise<ResponseWrapper<DirectoryListModel>> {

        const directories: DirectoryModel[] = this.fileManagementFacade.getAcceptorInfo();

        return new ResponseWrapper<DirectoryListModel>(HttpStatus.OK, {acceptors: directories});
    }

    /**
     * GET /files/browse[/{path1}[/{path2}[/...]]]
     * Retrieves the VFS contents at the given path.
     *
     * @param browseRequest VFS path to browse (optional, undefined path lists the VFS storage root, i.e. the acceptor root folders)
     */
    public async browse(browseRequest: BrowseRequest): Promise<ResponseWrapper<VFSBrowserModel>> {

        const vfsPath = new VFSPath(browseRequest.path);
        const vfsContent = await this.fileManagementFacade.browseVFS(vfsPath);

        return new ResponseWrapper<VFSBrowserModel>(HttpStatus.OK, convertBrowserResponse(vfsContent));
    }

    /**
     * POST /files
     * Uploads a new file.
     *
     * @param fileUploadRequestModel FileUploadRequestModel object containing the contents and the required metadata of the file to be uploaded
     */
    @Validated()
    public async uploadFile(fileUploadRequestModel: FileUploadRequestModel): Promise<ResponseWrapper<FileModel>> {

        const uploadedFile = await this.fileManagementFacade.upload(convertUploadRequest(fileUploadRequestModel));

        return new ResponseWrapper<FileModel>(HttpStatus.CREATED, convertUploadedFile(uploadedFile), [
            header(Headers.LOCATION, this.createLocation(uploadedFile.pathUUID))
        ]);
    }


    /**
     * POST /files/directories
     * Creates a new directory under given parent directory.
     *
     * @param directoryCreationRequestModel DirectoryCreationRequestModel object containing the name of the parent and the new directory
     */
    @Validated()
    public async createDirectory(directoryCreationRequestModel: DirectoryCreationRequestModel): Promise<ResponseWrapper<void>> {

        this.fileManagementFacade.createDirectory(directoryCreationRequestModel.parent, directoryCreationRequestModel.name);

        return new ResponseWrapper<void>(HttpStatus.CREATED);
    }
    /**
     * PUT /files/{fileIdentifier}
     * Updates given file's meta information.
     *
     * @param updateFileMetadataRequestModel UpdateFileMetadataRequestModel object containing the updated metadata parameters
     */
    @Validated()
    public async updateFileMetaInfo(updateFileMetadataRequestModel: UpdateFileMetadataRequestModel): Promise<ResponseWrapper<void>> {

        await this.fileManagementFacade.updateMetadata(updateFileMetadataRequestModel.pathUUID, convertMetadataUpdateRequest(updateFileMetadataRequestModel));

        return new ResponseWrapper<void>(HttpStatus.CREATED, undefined, [
            header(Headers.LOCATION, this.createLocation(updateFileMetadataRequestModel.pathUUID))
        ]);
    }
    /**
     * DELETE /files/{fileIdentifier}
     * Deletes an existing file.
     *
     * @param fileIdentifier FileIdentifier object containing file path UUID of the file
     */
    @Validated()
    public async deleteFile(fileIdentifier: FileIdentifier): Promise<ResponseWrapper<void>> {

        await this.fileManagementFacade.remove(fileIdentifier.pathUUID);

        return new ResponseWrapper<void>(HttpStatus.NO_CONTENT);
    }

    controllerType(): ControllerType {
        return ControllerType.FILES;
    }

    private createCacheControl(storageConfig: StorageConfig) {
        return `max-age=${storageConfig.maxAgeInDays * 86_400}`;
    }

    private createLocation(pathUUID: string): string {
        return `${this.serverConfig.contextPath}/files/${pathUUID}`;
    }
}
