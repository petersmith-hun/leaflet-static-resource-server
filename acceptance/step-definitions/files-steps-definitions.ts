import {BeforeAll, DataTable, Given, Then, When} from "@cucumber/cucumber";
import {AxiosResponseHeaders} from "axios";
import {isUUID} from "class-validator";
import {expect} from "expect";
import * as fs from "fs";
import {ConstraintViolationErrorMessage, Scope} from "../../src/lsrs/web/model/common";
import {DirectoryListModel, FileListModel, FileModel} from "../../src/lsrs/web/model/files";
import AuthManager from "../support/auth-manager";
import DataRegistry from "../support/data-registry";
import {convertConstraintViolation, convertDirectoryModel, convertFileModel} from "../support/datatable-utils";
import {uploadPath} from "../support/init";
import LSRSRestClient from "../support/lsrs-rest-client";
import {Attribute} from "../support/test-constants";

let restClient: LSRSRestClient;
const scopeMap = new Map<string, Scope>([
    ["read:files", Scope.READ_FILES],
    ["write:files", Scope.WRITE_FILES]
]);

// -- set up --
BeforeAll(() => {
    restClient = LSRSRestClient.getInstance();
});

// -- conditions --
Given(/^the user is authorized to ([a-z: ]+)$/, async (scope: string) => {
    const mappedScope = scope.split(" ").map(scope => scopeMap.get(scope)!);
    DataRegistry.put(Attribute.AUTHORIZATION_HEADER, await AuthManager.createAuthorizationHeader(mappedScope));
});

Given("the user wants to request the file identified by {word}", (pathUUID: string) => {
    DataRegistry.put(Attribute.PATH_UUID, pathUUID);
});

Given(/^the user picks an input file called (.+\.[a-z]{3,4})$/, (originalFilename: string) => {
    DataRegistry.put(Attribute.FIELD_ORIGINAL_FILENAME, originalFilename);
    DataRegistry.put(Attribute.FIELD_INPUT_FILE, Buffer.from(originalFilename));
});

Given(/^the user sets the (originalFilename|description|subFolder|name|parent) to "(.*)"$/, (field: Attribute, value: string) => {
    DataRegistry.put(field, value);
});

// -- actions --
When("calling the retrieve files endpoint", async () => {
    DataRegistry.putResponse(await restClient.callGetUploadedFilesEndpoint());
});

When("calling the retrieve directories endpoint", async () => {
    DataRegistry.putResponse(await restClient.callGetDirectoriesEndpoint());
});

When("calling the retrieve file details endpoint", async () => {
    DataRegistry.putResponse(await restClient.callGetFileDetailsEndpoint());
});

When("calling the download endpoint", async () => {
    DataRegistry.putResponse(await restClient.callDownloadFileEndpoint());
});

When("calling the update file metadata endpoint", async () => {
    DataRegistry.putResponse(await restClient.callUpdateFileMetaInfoEndpoint());
});

When("calling the upload file endpoint", async () => {
    DataRegistry.putResponse(await restClient.callUploadFileEndpoint());
});

When("calling the create directory endpoint", async () => {
    DataRegistry.putResponse(await restClient.callCreateDirectoryEndpoint());
});

When("calling the delete file endpoint", async () => {
    DataRegistry.putResponse(await restClient.callDeleteFileEndpoint());
});

// -- assertions --
Then("the following files are returned", (expectedFiles: DataTable) => {

    const returnedFiles = DataRegistry.getResponse<FileListModel>().data.files;
    expect(returnedFiles.length).toBe(expectedFiles.rows().length);

    expectedFiles.rows()
        .map(convertFileModel)
        .forEach(file => expect(returnedFiles).toContainEqual(file));
});

Then("the following file metadata is returned", (expectedMetadata: DataTable) => {

    const returnedFileModel = DataRegistry.getResponse<FileModel>().data;
    const expectedFileModel = convertFileModel(expectedMetadata.rows()[0]);

    expect(returnedFileModel).toStrictEqual(expectedFileModel);
});

Then("the following directories are returned", (expectedDirectories: DataTable) => {

    const returnedDirectories = DataRegistry.getResponse<DirectoryListModel>().data.acceptors;
    expect(returnedDirectories.length).toBe(expectedDirectories.rows().length);

    expectedDirectories.rows()
        .map(convertDirectoryModel)
        .forEach(acceptor => expect(returnedDirectories).toContainEqual(acceptor));
});

Then("the validation error contains the following entries", (expectedViolations: DataTable) => {

    const validationErrorResponse = DataRegistry.getResponse<ConstraintViolationErrorMessage>().data;
    expect(validationErrorResponse.violations.length).toBe(expectedViolations.rows().length);

    expectedViolations.rows()
        .map(convertConstraintViolation)
        .forEach(violation => expect(validationErrorResponse.violations).toContainEqual(violation));
});

Then("the user wants to request the file identified by the location header", () => {

    const fileUploadResponse = DataRegistry.getResponse<FileModel>();
    const locationHeader = (fileUploadResponse.headers as AxiosResponseHeaders).get("Location") as string;
    const pathUUID = locationHeader.split("/").pop();

    expect(pathUUID).not.toBeUndefined();
    expect(isUUID(pathUUID)).toBe(true);

    DataRegistry.put(Attribute.PATH_UUID, pathUUID);
});

Then(/^the contents of the file (.+\.[a-z]{3,4}) are returned as byte stream$/, (filePath: string) => {

    const returnedFileContents = DataRegistry.getResponse();
    const expectedFileContents = fs.readFileSync(`${uploadPath}/${filePath}`);

    expect(returnedFileContents.data).toBe(expectedFileContents.toString());
});

Then(/^the ([A-Za-z-]+) header contains "(.*)"$/, (header: string, value: string) => {

    const response = DataRegistry.getResponse();

    expect((response.headers as AxiosResponseHeaders).get(header)).toBe(value);
});
