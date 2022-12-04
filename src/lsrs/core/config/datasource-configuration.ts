import {Sequelize} from "sequelize";
import {Logger} from "tslog";
import {Inject, Service} from "typedi";
import LoggerFactory from "../../helper/logger-factory";
import {GenericError} from "../error/error-types";
import {UploadedFile, uploadedFileModelAttributes} from "../model/uploaded-file";
import ConfigurationProvider from "./configuration-provider";

/**
 * Datasource configuration triggered by TypeDI. After configuring the connection, the implementation verifies that the
 * specified database is accessible, and also registers the models. Detecting the database to be inaccessible triggers
 * shutting down the application.
 */
@Service({eager: true})
export default class DatasourceConfiguration {

    private readonly logger: Logger = LoggerFactory.getLogger(DatasourceConfiguration);
    private readonly sequelize: Sequelize;

    constructor(@Inject() configurationProvider: ConfigurationProvider) {

        const datasourceConfig = configurationProvider.getDatasourceConfig();
        this.sequelize = new Sequelize(datasourceConfig.uri, {
            username: datasourceConfig.username,
            password: datasourceConfig.password,
            logging: datasourceConfig.logging
        });

        this.checkConnection();
        this.initUploadedFileModel();
    }

    private checkConnection(): void {

        this.sequelize.authenticate()
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
