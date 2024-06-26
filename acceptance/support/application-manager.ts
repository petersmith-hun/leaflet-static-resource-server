import { uploadPath } from "@acceptance/support/init";
import { TestData } from "@acceptance/support/test-constants";
import { LogLevel } from "@app/core/config/configuration-provider";
import * as fs from "fs";
import { ILogObj, Logger } from "tslog";

/**
 * Utilities for managing LSRS while executing the Cucumber acceptance tests.
 */
export default class ApplicationManager {

    private static readonly startUpTimeout = 5000;
    private static readonly logger = new Logger<ILogObj>({
        name: "Cucumber | ApplicationManager",
        minLevel: LogLevel.debug,
        hideLogPositionForProduction: true
    });

    private static started: boolean = false;

    /**
     * Starts up LSRS. Returns immediately if the application is already running.
     */
    public static async start(): Promise<void> {

        return new Promise((resolve) => {

            if (this.started) {
                this.notifyStarted(resolve, "Application is already loaded");
            } else {

                this.logger.info(`Starting application with environment=${process.env.NODE_ENV}...`);

                this.started = true;
                import("../../src/lsrs-main");

                setTimeout(() => {
                    this.prepareMockStorage();
                    this.notifyStarted(resolve, "Assuming application is now running");
                }, this.startUpTimeout);
            }
        });
    }

    /**
     * Creates the required mock folders and files for test execution.
     */
    public static prepareMockStorage() {

        this.clearAcceptorRoot("images");
        this.clearAcceptorRoot("files");
        this.prepareMockFolders();
        this.prepareMockFiles();
    }
    /**
     * Removes the temporary storage folder.
     */
    public static cleanUp(basePath = uploadPath): void {

        fs.rmSync(basePath, {recursive: true, force: true});
        this.logger.info(`Removed temporary storage folder (${basePath})`);
    }

    private static clearAcceptorRoot(acceptor: string) {

        fs.readdirSync(`${uploadPath}/${acceptor}`)
            .map(subFolder => `${uploadPath}/${acceptor}/${subFolder}`)
            .forEach(absolutePath => this.cleanUp(absolutePath));
    }

    private static notifyStarted(resolve: () => void, message: string) {

        this.logger.info(message);
        resolve();
    }

    private static prepareMockFiles() {

        this.createTestFiles(TestData.files, (filename) => {
            const content = filename.replace(uploadPath, "");
            fs.writeFileSync(filename, Buffer.from(content));
        });
        this.logger.info("Created mock files");
    }

    private static prepareMockFolders() {

        this.createTestFiles(TestData.subFolders, (filename) => fs.mkdirSync(filename, {mode: "0777"}));
        this.logger.info("Created mock storage folders");
    }

    private static createTestFiles(items: string[], factoryFunction: (path: string) => void) {

        items
            .map(item => `${uploadPath}/${item}`)
            .filter(itemPath => !fs.existsSync(itemPath))
            .forEach(factoryFunction);
    }
}
