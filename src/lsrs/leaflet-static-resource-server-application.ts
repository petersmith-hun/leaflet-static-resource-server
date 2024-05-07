import ConfigurationProvider, { configurationProvider } from "@app/core/config/configuration-provider";
import LoggerFactory from "@app/helper/logger-factory";
import ControllerRegistration, { controllerRegistration } from "@app/web/controller-registration";
import { errorHandlerMiddleware, requestTrackingMiddleware } from "@app/web/utility/middleware";
import { version } from "@package";
import express, { Express, json } from "express";

/**
 * Service start-up entry point for Leaflet Static Resource Server application.
 */
export default class LeafletStaticResourceServerApplication {

    private readonly logger = LoggerFactory.getLogger(LeafletStaticResourceServerApplication);

    private readonly configurationProvider: ConfigurationProvider;
    private readonly express: Express;
    private readonly controllerRegistration: ControllerRegistration;

    constructor(configurationProvider: ConfigurationProvider, express: Express,
                controllerRegistration: ControllerRegistration) {
        this.configurationProvider = configurationProvider;
        this.express = express;
        this.controllerRegistration = controllerRegistration;
    }

    /**
     * Starts the application.
     */
    public run(): void {

        const serverConfig = this.configurationProvider.getServerConfig();

        this.express
            .use(json())
            .use(requestTrackingMiddleware)
            .use(serverConfig.contextPath, this.controllerRegistration.registerRoutes())
            .use(errorHandlerMiddleware)
            .listen(serverConfig.port, serverConfig.host, () => {
                this.logger.info(`Leaflet Static Resource Server (v${version}) application is listening at http://${serverConfig.host}:${serverConfig.port}/`)
            });
    }
}

export const leafletStaticResourceServerApplication =
    new LeafletStaticResourceServerApplication(configurationProvider, express(), controllerRegistration);
