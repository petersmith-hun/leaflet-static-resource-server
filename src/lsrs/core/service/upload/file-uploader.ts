import ConfigurationProvider, { Acceptor, configurationProvider } from "@app/core/config/configuration-provider";
import { GenericError } from "@app/core/error/error-types";
import { FileInput } from "@app/core/model/file-input";
import { UploadedFileCreateAttributes } from "@app/core/model/uploaded-file";
import PathUtility, { pathUtility } from "@app/core/service/upload/path-utility";
import { Optional } from "@app/helper/common-utilities";
import LoggerFactory from "@app/helper/logger-factory";
import * as fs from "fs";
import { v4 as UUID } from "uuid";

/**
 * File upload logic.
 */
export default class FileUploader {

    private readonly logger = LoggerFactory.getLogger(FileUploader);

    private readonly acceptors: Acceptor[];
    private readonly pathUtility: PathUtility;

    constructor(configurationProvider: ConfigurationProvider, pathUtility: PathUtility) {
        this.acceptors = configurationProvider.getStorageConfig().acceptors;
        this.pathUtility = pathUtility;
    }

    /**
     * Uploads the given file (coming from a FileInput object).
     * Steps done are the following:
     *  1) Attempting to accept the given file based on its MIME type.
     *  2) On success, file contents are copied into a persistent file, its location being dependent on the acceptor that accepted it.
     *  3) A descriptor object is created to be stored in the database.
     *  4) On failure, it returns null, indicating that the upload was not successful.
     *
     * @param fileInput FileInput object containing the contents of and information about the file being uploaded
     * @returns populated UploadedFileCreateAttributes metadata object based on the uploaded file, or null on failure
     */
    upload(fileInput: FileInput): Optional<UploadedFileCreateAttributes> {

        const acceptedBy: Optional<Acceptor> = this.acceptors
            .find(acceptor => acceptor.accept(fileInput));

        try {
            return acceptedBy
                ? this.doUpload(acceptedBy, fileInput)
                : null;
        } catch (error) {
            throw new GenericError(`Failed to upload file: ${error}`)
        }
    }

    private doUpload(acceptor: Acceptor, fileInput: FileInput): UploadedFileCreateAttributes {

        this.logger.info(`File ${fileInput.originalFilename} of MIME type ${fileInput.contentType} accepted as ${acceptor.acceptedAs}`);

        const targetFilename = this.pathUtility.createTargetFilename(fileInput);
        const fileRelativePath = this.pathUtility.createFileRelativePath(acceptor, fileInput, targetFilename);
        const fileAbsolutePath = this.pathUtility.createFileAbsolutePath(fileRelativePath);

        fs.writeFileSync(fileAbsolutePath, fileInput.fileContentStream);

        this.logger.info(`Successfully uploaded and stored file ${fileInput.originalFilename} under ${fileRelativePath}`);

        return {
            originalFilename: fileInput.originalFilename,
            acceptedAs: fileInput.contentType.toString(),
            description: fileInput.description,
            path: this.pathUtility.normalizePath(fileRelativePath),
            storedFilename: targetFilename,
            pathUUID: UUID()
        }
    }
}

export const fileUploader = new FileUploader(configurationProvider, pathUtility);
