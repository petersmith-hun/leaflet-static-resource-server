import ConfigurationProvider, {
    configurationProvider,
    DatasourceConfig
} from "@app/core/config/configuration-provider";
import { GenericError } from "@app/core/error/error-types";
import { UploadedFile, uploadedFileModelAttributes } from "@app/core/model/uploaded-file";
import { Configuration } from "@app/helper/common-utilities";
import LoggerFactory from "@app/helper/logger-factory";
import { Sequelize } from "sequelize";

/**
 * Datasource configuration triggered by TypeDI. After configuring the connection, the implementation verifies that the
 * specified database is accessible, and also registers the models. Detecting the database to be inaccessible triggers
 * shutting down the application.
 */
export default class DatasourceConfiguration implements Configuration {

    private readonly logger = LoggerFactory.getLogger(DatasourceConfiguration);
    private readonly datasourceConfig: DatasourceConfig;
    private sequelize!: Sequelize;

    constructor(configurationProvider: ConfigurationProvider) {
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

export const datasourceConfiguration = new DatasourceConfiguration(configurationProvider);
