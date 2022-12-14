import "reflect-metadata";
import express, {Express} from "express";
import {Container} from "typedi";
import {version} from "../package.json";
import DatasourceConfiguration from "./lsrs/core/config/datasource-configuration";
import FileStorageConfiguration from "./lsrs/core/config/file-storage-configuration";
import {Configuration} from "./lsrs/helper/common-utilities";
import {ConfigurationToken, ExpressToken, VersionToken} from "./lsrs/helper/typedi-tokens";
import LeafletStaticResourceServerApplication from "./lsrs/leaflet-static-resource-server-application";
import ActuatorController from "./lsrs/web/controller/actuator-controller";
import FilesController from "./lsrs/web/controller/files-controller";

Container.set<Express>(ExpressToken, express());
Container.set<string>(VersionToken, version);

Container.import([
    ActuatorController,
    FilesController,
    DatasourceConfiguration,
    FileStorageConfiguration
]);

Container.getMany<Configuration>(ConfigurationToken)
    .forEach(configuration => configuration.init());

Container
    .get(LeafletStaticResourceServerApplication)
    .run(version);
