import ConfigurationProvider from "@app/core/config/configuration-provider";
import LoggerFactory from "@app/helper/logger-factory";
import { ExpressToken } from "@app/helper/typedi-tokens";
import ControllerRegistration from "@app/web/controller-registration";
import { errorHandlerMiddleware, requestTrackingMiddleware } from "@app/web/utility/middleware";
import { Express, json } from "express";
import { Inject, Service } from "typedi";

/**
 * Service start-up entry point for Leaflet Static Resource Server application.
 */
@Service()
export default class LeafletStaticResourceServerApplication {

    private readonly logger = LoggerFactory.getLogger(LeafletStaticResourceServerApplication);

    private readonly configurationProvider: ConfigurationProvider;
    private readonly express: Express;
    private readonly controllerRegistration: ControllerRegistration;

    constructor(@Inject() configurationProvider: ConfigurationProvider, @Inject(ExpressToken) express: Express,
                @Inject() controllerRegistration: ControllerRegistration) {
        this.configurationProvider = configurationProvider;
        this.express = express;
        this.controllerRegistration = controllerRegistration;
    }

    /**
     * Starts the application.
     */
    public run(version: string): void {

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
