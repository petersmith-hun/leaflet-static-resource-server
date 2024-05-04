import { Configuration } from "@app/helper/common-utilities";
import { Controller } from "@app/web/controller/controller";
import { Express } from "express";
import { Token } from "typedi";

export const ExpressToken = new Token<Express>("express");
export const ControllerToken = new Token<Controller>("controllers");
export const ConfigurationToken = new Token<Configuration>("configurations");
export const VersionToken = new Token<string>("version");
export const BuildTimeToken = new Token<string>("buildTime");
