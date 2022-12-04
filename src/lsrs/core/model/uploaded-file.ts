import {DataTypes, Model, ModelAttributes, Optional as SequelizeOptional} from "sequelize";
import {Optional} from "../../helper/common-utilities";

/**
 * Model for updating an existing file metadata record.
 */
export interface UploadedFileUpdateAttributes {

    originalFilename?: string;
    description?: string;
}

/**
 * Model for creating a new file metadata record.
 */
export interface UploadedFileCreateAttributes extends UploadedFileUpdateAttributes {

    pathUUID: string;
    path: string;
    acceptedAs: string;
    storedFilename: string;
}

/**
 * Model for administrative attributes of a metadata record.
 */
export interface UploadedFileAdministrativeAttributes {

    id: number;
    createdAt: Date;
    updatedAt?: Optional<Date>;
    enabled: boolean;
}

/**
 * Model for retrieving complete file metadata records.
 */
export interface UploadedFileDescriptor extends UploadedFileCreateAttributes, UploadedFileAdministrativeAttributes {

}

/**
 * Sequelize model definition for file metadata records.
 */
export class UploadedFile extends Model<UploadedFileDescriptor, UploadedFileCreateAttributes> implements UploadedFileDescriptor {

    id!: number;
    createdAt!: Date;
    updatedAt!: Date;
    enabled!: boolean;

    pathUUID!: string;
    path!: string;
    acceptedAs!: string;
    storedFilename!: string;
    originalFilename!: string;
    description!: string;
}

/**
 * Sequelize model attributes definition for file metadata records.
 */
export const uploadedFileModelAttributes: ModelAttributes<UploadedFile, SequelizeOptional<UploadedFileDescriptor, never>> = {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    createdAt: {
        type: DataTypes.DATE,
        field: "date_created"
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: "date_last_modified"
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        field: "is_enabled",
        defaultValue: true
    },
    pathUUID: {
        type: DataTypes.STRING,
        field: "path_uuid"
    },
    path: {
        type: DataTypes.STRING
    },
    acceptedAs: {
        type: DataTypes.STRING,
        field: "mime"
    },
    storedFilename: {
        type: DataTypes.STRING,
        field: "stored_filename"
    },
    originalFilename: {
        type: DataTypes.STRING,
        field: "original_filename"
    },
    description: {
        type: DataTypes.STRING
    }
}
