import {IsNotEmpty, IsUUID, MaxLength} from "class-validator";
import {Request} from "express";
import {Optional} from "../../helper/common-utilities";

/**
 * API response model for file data.
 */
export interface FileModel {

    originalFilename: Optional<string>;
    reference: string;
    acceptedAs: string;
    description: Optional<string>;
    path: string;
}

/**
 * API response model for list of FileModel objects.
 */
export interface FileListModel {

    files: FileModel[];
}

/**
 * API response model for directory (acceptor) data.
 */
export interface DirectoryModel {

    id: string;
    root: string;
    children: string[];
    acceptableMimeTypes: string[];
}

/**
 * API response model for list of DirectoryModel objects.
 */
export interface DirectoryListModel {

    acceptors: DirectoryModel[];
}

/**
 * API request model for operations requiring explicit file identification.
 */
export class FileIdentifier {

    @IsUUID()
    readonly pathUUID: string;

    constructor(request: Request) {
        this.pathUUID = request.params.pathUUID;
    }
}

/**
 * API request model for file uploads, representing the actually uploaded file.
 */
export interface InputFile {

    size: number;
    originalFilename: string;
    mimetype: string;
    content: Buffer;
}

/**
 * API request model for file uploads, containing some metadata and the file itself (as InputFile).
 */
export class FileUploadRequestModel {

    @IsNotEmpty()
    readonly inputFile: InputFile;

    @MaxLength(255)
    readonly subFolder: string;

    @MaxLength(255)
    readonly description: string;

    constructor(request: Request) {
        this.inputFile = request.body.inputFile;
        this.subFolder = request.body.subFolder;
        this.description = request.body.description;
    }
}

/**
 * API request model for creating a new directory.
 */
export class DirectoryCreationRequestModel {

    @IsNotEmpty()
    @MaxLength(255)
    readonly parent: string;

    @IsNotEmpty()
    @MaxLength(255)
    readonly name: string;

    constructor(request: Request) {
        this.parent = request.body.parent;
        this.name = request.body.name;
    }
}

/**
 * API request model for updating the metadata of an existing file.
 */
export class UpdateFileMetadataRequestModel extends FileIdentifier {

    @IsNotEmpty()
    @MaxLength(255)
    readonly originalFilename: string;

    @MaxLength(255)
    readonly description: string;

    constructor(request: Request) {
        super(request);
        this.originalFilename = request.body.originalFilename;
        this.description = request.body.description;
    }
}
