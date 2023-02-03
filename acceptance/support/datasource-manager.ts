import * as fs from "fs";
import {Sequelize} from "sequelize";
import {Logger} from "tslog";
import ConfigurationProvider from "../../src/lsrs/core/config/configuration-provider";

/**
 * Utilities for handling the mocked database during Cucumber test execution.
 */
export default class DatasourceManager {

    private static readonly logger: Logger = new Logger({
        name: "Cucumber | DatabaseManager",
        minLevel: "debug",
        displayFunctionName: false,
        displayFilePath: "hidden"
    });

    private static readonly scripts = new Map<string, string>();
    private static sequelize: Sequelize;

    /**
     * Initializes a Sequelize connection for test related database operations.
     */
    public static async reInitDatabase(): Promise<void> {

        await this.prepareSequelize();
        await this.dropDatabase();
        await this.initDatabase();

        this.logger.info("Database re-initialized");
    }

    private static async prepareSequelize() {

        if (this.sequelize) {
            return;
        }

        this.logger.info("Initializing Sequelize...");
        const configurationProvider = new ConfigurationProvider();
        const datasourceConfig = configurationProvider.getDatasourceConfig();

        this.sequelize = new Sequelize(datasourceConfig.uri, {
            username: datasourceConfig.username,
            password: datasourceConfig.password,
            logging: false
        });

        await this.sequelize.authenticate();

        this.logger.info("Sequelize initialized");
    }

    private static async dropDatabase() {

        this.logger.info("Dropping existing database...");
        await this.sequelize.query(this.getScript("drop"));
        this.logger.info("Database dropped");
    }

    private static async initDatabase() {

        this.logger.info("Initializing database structure...");
        await this.sequelize.query(this.getScript("schema"));

        this.logger.info("Inserting test records...");
        await this.sequelize.query(this.getScript("data"));

        this.logger.info("Database initialized");
    }

    private static getScript(script: "schema" | "data" | "drop") {

        if (!this.scripts.has(script)) {
            this.scripts.set(script, fs.readFileSync(`./acceptance/support/sql/${script}.sql`).toString());
        }

        return this.scripts.get(script)!;
    }
}
