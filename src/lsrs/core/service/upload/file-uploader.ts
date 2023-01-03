import * as fs from "fs";
import {Logger} from "tslog";
import {Service} from "typedi";
import {v4 as UUID} from "uuid";
import {Optional} from "../../../helper/common-utilities";
import LoggerFactory from "../../../helper/logger-factory";
import ConfigurationProvider, {Acceptor} from "../../config/configuration-provider";
import {GenericError} from "../../error/error-types";
import {FileInput} from "../../model/file-input";
import {UploadedFileCreateAttributes} from "../../model/uploaded-file";
import PathUtility from "./path-utility";

/**
 * File upload logic.
 */
@Service()
export default class FileUploader {

    private readonly logger: Logger = LoggerFactory.getLogger(FileUploader);

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

        fs.writeFileSync(fileAbsolutePath, Buffer.from(fileInput.fileContentStream));

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
