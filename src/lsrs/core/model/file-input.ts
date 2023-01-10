/**
 * Model class holding the contents and meta information of a file being uploaded.
 */
export interface FileInput {

    originalFilename: string;
    contentType: MIMEType;
    size: number;
    fileContentStream: Buffer;
    relativePath?: string;
    description: string;
}


/**
 * MIME type wrapper.
 */
export class MIMEType {

    readonly typeGroup: string;
    readonly subType: string;

    constructor(mimeValue: string) {
        [this.typeGroup, this.subType] = mimeValue.split("/", 2);
    }

    /**
     * Indicates whether the defined MIME has a wildcard type ('*').
     *
     * @returns boolean flag as described above
     */
    public isWildcardSubType(): boolean {
        return this.subType == "*";
    }

    /**
     * Indicates whether the given other MIME type is compatible with the current one.
     * The given MIME type is considered compatible if:
     *  - Their type group is the same;
     *  - And any of them has a wildcard subtype or their subtype are also the same;
     *
     * @param other MIMEType object to be checked against this one
     * @returns boolean flag as described above
     */
    public isCompatibleWith(other: MIMEType): boolean {

        return this.typeGroup == other.typeGroup
            && (this.isWildcardSubType() || other.isWildcardSubType() || this.subType == other.subType);
    }

    /**
     * Formats this MIME type object as string by creating a standard MIME representation ('typeGroup/subType').
     *
     * @returns string representation of this MIME type
     */
    public toString() {
        return `${this.typeGroup}/${this.subType}`;
    }
}
