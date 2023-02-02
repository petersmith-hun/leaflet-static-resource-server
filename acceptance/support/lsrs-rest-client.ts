import axios, {AxiosHeaders, AxiosRequestConfig, AxiosResponse} from "axios";
import {expect} from "expect";
import FormData from "form-data";
import ConfigurationProvider from "../../src/lsrs/core/config/configuration-provider";
import {UploadedFileUpdateAttributes} from "../../src/lsrs/core/model/uploaded-file";
import {HealthResponse, InfoResponse} from "../../src/lsrs/web/model/actuator";
import {DirectoryCreationRequestModel, FileListModel, FileModel} from "../../src/lsrs/web/model/files";
import DataRegistry from "./data-registry";
import {Attribute} from "./test-constants";

/**
 * REST client implementation for calling LSRS during Cucumber test execution.
 */
export default class LSRSRestClient {

    private static instance: LSRSRestClient;
    private readonly baseURL: string;

    private constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Calls the GET /actuator/info endpoint and returns its response.
     */
    public async callActuatorInfoEndpoint(): Promise<AxiosResponse<InfoResponse>> {
        return await this.axiosGet("actuator/info");
    }

    /**
     * Calls the GET /actuator/health endpoint and returns its response.
     */
    public async callActuatorHealthEndpoint(): Promise<AxiosResponse<HealthResponse>> {
        return await this.axiosGet("actuator/health");
    }

    /**
     * Calls the GET /files endpoint and returns its response.
     */
    public async callGetUploadedFilesEndpoint(): Promise<AxiosResponse<FileListModel>> {
        return await this.axiosGet("files");
    }

    /**
     * Calls the GET /files/directories endpoint and returns its response.
     */
    public async callGetDirectoriesEndpoint(): Promise<AxiosResponse<FileListModel>> {
        return await this.axiosGet("files/directories");
    }

    /**
     * Calls the GET /files/:pathUUID endpoint and returns its response.
     */
    public async callGetFileDetailsEndpoint(): Promise<AxiosResponse<FileModel>> {

        const pathUUID: string = DataRegistry.get(Attribute.PATH_UUID);
        expect(pathUUID.includes("/")).toBe(false);

        return this.axiosGet(`files/${pathUUID}`);
    }

    /**
     * Calls the GET /files/:pathUUID/:storedFilename endpoint and returns its response.
     */
    public async callDownloadFileEndpoint(): Promise<AxiosResponse<FileModel>> {

        const pathUUID: string = DataRegistry.get(Attribute.PATH_UUID);
        expect(pathUUID.includes("/")).toBe(true);

        return this.axiosGet(`files/${pathUUID}`);
    }

    /**
     * Calls the PUT /files/:pathUUID endpoint and returns its response.
     */
    public async callUpdateFileMetaInfoEndpoint(): Promise<AxiosResponse<FileModel>> {

        const pathUUID = DataRegistry.get(Attribute.PATH_UUID);
        const updateRequest: UploadedFileUpdateAttributes = {
            originalFilename: DataRegistry.get(Attribute.FIELD_ORIGINAL_FILENAME),
            description: DataRegistry.get(Attribute.FIELD_DESCRIPTION)
        };

        return await axios.put(`${this.baseURL}/files/${pathUUID}`, updateRequest, this.getAxiosRequestConfig());
    }

    /**
     * Calls the POST /files endpoint and returns its response.
     */
    public async callUploadFileEndpoint(): Promise<AxiosResponse<FileModel>> {

        const uploadRequest = new FormData();
        if (DataRegistry.get(Attribute.FIELD_INPUT_FILE)) {
            uploadRequest.append(Attribute.FIELD_INPUT_FILE, DataRegistry.get(Attribute.FIELD_INPUT_FILE), DataRegistry.get(Attribute.FIELD_ORIGINAL_FILENAME));
        }
        uploadRequest.append(Attribute.FIELD_SUBFOLDER, DataRegistry.get(Attribute.FIELD_SUBFOLDER) ?? "");
        uploadRequest.append(Attribute.FIELD_DESCRIPTION, DataRegistry.get(Attribute.FIELD_DESCRIPTION) ?? "");

        const requestConfig = this.getAxiosRequestConfig(uploadRequest.getHeaders());
        requestConfig.transformRequest = axios.defaults.transformRequest;
        requestConfig.transformResponse = axios.defaults.transformResponse;

        return await axios.postForm(`${this.baseURL}/files`, uploadRequest, requestConfig);
    }

    /**
     * Calls the POST /files/directories endpoint and returns its response.
     */
    public async callCreateDirectoryEndpoint(): Promise<AxiosResponse<FileModel>> {

        const createDirectoryRequest: { [key in keyof DirectoryCreationRequestModel]: string } = {
            parent: DataRegistry.get(Attribute.FIELD_PARENT),
            name: DataRegistry.get(Attribute.FIELD_NAME)
        };

        return await axios.post(`${this.baseURL}/files/directories`, createDirectoryRequest, this.getAxiosRequestConfig());
    }

    /**
     * Calls the DELETE /files/:pathUUID endpoint and returns its response.
     */
    public async callDeleteFileEndpoint(): Promise<AxiosResponse<FileModel>> {

        const pathUUID = DataRegistry.get(Attribute.PATH_UUID);

        return await axios.delete(`${this.baseURL}/files/${pathUUID}`, this.getAxiosRequestConfig());
    }

    /**
     * Returns the initialized LSRSRestClient instance (initializes first if needed).
     */
    public static async getInstance(): Promise<LSRSRestClient> {

        if (!LSRSRestClient.instance) {
            const serverConfig = (new ConfigurationProvider).getServerConfig();
            const baseURL = `http://${serverConfig.host}:${serverConfig.port}${serverConfig.contextPath}`;
            LSRSRestClient.instance = new LSRSRestClient(baseURL);
        }

        return LSRSRestClient.instance;
    }

    private axiosGet<Type>(path: string): Promise<AxiosResponse<Type>> {
        return axios.get(`${this.baseURL}/${path}`, this.getAxiosRequestConfig());
    }

    private getAxiosRequestConfig(additionalHeaders: object = {}): AxiosRequestConfig {

        const headers = new AxiosHeaders();
        this.addHeaders(headers, DataRegistry.get(Attribute.AUTHORIZATION_HEADER) ?? {});
        this.addHeaders(headers, additionalHeaders);

        return {
            validateStatus: () => true,
            headers: headers
        };
    }

    private addHeaders(headers: AxiosHeaders, source: object) {

        for (let key in source) {
            headers.set(key, source[key as keyof typeof source]);
        }
    }
}
