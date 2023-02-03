/**
 * Attribute (generic) parameters.
 */
export enum Attribute {
    AUTHORIZATION_HEADER = "authorization_header",
    FIELD_DESCRIPTION = "description",
    FIELD_INPUT_FILE = "inputFile",
    FIELD_NAME = "name",
    FIELD_ORIGINAL_FILENAME = "originalFilename",
    FIELD_PARENT = "parent",
    FIELD_SUBFOLDER = "subFolder",
    PATH_UUID = "path_uuid",
    RESPONSE_ENTITY = "response_entity"
}

/**
 * Test data.
 */
export class TestData {

    public static readonly subFolders = [
        "images/test_sub",
        "files/sub1",
        "files/sub2",
        "files/sub2/deep1"
    ];

    public static readonly files = [
        "images/stored_filename_1.jpg",
        "images/stored_filename_2_as_png_image.png",
        "images/test_sub/stored_filename_3.jpg",
    ];
}
