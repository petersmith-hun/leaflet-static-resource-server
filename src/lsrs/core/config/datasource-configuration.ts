import {Sequelize} from "sequelize";
import {Logger} from "tslog";
import {Inject, Service} from "typedi";
import {Configuration} from "../../helper/common-utilities";
import LoggerFactory from "../../helper/logger-factory";
import {ConfigurationToken} from "../../helper/typedi-tokens";
import {GenericError} from "../error/error-types";
import {UploadedFile, uploadedFileModelAttributes} from "../model/uploaded-file";
import ConfigurationProvider, {DatasourceConfig} from "./configuration-provider";

/**
 * Datasource configuration triggered by TypeDI. After configuring the connection, the implementation verifies that the
 * specified database is accessible, and also registers the models. Detecting the database to be inaccessible triggers
 * shutting down the application.
 */
@Service({multiple: true, id: ConfigurationToken})
export default class DatasourceConfiguration implements Configuration {

    private readonly logger: Logger = LoggerFactory.getLogger(DatasourceConfiguration);
    private readonly datasourceConfig: DatasourceConfig;
    private sequelize!: Sequelize;

    constructor(@Inject() configurationProvider: ConfigurationProvider) {
        this.datasourceConfig = configurationProvider.getDatasourceConfig();
    }

    async init(): Promise<void> {

        this.sequelize = new Sequelize(this.datasourceConfig.uri, {
            username: this.datasourceConfig.username,
            password: this.datasourceConfig.password,
            logging: this.datasourceConfig.logging
        });

        await this.checkConnection();
        this.initUploadedFileModel();

        return Promise.resolve();
    }

    private checkConnection(): Promise<unknown> {

        return this.sequelize.authenticate()
            .then(() => this.logger.info(`Connected to datasource ${this.sequelize.getDialect()}/${this.sequelize.getDatabaseName()}`))
            .catch(reason => {
                throw new GenericError(`Failed to connect to the database: ${reason}`);
            });
    }

    private initUploadedFileModel(): void {

        UploadedFile.init(uploadedFileModelAttributes, {
            sequelize: this.sequelize,
            tableName: "leaflet_uploaded_files",
            updatedAt: false});
    }
}
