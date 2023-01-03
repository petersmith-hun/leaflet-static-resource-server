import * as fs from "fs";
import path from "path";
import {Logger} from "tslog";
import {Inject, Service} from "typedi";
import {Configuration} from "../../helper/common-utilities";
import LoggerFactory from "../../helper/logger-factory";
import {ConfigurationToken} from "../../helper/typedi-tokens";
import {GenericError} from "../error/error-types";
import ConfigurationProvider, {Acceptor, StorageConfig} from "./configuration-provider";

/**
 * Configuration for creating the file storage of LSRS.
 * Creates the storage root and acceptor root folders and sets the permission for them.
 */
@Service({multiple: true, id: ConfigurationToken})
export default class FileStorageConfiguration implements Configuration {

    private readonly logger: Logger = LoggerFactory.getLogger(FileStorageConfiguration);
    private readonly storageConfig: StorageConfig;

    constructor(@Inject() configurationProvider: ConfigurationProvider) {
        this.storageConfig = configurationProvider.getStorageConfig();
    }

    init(): void {
        const storageRootPath = this.storageConfig.uploadPath;
        const permission = this.storageConfig.permission;

        this.attachStorageRoot(storageRootPath, permission);
        this.attachAcceptorRoots(storageRootPath, permission, this.storageConfig.acceptors);
    }

    private attachStorageRoot(uploadPath: string, permission: number, description: string = 'storage root') {

        this.ensureStorageRoot(uploadPath, permission, description);
        this.ensureAccess(uploadPath, description);

        this.logger.info(`Directory ${description} attached at ${uploadPath}`);
    }

    private ensureStorageRoot(uploadPath: string, permission: number, description: string) {

        if (!fs.existsSync(uploadPath)) {
            this.logger.warn(`Directory ${description} does not exist. Trying to create...`);
            try {
                fs.mkdirSync(uploadPath, permission);
                this.logger.info(`Directory ${description} created at ${uploadPath}`);
            } catch (error) {
                this.logger.error(`Failed to create ${description}: ${error}`);
                throw new GenericError(`Failed to create ${description} at ${uploadPath}`);
            }
        }
    }

    private ensureAccess(uploadPath: string, description: string) {

        try {
            fs.accessSync(uploadPath, fs.constants.W_OK | fs.constants.R_OK);
        } catch (error) {
            this.logger.error(`Directory ${description} is not accessible: ${error}`);
            throw new GenericError(`Directory ${description} at ${uploadPath} is not accessible`);
        }
    }

    private attachAcceptorRoots(storageRootPath: string, permission: number, acceptors: Acceptor[]) {

        acceptors.forEach(acceptor => {
            const description = `acceptor root '${acceptor.acceptedAs}'`;
            const acceptorRoot = path.join(storageRootPath, acceptor.groupRootDirectory);
            this.attachStorageRoot(acceptorRoot, permission, description);
        });
    }
}
