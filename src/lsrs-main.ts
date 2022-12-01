import "reflect-metadata";
import express, {Express} from "express";
import {Container} from "typedi";
import {version} from "../package.json";
import {ExpressToken, VersionToken} from "./lsrs/helper/typedi-tokens";
import LeafletStaticResourceServerApplication from "./lsrs/leaflet-static-resource-server-application";
import ActuatorController from "./lsrs/web/controller/actuator-controller";

Container.set<Express>(ExpressToken, express());
Container.set<string>(VersionToken, version);

Container.import([
    ActuatorController
])

Container
    .get(LeafletStaticResourceServerApplication)
    .run(version);
