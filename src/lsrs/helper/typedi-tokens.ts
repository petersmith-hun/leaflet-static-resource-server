import {Express} from "express";
import {Token} from "typedi";
import {Controller} from "../web/controller/controller";

export const ExpressToken = new Token<Express>("express");
export const ControllerToken = new Token<Controller>("controllers");
export const VersionToken = new Token<string>("version");
