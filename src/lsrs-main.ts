import "reflect-metadata";
import DatasourceConfiguration from "@app/core/config/datasource-configuration";
import FileStorageConfiguration from "@app/core/config/file-storage-configuration";
import { Configuration } from "@app/helper/common-utilities";
import LoggerFactory from "@app/helper/logger-factory";
import { BuildTimeToken, ConfigurationToken, ExpressToken, VersionToken } from "@app/helper/typedi-tokens";
import LeafletStaticResourceServerApplication from "@app/leaflet-static-resource-server-application";
import ActuatorController from "@app/web/controller/actuator-controller";
import FilesController from "@app/web/controller/files-controller";
import { buildTime } from "@build-time";
import { version } from "@package";
import express, { Express } from "express";
import { Container } from "typedi";

Container.set<Express>(ExpressToken, express());
Container.set<string>(VersionToken, version);
Container.set<string>(BuildTimeToken, buildTime);

Container.import([
    ActuatorController,
    FilesController,
    DatasourceConfiguration,
    FileStorageConfiguration
]);

Container.getMany<Configuration>(ConfigurationToken)
    .forEach(async configuration => {
        try {
            await configuration.init();
        } catch (error) {
            // @ts-ignore
            LoggerFactory.getLogger("main").error(error?.message);
            process.exit(1);
        }
    });

Container
    .get(LeafletStaticResourceServerApplication)
    .run(version);
