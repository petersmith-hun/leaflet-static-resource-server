import "reflect-metadata";
import express, {Express} from "express";
import {Container} from "typedi";
import {buildTime} from "../build-time.json";
import {version} from "../package.json";
import DatasourceConfiguration from "./lsrs/core/config/datasource-configuration";
import FileStorageConfiguration from "./lsrs/core/config/file-storage-configuration";
import {Configuration} from "./lsrs/helper/common-utilities";
import LoggerFactory from "./lsrs/helper/logger-factory";
import {BuildTimeToken, ConfigurationToken, ExpressToken, VersionToken} from "./lsrs/helper/typedi-tokens";
import LeafletStaticResourceServerApplication from "./lsrs/leaflet-static-resource-server-application";
import ActuatorController from "./lsrs/web/controller/actuator-controller";
import FilesController from "./lsrs/web/controller/files-controller";

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
