import {ConstraintViolation} from "../../src/lsrs/web/model/common";
import {DirectoryModel, FileModel} from "../../src/lsrs/web/model/files";
import DataRegistry from "./data-registry";
import {Attribute} from "./test-constants";

type ConversionTuple<Type> = [keyof Type, (value: string) => any | any[]];
const splitFunction = (item: string) => item.split(", ");
const pathUUIDReplaceFunction = (item: string) => item.replace("$pathUUID", DataRegistry.get(Attribute.PATH_UUID));

/**
 * Converts a row of file model data table to FileModel object.
 *
 * @param fileModel file model data table row
 */
export const convertFileModel = (fileModel: string[]) => {
    return convert<FileModel>(fileModel, [["reference", pathUUIDReplaceFunction], "path", "acceptedAs", "description", "originalFilename"]);
};

/**
 * Converts a row of directory model data table to DirectoryModel object.
 *
 * @param directoryModel directory model data table row
 */
export const convertDirectoryModel = (directoryModel: string[]) => {
    return convert<DirectoryModel>(directoryModel, ["id", "root", ["children", splitFunction], ["acceptableMimeTypes", splitFunction]]);
};

/**
 * Converts a row of constraint violation data table to ConstraintViolation object.
 *
 * @param violation constraint violation data table row
 */
export const convertConstraintViolation = (violation: string[]) => {
    return convert<ConstraintViolation>(violation, ["field", "constraint", "message"]);
};

const convert = <Type>(source: string[], properties: (keyof Type | ConversionTuple<Type>)[]): Type => {

    const entries = properties
        .map((item) => typeof item == "string"
            ? [item, (item: string) => item]
            : item)
        .map((item) => item as ConversionTuple<Type>)
        .map((item, index) => [item[0], item[1](source[index])]);

    return Object.fromEntries(entries);
};
