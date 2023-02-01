import {ConstraintViolation} from "../../src/lsrs/web/model/common";
import {DirectoryModel, FileModel} from "../../src/lsrs/web/model/files";
import DataRegistry from "./data-registry";
import {Attribute} from "./test-constants";

/**
 * Converts a row of file model data table to FileModel object.
 *
 * @param fileModel file model data table row
 */
export const convertFileModel = (fileModel: string[]) => {

    return {
        reference: fileModel[0].replace("$pathUUID", DataRegistry.get(Attribute.PATH_UUID)),
        path: fileModel[1],
        acceptedAs: fileModel[2],
        description: fileModel[3],
        originalFilename: fileModel[4]
    } as FileModel
};

/**
 * Converts a row of directory model data table to DirectoryModel object.
 *
 * @param directoryModel directory model data table row
 */
export const convertDirectoryModel = (directoryModel: string[]) => {

    return {
        id: directoryModel[0],
        root: directoryModel[1],
        children: directoryModel[2].split(", "),
        acceptableMimeTypes: directoryModel[3].split(", ")
    } as DirectoryModel
};

/**
 * Converts a row of constraint violation data table to ConstraintViolation object.
 *
 * @param violation constraint violation data table row
 */
export const convertConstraintViolation = (violation: string[]) => {

    return {
        field: violation[0],
        constraint: violation[1],
        message: violation[2]
    } as ConstraintViolation;
};
